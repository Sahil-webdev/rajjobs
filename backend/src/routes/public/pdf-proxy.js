const express = require('express');
const axios = require('axios');
const router = express.Router();

/**
 * GET /api/public/pdf-proxy?url=ENCODED_PDF_URL
 *
 * Fetches a PDF from any URL (Cloudinary, RBI, etc.) and serves it to the
 * browser with Content-Type: application/pdf + Content-Disposition: inline.
 * This is exactly how major job portals (freejobalert, sarkariresult, etc.)
 * open PDFs — they proxy through their own server so the browser always
 * sees a proper PDF content-type and opens it inline in a new tab.
 */
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
