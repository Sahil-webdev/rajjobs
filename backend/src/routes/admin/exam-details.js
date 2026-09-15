const express = require('express');
const router = express.Router();
const ExamDetail = require('../../models/ExamDetail');
const asyncHandler = require('../../utils/asyncHandler');

function validateJobDetails(jobDetails = {}) {
  if (!jobDetails.isJobPosting) return null;
  if (!String(jobDetails.organizationName || '').trim()) return 'Organization Name is required for a job vacancy.';
  if (!jobDetails.lastDateToApply || Number.isNaN(new Date(jobDetails.lastDateToApply).getTime())) {
    return 'Last Date to Apply is required for a job vacancy.';
  }
  if (jobDetails.startDate && Number.isNaN(new Date(jobDetails.startDate).getTime())) {
    return 'Start Date must be a valid date.';
  }
  if (!Number.isInteger(Number(jobDetails.totalPosts)) || Number(jobDetails.totalPosts) < 1) {
    return 'Total Posts must be at least 1 for a job vacancy.';
  }
  return null;
}

function normalizeFaqs(faqs) {
  if (faqs == null) return { faqs: [] };
  if (!Array.isArray(faqs)) return { error: 'FAQs must be a list.' };
  if (faqs.length > 20) return { error: 'You can add up to 20 FAQs per page.' };

  const cleaned = faqs.map((faq) => ({
    question: String(faq?.question || '').trim(),
    answer: String(faq?.answer || '').trim(),
  }));
  if (cleaned.some((faq) => !faq.question || !faq.answer)) {
    return { error: 'Every FAQ needs both a question and an answer.' };
  }
  return { faqs: cleaned };
}

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
    seoData,
    jobDetails,
    faqs
  } = req.body;

  const jobDetailsError = validateJobDetails(jobDetails);
  if (jobDetailsError) return res.status(400).json({ success: false, message: jobDetailsError });
  const faqResult = normalizeFaqs(faqs);
  if (faqResult.error) return res.status(400).json({ success: false, message: faqResult.error });

  const examDetail = await ExamDetail.create({
    title,
    slug,
    category,
    metaDescription,
    formattedNote,
    status,
    postedBy,
    seoData,
    jobDetails,
    faqs: faqResult.faqs
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
    seoData,
    jobDetails,
    faqs
  } = req.body;

  const jobDetailsError = validateJobDetails(jobDetails);
  if (jobDetailsError) return res.status(400).json({ success: false, message: jobDetailsError });
  const faqResult = normalizeFaqs(faqs);
  if (faqResult.error) return res.status(400).json({ success: false, message: faqResult.error });

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
      seoData,
      jobDetails,
      faqs: faqResult.faqs
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
