const express = require('express');
const Banner = require('../../models/Banner');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

// GET /api/public/banners
router.get('/', asyncHandler(async (req, res) => {
  const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).limit(4);
  res.json(banners);
}));

module.exports = router;
