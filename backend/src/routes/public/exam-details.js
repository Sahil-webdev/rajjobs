const express = require('express');
const router = express.Router();
const ExamDetail = require('../../models/ExamDetail');
const asyncHandler = require('../../utils/asyncHandler');

// @route   GET /api/public/exam-details
// @desc    Get all published exam details (listing page)
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const { category } = req.query;
  
  let query = { status: 'published' };
  if (category) query.category = category;
  
  const examDetails = await ExamDetail.find(query)
    .sort({ updatedAt: -1 })
    .select('title slug category metaDescription updatedAt');
  
  res.json({
    success: true,
    count: examDetails.length,
    data: examDetails
  });
}));

// @route   GET /api/public/exam-details/search
// @desc    Search exam details by title or category
// @access  Public
router.get('/search/:query', asyncHandler(async (req, res) => {
  const searchQuery = req.params.query;
  const limit = parseInt(req.query.limit) || 20;
  
  if (!searchQuery || searchQuery.trim().length < 2) {
    return res.json({
      success: true,
      count: 0,
      data: []
    });
  }
  
  const examDetails = await ExamDetail.find({
    status: 'published',
    $or: [
      { title: { $regex: searchQuery, $options: 'i' } },
      { category: { $regex: searchQuery, $options: 'i' } },
      { metaDescription: { $regex: searchQuery, $options: 'i' } }
    ]
  })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select('title slug category metaDescription updatedAt');
  
  res.json({
    success: true,
    count: examDetails.length,
    data: examDetails,
    query: searchQuery
  });
}));

// @route   GET /api/public/exam-details/:slug/related
// @desc    Get related exam details based on category
// @access  Public
router.get('/:slug/related', asyncHandler(async (req, res) => {
  const currentExam = await ExamDetail.findOne({ 
    slug: req.params.slug,
    status: 'published'
  }).select('category');
  
  if (!currentExam) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }
  
  // Fetch related exams: same category, exclude current exam, limit to 4
  const relatedExams = await ExamDetail.find({
    status: 'published',
    category: currentExam.category,
    slug: { $ne: req.params.slug } // Exclude current exam
  })
    .sort({ updatedAt: -1 })
    .limit(4)
    .select('title slug category metaDescription updatedAt');
  
  res.json({
    success: true,
    count: relatedExams.length,
    data: relatedExams
  });
}));

// @route   GET /api/public/exam-details/:slug
// @desc    Get single exam detail by slug (detail page)
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
