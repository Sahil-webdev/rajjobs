const express = require('express');
const Course = require('../../models/Course');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

// GET /api/public/courses - Get all courses for public website
router.get('/', asyncHandler(async (req, res) => {
  const { limit, search, category } = req.query;
  const filter = {};
  
  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }
  
  if (category) {
    filter.categories = category;
  }

  let query = Course.find(filter).sort({ createdAt: -1 });
  
  if (limit) {
    query = query.limit(parseInt(limit));
  }
  
  const courses = await query;
  res.json(courses);
}));

// GET /api/public/courses/:id - Get single course by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(course);
}));

// GET /api/public/courses/slug/:slug - Get single course by slug
router.get('/slug/:slug', asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug });
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(course);
}));

module.exports = router;
