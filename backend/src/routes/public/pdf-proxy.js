const express = require('express');
const axios = require('axios');

const router = express.Router();

function filenameFromUrl(url) {
  const filename = new URL(url).pathname.split('/').pop() || 'document.pdf';
  return filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
}

// Streams a public PDF (including a public R2 CDN URL) so the browser receives
// an explicit PDF content type instead of downloading an unknown binary file.
router.get('/', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ success: false, message: 'url query param is required' });

  let sourceUrl;
  try {
    sourceUrl = decodeURIComponent(url);
    const parsed = new URL(sourceUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid URL protocol');
  } catch {
    return res.status(400).json({ success: false, message: 'Invalid URL' });
  }

  try {
    const upstream = await axios.get(sourceUrl, {
      responseType: 'stream',
      timeout: 30000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RajJobs/1.0)' },
      validateStatus: (status) => status < 400,
    });
    const filename = filenameFromUrl(sourceUrl);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (upstream.headers['content-length']) res.setHeader('Content-Length', upstream.headers['content-length']);
    upstream.data.pipe(res);
  } catch (error) {
    console.error('PDF proxy failed:', error.message);
    if (!res.headersSent) {
      res.status(502).json({
        success: false,
        message: error.code === 'ECONNABORTED' ? 'PDF download timeout' : 'Could not fetch PDF from source',
      });
    }
  }
});

module.exports = router;
