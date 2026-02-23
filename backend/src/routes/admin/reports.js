const express = require('express');
const ExamDetail = require('../../models/ExamDetail');
const Banner = require('../../models/Banner');
const Enquiry = require('../../models/Enquiry');
const Notification = require('../../models/Notification');
const TestSeries = require('../../models/TestSeries');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

// GET /api/admin/reports/summary
router.get('/summary', asyncHandler(async (req, res) => {
  const [
    totalExams,
    publishedExams,
    totalBanners,
    activeBanners,
    totalEnquiries,
    pendingEnquiries,
    totalNotifications,
    totalTestSeries,
  ] = await Promise.all([
    ExamDetail.countDocuments(),
    ExamDetail.countDocuments({ status: 'published' }),
    Banner.countDocuments(),
    Banner.countDocuments({ isActive: true }),
    Enquiry.countDocuments(),
    Enquiry.countDocuments({ status: 'pending' }),
    Notification.countDocuments(),
    TestSeries.countDocuments(),
  ]);

  res.json({
    success: true,
    data: {
      exams: { total: totalExams, published: publishedExams },
      banners: { total: totalBanners, active: activeBanners },
      enquiries: { total: totalEnquiries, unread: pendingEnquiries },
      notifications: totalNotifications,
      testSeries: totalTestSeries,
    }
  });
}));

module.exports = router;
