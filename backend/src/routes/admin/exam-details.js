const express = require('express');
const router = express.Router();
const ExamDetail = require('../../models/ExamDetail');
const asyncHandler = require('../../utils/asyncHandler');

// @route   GET /api/admin/exam-details
// @desc    Get all exam details (with filters)
// @access  Private/Admin
router.get('/', asyncHandler(async (req, res) => {
  const { category, status, search } = req.query;
  
  let query = {};
  
  if (category) query.category = category;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } }
    ];
  }
  
  const examDetails = await ExamDetail.find(query)
    .sort({ createdAt: -1 })
    .select('title slug category status updatedAt');
  
  res.json({
    success: true,
    count: examDetails.length,
    data: examDetails
  });
}));

// @route   GET /api/admin/exam-details/:id
// @desc    Get single exam detail by ID (for editing)
// @access  Private/Admin
router.get('/:id', asyncHandler(async (req, res) => {
  const examDetail = await ExamDetail.findById(req.params.id);
  
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

// @route   POST /api/admin/exam-details
// @desc    Create new exam detail
// @access  Private/Admin
router.post('/', asyncHandler(async (req, res) => {
  // Extract only allowed fields
  const {
    title,
    slug,
    category,
    metaDescription,
    formattedNote,
    status,
    postedBy,
    seoData
  } = req.body;

  const examDetail = await ExamDetail.create({
    title,
    slug,
    category,
    metaDescription,
    formattedNote,
    status,
    postedBy,
    seoData
  });

  res.status(201).json({
    success: true,
    message: 'Exam detail created successfully',
    data: examDetail
  });
}));

// @route   PUT /api/admin/exam-details/:id
// @desc    Update exam detail
// @access  Private/Admin
router.put('/:id', asyncHandler(async (req, res) => {
  // Extract only allowed fields
  const {
    title,
    slug,
    category,
    metaDescription,
    formattedNote,
    status,
    postedBy,
    seoData
  } = req.body;

  const examDetail = await ExamDetail.findByIdAndUpdate(
    req.params.id,
    {
      title,
      slug,
      category,
      metaDescription,
      formattedNote,
      status,
      postedBy,
      seoData
    },
    { 
      new: true,
      runValidators: true
    }
  );

  if (!examDetail) {
    return res.status(404).json({ 
      success: false, 
      message: 'Exam detail not found' 
    });
  }

  res.json({
    success: true,
    message: 'Exam detail updated successfully',
    data: examDetail
  });
}));

// @route   DELETE /api/admin/exam-details/:id
// @desc    Delete exam detail
// @access  Private/Admin
router.delete('/:id', asyncHandler(async (req, res) => {
  const examDetail = await ExamDetail.findById(req.params.id);
  
  if (!examDetail) {
    return res.status(404).json({
      success: false,
      message: 'Exam detail not found'
    });
  }
  
  await examDetail.deleteOne();
  
  res.json({
    success: true,
    message: 'Exam detail deleted successfully'
  });
}));

// @route   PATCH /api/admin/exam-details/:id/status
// @desc    Toggle exam detail status
// @access  Private/Admin
router.patch('/:id/status', asyncHandler(async (req, res) => {
  const examDetail = await ExamDetail.findById(req.params.id);
  
  if (!examDetail) {
    return res.status(404).json({
      success: false,
      message: 'Exam detail not found'
    });
  }
  
  examDetail.status = examDetail.status === 'published' ? 'draft' : 'published';
  await examDetail.save();
  
  res.json({
    success: true,
    message: `Exam detail ${examDetail.status}`,
    data: examDetail
  });
}));

module.exports = router;
