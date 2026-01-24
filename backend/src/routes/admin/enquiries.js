const express = require('express');
const router = express.Router();
const Enquiry = require('../../models/Enquiry');
const asyncHandler = require('../../utils/asyncHandler');

// GET /api/admin/enquiries - Get all enquiries with filters
router.get('/', asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 50 } = req.query;

  const query = {};

  // Filter by status
  if (status && status !== 'all') {
    query.status = status;
  }

  // Search by name, email, or mobile
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const enquiries = await Enquiry.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Enquiry.countDocuments(query);

  // Get counts by status
  const statusCounts = await Enquiry.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const counts = {
    pending: 0,
    contacted: 0,
    resolved: 0,
    all: total,
  };

  statusCounts.forEach((item) => {
    counts[item._id] = item.count;
  });

  res.status(200).json({
    enquiries,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    },
    counts,
  });
}));

// GET /api/admin/enquiries/:id - Get single enquiry
router.get('/:id', asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);

  if (!enquiry) {
    return res.status(404).json({ message: 'Enquiry not found' });
  }

  res.status(200).json(enquiry);
}));

// PUT /api/admin/enquiries/:id - Update enquiry status
router.put('/:id', asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status || !['pending', 'contacted', 'resolved'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  const enquiry = await Enquiry.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!enquiry) {
    return res.status(404).json({ message: 'Enquiry not found' });
  }

  res.status(200).json({
    message: 'Enquiry status updated successfully',
    enquiry,
  });
}));

// DELETE /api/admin/enquiries/:id - Delete enquiry
router.delete('/:id', asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndDelete(req.params.id);

  if (!enquiry) {
    return res.status(404).json({ message: 'Enquiry not found' });
  }

  res.status(200).json({ message: 'Enquiry deleted successfully' });
}));

module.exports = router;
