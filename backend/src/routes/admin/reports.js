const express = require('express');
const User = require('../../models/User');
const Course = require('../../models/Course');
const Enrollment = require('../../models/Enrollment');
const Order = require('../../models/Order');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

// GET /api/admin/reports/summary
router.get('/summary', asyncHandler(async (req, res) => {
  const [usersCount, coursesCount, enrollmentsCount, revenueAgg] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments({ status: 'published' }),
    Enrollment.countDocuments({ status: 'active' }),
    Order.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  const revenue = revenueAgg[0]?.total || 0;

  res.json({
    users: usersCount,
    courses: coursesCount,
    activeEnrollments: enrollmentsCount,
    revenue
  });
}));

module.exports = router;
