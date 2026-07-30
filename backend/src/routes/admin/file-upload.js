const express = require('express');
const multer = require('multer');
const { isR2Configured, missingVariables, uploadBuffer } = require('../../utils/r2');

const router = express.Router();

if (isR2Configured) {
  console.log('🪣 Cloudflare R2 media storage: ACTIVE');
} else {
  console.warn(`⚠️  Cloudflare R2 media storage is not configured. Missing: ${missingVariables.join(', ')}`);
}

function requireR2(req, res, next) {
  if (isR2Configured) return next();
  return res.status(503).json({
    success: false,
    message: 'Media storage is not configured. Add the R2_* variables to the backend environment.',
  });
}

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') return cb(null, true);
    return cb(new Error('Only PDF files are allowed!'), false);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

const imageUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    if (allowedMimes.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Only JPEG, PNG, GIF, WebP, and BMP images are allowed!'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/upload-pdf', requireR2, pdfUpload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const result = await uploadBuffer({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      contentType: req.file.mimetype,
      folder: 'pdfs',
    });

    return res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: result.url,
        originalName: req.file.originalname,
        size: req.file.size,
        storage: 'r2',
      },
    });
  } catch (error) {
    console.error('R2 PDF upload error:', error.message);
    return res.status(500).json({ success: false, message: 'File upload failed', error: error.message });
  }
});

router.post('/upload-image', requireR2, imageUpload.single('upload'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: { message: 'No file uploaded' } });

    const result = await uploadBuffer({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      contentType: req.file.mimetype,
      folder: req.body.folder || 'images',
    });

    // CKEditor and the shared admin image uploader both consume this URL.
    return res.json({ url: result.url, storage: 'r2' });
  } catch (error) {
    console.error('R2 image upload error:', error.message);
    return res.status(500).json({ error: { message: error.message || 'Image upload failed' } });
  }
});

module.exports = router;
