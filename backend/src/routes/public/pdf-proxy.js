const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
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
 * Extract filename from Cloudinary URL (e.g., "exam-guide-2024.pdf")
 */
function extractFilenameFromUrl(url) {
  const urlPath = url.split('?')[0];
  const filename = urlPath.split('/').pop() || 'document.pdf';
  return filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
}

/**
 * Serve PDF from local uploads folder
 * Used as fallback if Cloudinary fails
 */
function serveLocalPdf(res, filename) {
  const localPath = path.join(__dirname, '../../uploads/pdfs', filename);
  
  console.log('📂 Trying local fallback:', localPath);
  
  if (!fs.existsSync(localPath)) {
    console.error('❌ Local file not found:', localPath);
    return false;
  }

  try {
    const stats = fs.statSync(localPath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');

    console.log('✅ Serving PDF from local storage:', filename);
    fs.createReadStream(localPath).pipe(res);
    return true;
  } catch (err) {
    console.error('❌ Error serving local PDF:', err.message);
    return false;
  }
}

/**
 * GET /api/public/pdf-proxy?url=ENCODED_PDF_URL
 *
 * Streams PDF from source with these fallbacks:
 * 1. Try Cloudinary signed URL
 * 2. If Cloudinary fails (404, timeout, etc), try local uploads folder
 * 3. If both fail, return clear error with diagnosis
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

  const filename = extractFilenameFromUrl(decodedUrl);

  try {
    let fetchUrl = decodedUrl;
    let isCloudinary = false;

    // ── For Cloudinary URLs: generate a signed URL using SDK credentials ──────
    if (
      CLOUDINARY_CONFIGURED &&
      decodedUrl.includes('res.cloudinary.com') &&
      decodedUrl.includes('/raw/upload/')
    ) {
      isCloudinary = true;
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

    // ── Try to fetch the PDF ──────────────────────────────────────────────
    try {
      console.log('📥 Fetching PDF from:', fetchUrl.substring(0, 80) + '...');
      const upstream = await axios.get(fetchUrl, {
        responseType: 'stream',
        timeout: 30000,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RajJobs/1.0)' },
        validateStatus: (status) => status < 500, // Don't throw on 4xx, only 5xx
      });

      // Check for 4xx errors (404, 403, etc.)
      if (upstream.status >= 400 && upstream.status < 500) {
        console.warn(`⚠️ Cloudinary returned ${upstream.status}, trying local fallback...`);
        throw new Error(`HTTP ${upstream.status}`);
      }

      // Success - stream the PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Access-Control-Allow-Origin', '*');

      if (upstream.headers['content-length']) {
        res.setHeader('Content-Length', upstream.headers['content-length']);
      }

      console.log('✅ Streaming PDF from source:', filename);
      upstream.data.pipe(res);
      
      upstream.data.on('error', (err) => {
        console.error('❌ Stream error:', err.message);
        if (!res.headersSent) {
          res.status(502).json({ success: false, message: 'Download interrupted' });
        }
      });

    } catch (cloudError) {
      // Cloudinary failed - try local fallback
      console.warn('⚠️ Source fetch failed:', cloudError.message);
      
      if (isCloudinary && serveLocalPdf(res, filename)) {
        return; // Successfully served from local
      }

      // Both failed - return error
      throw cloudError;
    }

  } catch (error) {
    console.error('❌ PDF proxy failed:', error.message);
    
    if (!res.headersSent) {
      res.status(502).json({
        success: false,
        message: error.code === 'ECONNABORTED' 
          ? 'PDF download timeout - file taking too long to fetch'
          : 'Could not fetch PDF from source',
        error: error.message,
      });
    }
  }
});

module.exports = router;
