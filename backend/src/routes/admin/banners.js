const express = require('express');
const Banner = require('../../models/Banner');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

// GET /api/admin/banners
router.get('/', asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort({ order: 1 });
  res.json(banners);
}));

// POST /api/admin/banners (set banner at position)
router.post('/', asyncHandler(async (req, res) => {
  const { imageUrl, order } = req.body;
  if (!imageUrl || !order) return res.status(400).json({ message: 'imageUrl and order required' });
  if (![1, 2, 3, 4].includes(order)) return res.status(400).json({ message: 'order must be 1, 2, 3, or 4' });
  
  const banner = await Banner.findOneAndUpdate(
    { order },
    { imageUrl, order },
    { upsert: true, new: true }
  );
  res.status(201).json(banner);
}));

// PUT /api/admin/banners/:order (update specific position)
router.put('/:order', asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;
  const order = Number(req.params.order);
  if (!imageUrl) return res.status(400).json({ message: 'imageUrl required' });
  if (![1, 2, 3, 4].includes(order)) return res.status(400).json({ message: 'order must be 1, 2, 3, or 4' });
  
  const banner = await Banner.findOneAndUpdate(
    { order },
    { imageUrl },
    { new: true }
  );
  if (!banner) return res.status(404).json({ message: 'Banner not found' });
  res.json(banner);
}));

// DELETE /api/admin/banners/:order (remove specific position)
router.delete('/:order', asyncHandler(async (req, res) => {
  const order = Number(req.params.order);
  if (![1, 2, 3, 4].includes(order)) return res.status(400).json({ message: 'order must be 1, 2, 3, or 4' });
  
  const banner = await Banner.findOneAndDelete({ order });
  if (!banner) return res.status(404).json({ message: 'Banner not found' });
  res.json({ ok: true });
}));

module.exports = router;
