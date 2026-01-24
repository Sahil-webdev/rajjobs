const express = require('express');
const Order = require('../../models/Order');
const User = require('../../models/User');
const Course = require('../../models/Course');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

// GET /api/admin/orders
router.get('/', asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .populate('course', 'title')
    .sort({ createdAt: -1 });
  res.json(orders);
}));

// GET /api/admin/orders/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('course', 'title');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
}));

// PATCH /api/admin/orders/:id/status
router.patch('/:id/status', asyncHandler(async (req, res) => {
  const { status, refundId } = req.body;
  if (!['pending', 'paid', 'refunded', 'failed'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
  const order = await Order.findByIdAndUpdate(req.params.id, { status, refundId }, { new: true });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
}));

module.exports = router;
