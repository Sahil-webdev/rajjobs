const express = require('express');
const Enrollment = require('../../models/Enrollment');
const User = require('../../models/User');
const Course = require('../../models/Course');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

// GET /api/admin/enrollments
router.get('/', asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const enrollments = await Enrollment.find(filter)
    .populate('user', 'name email')
    .populate('course', 'title')
    .sort({ createdAt: -1 });
  res.json(enrollments);
}));

// POST /api/admin/enrollments
router.post('/', asyncHandler(async (req, res) => {
  const { userId, courseId, status, expiresAt } = req.body;
  if (!userId || !courseId) return res.status(400).json({ message: 'userId and courseId required' });
  const user = await User.findById(userId);
  const course = await Course.findById(courseId);
  if (!user || !course) return res.status(404).json({ message: 'User or course not found' });
  const enrollment = await Enrollment.create({ user: userId, course: courseId, status, expiresAt });
  res.status(201).json(enrollment);
}));

// PATCH /api/admin/enrollments/:id/status
router.patch('/:id/status', asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'cancelled', 'refunded'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
  const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
  res.json(enrollment);
}));

module.exports = router;
