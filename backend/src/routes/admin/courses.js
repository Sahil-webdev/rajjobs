const express = require('express');
const Course = require('../../models/Course');
const asyncHandler = require('../../utils/asyncHandler');
const slugify = require('../../utils/slugify');

const router = express.Router();

// GET /api/admin/courses
router.get('/', asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = {};
  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }
  const courses = await Course.find(filter).sort({ createdAt: -1 });
  res.json(courses);
}));

// POST /api/admin/courses
router.post('/', asyncHandler(async (req, res) => {
  const {
    title,
    thumbnailUrl,
    description,
    priceOriginal,
    priceSale,
    categories,
    instructor,
    externalLink
  } = req.body;

  if (!title || !priceOriginal || !priceSale) {
    return res.status(400).json({ message: 'title, priceOriginal, priceSale required' });
  }

  const slug = slugify(title);
  const exists = await Course.findOne({ slug });
  const slugFinal = exists ? `${slug}-${Date.now()}` : slug;

  const course = await Course.create({
    title,
    slug: slugFinal,
    thumbnailUrl,
    description,
    priceOriginal,
    priceSale,
    categories,
    instructor,
    externalLink
  });

  res.status(201).json(course);
}));

// GET /api/admin/courses/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(course);
}));

// PUT /api/admin/courses/:id
router.put('/:id', asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  if (updates.title) {
    const slug = slugify(updates.title);
    updates.slug = `${slug}-${req.params.id.slice(-4)}`;
  }
  const course = await Course.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(course);
}));

// DELETE /api/admin/courses/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json({ ok: true });
}));

module.exports = router;
