const express = require('express');
const router = express.Router();
const Enquiry = require('../../models/Enquiry');
const asyncHandler = require('../../utils/asyncHandler');

// POST /api/public/enquiry - Create new enquiry (no authentication required)
router.post('/', asyncHandler(async (req, res) => {
  const { name, mobile, email, message } = req.body;

  // Validation
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Name is required' });
  }

  if (!mobile || !mobile.trim()) {
    return res.status(400).json({ message: 'Mobile number is required' });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({ message: 'Email is required' });
  }

  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Message is required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Validate mobile number (10 digits)
  const mobileRegex = /^[0-9]{10}$/;
  if (!mobileRegex.test(mobile.replace(/\s/g, ''))) {
    return res.status(400).json({ message: 'Mobile number must be 10 digits' });
  }

  // Create enquiry
  const enquiry = new Enquiry({
    name: name.trim(),
    mobile: mobile.trim(),
    email: email.trim(),
    message: message.trim(),
    status: 'pending',
  });

  await enquiry.save();

  console.log('📧 New enquiry received:', {
    name: enquiry.name,
    mobile: enquiry.mobile,
    email: enquiry.email,
  });

  res.status(201).json({
    success: true,
    message: 'Thank you! We will contact you soon.',
  });
}));

module.exports = router;
