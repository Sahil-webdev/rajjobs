const express = require('express');
const User = require('../../models/User');
const Course = require('../../models/Course');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

// PATCH /api/admin/moderation/users/:id/suspend
router.patch('/users/:id/suspend', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: 'inactive' }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}));

// PATCH /api/admin/moderation/courses/:id/unpublish
router.patch('/courses/:id/unpublish', asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { status: 'draft', publishedAt: undefined },
    { new: true }
  );
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(course);
}));

module.exports = router;
