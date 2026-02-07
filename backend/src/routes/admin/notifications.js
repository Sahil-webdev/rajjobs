const express = require('express');
const Notification = require('../../models/Notification');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

// GET /api/admin/notifications
router.get('/', asyncHandler(async (req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 });
  res.json(notifications);
}));

// POST /api/admin/notifications
router.post('/', asyncHandler(async (req, res) => {
  const { title, category, link, date, isActive } = req.body;
  if (!title || !category || !link) {
    return res.status(400).json({ message: 'title, category and link are required' });
  }
  const notification = await Notification.create({ 
    title, 
    category, 
    link, 
    date: date || new Date(),
    isActive: isActive !== undefined ? isActive : true 
  });
  res.status(201).json(notification);
}));

// PUT /api/admin/notifications/:id
router.put('/:id', asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  res.json(notification);
}));

// DELETE /api/admin/notifications/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  res.json({ ok: true });
}));

module.exports = router;
