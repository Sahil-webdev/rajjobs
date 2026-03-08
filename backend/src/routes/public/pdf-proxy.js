const express = require('express');
const axios = require('axios');
const router = express.Router();

// ── Cloudinary SDK (same config as file-upload.js) ────────────────────────────
let cloudinary = null;
const CLOUDINARY_CONFIGURED =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (CLOUDINARY_CONFIGURED) {
  cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Extract public_id from a Cloudinary URL so we can generate a signed URL.
 * Handles both:
 *   /raw/upload/v123456/rajjobs-pdfs/filename.pdf
 *   /raw/upload/rajjobs-pdfs/filename.pdf  (no version)
 * Returns null for non-Cloudinary URLs.
 */
function extractCloudinaryPublicId(url) {
  // Match /raw/upload/ optionally followed by v{digits}/ then capture the rest
  const match = url.match(/\/raw\/upload\/(?:v\d+\/)?(.+)$/);
  if (!match) return null;
  // Strip .pdf extension — Cloudinary public_ids don't include the extension
  return match[1].replace(/\.pdf$/i, '');
}

/**
 * GET /api/public/pdf-proxy?url=ENCODED_PDF_URL
 *
 * Streams PDF from source (Cloudinary, gov websites, etc) with FORCED DOWNLOAD behavior.
 * 
 * For Cloudinary URLs: generates a fresh signed URL to bypass account-level blocks.
 * Content-Disposition is set to 'attachment' so PDFs download directly instead of
 * trying to open in browser (which often fails due to CORS, signing, or viewer issues).
 */
router.get('/', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ success: false, message: 'url query param is required' });
  }

  let decodedUrl;
  try {
    decodedUrl = decodeURIComponent(url);
    if (!decodedUrl.startsWith('http://') && !decodedUrl.startsWith('https://')) {
      return res.status(400).json({ success: false, message: 'Invalid URL' });
    }
  } catch {
    return res.status(400).json({ success: false, message: 'Malformed URL' });
  }

  try {
    let fetchUrl = decodedUrl;

    // ── For Cloudinary URLs: generate a signed URL using SDK credentials ──────
    if (
      CLOUDINARY_CONFIGURED &&
      decodedUrl.includes('res.cloudinary.com') &&
      decodedUrl.includes('/raw/upload/')
    ) {
      const publicId = extractCloudinaryPublicId(decodedUrl);
      if (publicId) {
        fetchUrl = cloudinary.url(publicId, {
          resource_type: 'raw',
          type: 'upload',
          sign_url: true,
          secure: true,
          expires_at: Math.floor(Date.now() / 1000) + 3600, // valid 1 hour
        });
        console.log('🔗 Generated Cloudinary signed URL for:', publicId);
      }
    }

    // ── Fetch the PDF as a stream ──────────────────────────────────────────
    console.log('📥 Fetching PDF from:', fetchUrl.substring(0, 100) + '...');
    const upstream = await axios.get(fetchUrl, {
      responseType: 'stream',
      timeout: 30000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RajJobs/1.0)' },
    });

    // Get filename for Content-Disposition
    const urlPath = decodedUrl.split('?')[0];
    const filename = urlPath.split('/').pop() || 'document.pdf';
    const safeName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

    // ✅ SET TO 'attachment' — Forces direct download (more reliable than opening in browser)
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (upstream.headers['content-length']) {
      res.setHeader('Content-Length', upstream.headers['content-length']);
    }

    console.log('✅ Streaming PDF:', safeName);
    upstream.data.pipe(res);
    
    upstream.data.on('error', (err) => {
      console.error('❌ Stream error:', err.message);
      if (!res.headersSent) {
        res.status(502).json({ success: false, message: 'Stream interrupted' });
      }
    });

  } catch (error) {
    console.error('❌ PDF proxy error:', error.message);
    if (!res.headersSent) {
      res.status(502).json({
        success: false,
        message: 'Could not fetch PDF from source',
        error: error.message,
      });
    }
  }
});

module.exports = router;
