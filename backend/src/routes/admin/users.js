const express = require('express');
const User = require('../../models/User');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

// GET /api/admin/users
router.get('/', asyncHandler(async (req, res) => {
  const { search, role, status } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json(users);
}));

// POST /api/admin/users
router.post('/', asyncHandler(async (req, res) => {
  const { name, email, phone, role, status } = req.body;
  if (!name || !email) return res.status(400).json({ message: 'name and email required' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'User exists' });
  const user = await User.create({ name, email, phone, role, status });
  res.status(201).json(user);
}));

// PUT /api/admin/users/:id
router.put('/:id', asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}));

// PATCH /api/admin/users/:id/status
router.patch('/:id/status', asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'inactive'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}));

module.exports = router;
