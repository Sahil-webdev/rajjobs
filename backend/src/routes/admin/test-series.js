const express = require('express');
const router = express.Router();
const TestSeries = require('../../models/TestSeries');
const asyncHandler = require('../../utils/asyncHandler');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Helper function to save base64 image
const saveBase64Image = (base64String, uploadDir) => {
  if (!base64String || !base64String.startsWith('data:image')) {
    return null;
  }

  try {
    // Extract base64 data and extension
    const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) return null;

    const ext = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const filename = `test-series-${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Write file
    fs.writeFileSync(filepath, buffer);

    return `/uploads/test-series/${filename}`;
  } catch (error) {
    console.error('Error saving base64 image:', error);
    return null;
  }
};

// Configure multer for thumbnail uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads/test-series');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'test-series-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
  }
});

// Upload thumbnail (no auth needed here, auth is at route level in index.js)
router.post('/upload-thumbnail', upload.single('thumbnail'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  const thumbnailUrl = `/uploads/test-series/${req.file.filename}`;
  res.status(200).json({ 
    message: 'Thumbnail uploaded successfully',
    thumbnailUrl 
  });
}));

// Get all test series (with pagination, no auth needed - auth at route level)
router.get('/', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const testSeries = await TestSeries.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await TestSeries.countDocuments();

  res.status(200).json({
    testSeries,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Get single test series by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const testSeries = await TestSeries.findById(req.params.id);
  
  if (!testSeries) {
    return res.status(404).json({ message: 'Test series not found' });
  }

  res.status(200).json(testSeries);
}));

// Create test series
router.post('/', asyncHandler(async (req, res) => {
  const { title, thumbnailUrl, priceOriginal, priceSale, isFree, externalLink } = req.body;

  // Validation
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }

  if (priceOriginal === undefined || priceSale === undefined) {
    return res.status(400).json({ message: 'Prices are required' });
  }

  if (priceOriginal < 0 || priceSale < 0) {
    return res.status(400).json({ message: 'Prices cannot be negative' });
  }

  // Handle base64 image
  let finalThumbnailUrl = '';
  console.log('📸 Thumbnail received:', thumbnailUrl ? `${thumbnailUrl.substring(0, 50)}...` : 'EMPTY');
  
  if (thumbnailUrl && thumbnailUrl.startsWith('data:image')) {
    console.log('🔄 Converting base64 to file...');
    const uploadDir = path.join(__dirname, '../../../uploads/test-series');
    finalThumbnailUrl = saveBase64Image(thumbnailUrl, uploadDir) || '';
    console.log('✅ Image saved at:', finalThumbnailUrl || 'FAILED');
  } else if (thumbnailUrl && thumbnailUrl.startsWith('/uploads')) {
    finalThumbnailUrl = thumbnailUrl;
    console.log('📁 Using existing upload path:', finalThumbnailUrl);
  } else if (thumbnailUrl && thumbnailUrl.startsWith('http')) {
    finalThumbnailUrl = thumbnailUrl;
    console.log('🌐 Using external URL:', finalThumbnailUrl);
  } else {
    console.log('⚠️ No valid thumbnail URL provided');
  }

  const testSeries = new TestSeries({
    title: title.trim(),
    thumbnailUrl: finalThumbnailUrl,
    priceOriginal,
    priceSale,
    isFree: isFree || false,
    externalLink: externalLink || ''
  });

  await testSeries.save();
  console.log('💾 Test series saved with thumbnailUrl:', testSeries.thumbnailUrl);

  res.status(201).json({
    message: 'Test series created successfully',
    testSeries
  });
}));

// Update test series
router.put('/:id', asyncHandler(async (req, res) => {
  const { title, thumbnailUrl, priceOriginal, priceSale, isFree, externalLink } = req.body;

  const testSeries = await TestSeries.findById(req.params.id);

  if (!testSeries) {
    return res.status(404).json({ message: 'Test series not found' });
  }

  // Update fields
  if (title !== undefined) testSeries.title = title.trim();
  if (priceOriginal !== undefined) testSeries.priceOriginal = priceOriginal;
  if (priceSale !== undefined) testSeries.priceSale = priceSale;
  if (isFree !== undefined) testSeries.isFree = isFree;
  if (externalLink !== undefined) testSeries.externalLink = externalLink;

  // Handle thumbnail update
  if (thumbnailUrl !== undefined) {
    // Delete old thumbnail if it exists and we're replacing it
    if (testSeries.thumbnailUrl && testSeries.thumbnailUrl !== thumbnailUrl) {
      const oldPath = path.join(__dirname, '../../../', testSeries.thumbnailUrl);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (err) {
          console.error('Error deleting old thumbnail:', err);
        }
      }
    }

    // Handle base64 image
    if (thumbnailUrl && thumbnailUrl.startsWith('data:image')) {
      const uploadDir = path.join(__dirname, '../../../uploads/test-series');
      const savedUrl = saveBase64Image(thumbnailUrl, uploadDir);
      testSeries.thumbnailUrl = savedUrl || '';
    } else if (thumbnailUrl && (thumbnailUrl.startsWith('/uploads') || thumbnailUrl.startsWith('http'))) {
      testSeries.thumbnailUrl = thumbnailUrl;
    } else {
      testSeries.thumbnailUrl = '';
    }
  }

  await testSeries.save();

  res.status(200).json({
    message: 'Test series updated successfully',
    testSeries
  });
}));

// Delete test series
router.delete('/:id', asyncHandler(async (req, res) => {
  const testSeries = await TestSeries.findById(req.params.id);

  if (!testSeries) {
    return res.status(404).json({ message: 'Test series not found' });
  }

  // Delete thumbnail file if exists
  if (testSeries.thumbnailUrl) {
    const thumbnailPath = path.join(__dirname, '../../../', testSeries.thumbnailUrl);
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }
  }

  await TestSeries.findByIdAndDelete(req.params.id);

  res.status(200).json({ message: 'Test series deleted successfully' });
}));

module.exports = router;
