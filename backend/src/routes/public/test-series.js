const express = require('express');
const router = express.Router();
const TestSeries = require('../../models/TestSeries');
const asyncHandler = require('../../utils/asyncHandler');

// Get all test series (public)
router.get('/', asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 0;
  const category = req.query.category;
  const search = req.query.search;

  let query = {};

  // Filter by category
  if (category && category !== 'all') {
    query.category = category;
  }

  // Search by title
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  let testSeriesQuery = TestSeries.find(query).sort({ createdAt: -1 });

  if (limit > 0) {
    testSeriesQuery = testSeriesQuery.limit(limit);
  }

  const testSeries = await testSeriesQuery;

  res.status(200).json(testSeries);
}));

// Get single test series by ID (public)
router.get('/:id', asyncHandler(async (req, res) => {
  const testSeries = await TestSeries.findById(req.params.id);

  if (!testSeries) {
    return res.status(404).json({ message: 'Test series not found' });
  }

  res.status(200).json(testSeries);
}));

module.exports = router;
