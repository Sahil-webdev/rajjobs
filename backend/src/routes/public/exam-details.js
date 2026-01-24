const express = require('express');
const router = express.Router();
const ExamDetail = require('../../models/ExamDetail');
const asyncHandler = require('../../utils/asyncHandler');

// @route   GET /api/public/exam-details
// @desc    Get all published exam details
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const { category } = req.query;
  
  let query = { status: 'published' };
  if (category) query.category = category;
  
  const examDetails = await ExamDetail.find(query)
    .sort({ lastUpdated: -1 })
    .select('title slug category metaDescription posterImage lastUpdated');
  
  res.json({
    success: true,
    count: examDetails.length,
    data: examDetails
  });
}));

// @route   GET /api/public/exam-details/:slug
// @desc    Get single exam detail by slug
// @access  Public
router.get('/:slug', asyncHandler(async (req, res) => {
  const examDetail = await ExamDetail.findOne({ 
    slug: req.params.slug,
    status: 'published'
  });
  
  if (!examDetail) {
    return res.status(404).json({
      success: false,
      message: 'Exam detail not found'
    });
  }
  
  res.json({
    success: true,
    data: examDetail
  });
}));

module.exports = router;
