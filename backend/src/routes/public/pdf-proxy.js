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
 * For Cloudinary URLs: generates a fresh signed URL using the SDK (bypasses
 * any account-level access restrictions / 401 errors), then streams the PDF
 * to the browser with Content-Type: application/pdf + Content-Disposition: inline.
 *
 * For non-Cloudinary URLs (e.g. government PDF links): fetches directly.
 *
 * This is how major job portals (freejobalert, sarkariresult) open PDFs —
 * they proxy through their own server so the browser always opens inline.
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
    // This bypasses any account-level delivery restrictions (401 errors).
    if (
      CLOUDINARY_CONFIGURED &&
      decodedUrl.includes('res.cloudinary.com') &&
      decodedUrl.includes('/raw/upload/')
    ) {
      const publicId = extractCloudinaryPublicId(decodedUrl);
      if (publicId) {
        // private_download_url generates a time-limited signed URL that works
        // regardless of account delivery settings
        fetchUrl = cloudinary.utils.private_download_url(publicId, 'pdf', {
          resource_type: 'raw',
          attachment: false,       // serve inline, not as download
          expires_at: Math.floor(Date.now() / 1000) + 3600, // valid 1 hour
        });
      }
    }

    // ── Fetch the PDF as a stream ─────────────────────────────────────────────
    const upstream = await axios.get(fetchUrl, {
      responseType: 'stream',
      timeout: 30000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RajJobs/1.0)' },
    });

    // Get filename for Content-Disposition
    const urlPath = decodedUrl.split('?')[0];
    const filename = urlPath.split('/').pop() || 'document.pdf';
    const safeName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

    // Set headers — browser opens PDF natively (not downloads)
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (upstream.headers['content-length']) {
      res.setHeader('Content-Length', upstream.headers['content-length']);
    }

    upstream.data.pipe(res);
    upstream.data.on('error', () => {
      if (!res.headersSent) res.status(502).end();
    });

  } catch (error) {
    console.error('PDF proxy error:', error.message);
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

router.get('/', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ success: false, message: 'url query param is required' });
  }

  let decodedUrl;
  try {
    decodedUrl = decodeURIComponent(url);
    // Basic validation — must be http/https
    if (!decodedUrl.startsWith('http://') && !decodedUrl.startsWith('https://')) {
      return res.status(400).json({ success: false, message: 'Invalid URL' });
    }
  } catch {
    return res.status(400).json({ success: false, message: 'Malformed URL' });
  }

  try {
    // Fetch the PDF as a stream from the source (Cloudinary, etc.)
    const upstream = await axios.get(decodedUrl, {
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RajJobs/1.0)',
      },
    });

    // Get filename from URL for the Content-Disposition header
    const urlPath = decodedUrl.split('?')[0];
    const filename = urlPath.split('/').pop() || 'document.pdf';
    const safeName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

    // Set headers so browser opens PDF natively (not downloads)
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // cache 1 day
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Forward content-length if available (lets browser show progress)
    if (upstream.headers['content-length']) {
      res.setHeader('Content-Length', upstream.headers['content-length']);
    }

    // Pipe the stream directly to the response
    upstream.data.pipe(res);

    upstream.data.on('error', () => {
      if (!res.headersSent) {
        res.status(502).json({ success: false, message: 'Failed to fetch PDF' });
      }
    });
  } catch (error) {
    console.error('PDF proxy error:', error.message);
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
