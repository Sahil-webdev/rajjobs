const express = require('express');
const router = express.Router();
const Admin = require('../../models/Admin');
const OTP = require('../../models/OTP');
const { hashPassword } = require('../../utils/hash');
const { sendOTP, generateOTP } = require('../../utils/sms');
const asyncHandler = require('../../utils/asyncHandler');

// Check if initial setup is required (no admin exists)
router.get('/check', asyncHandler(async (req, res) => {
  const adminCount = await Admin.countDocuments();
  res.json({ 
    setupRequired: adminCount === 0,
    message: adminCount === 0 ? 'Initial setup required' : 'Setup already completed'
  });
}));

// Initial setup - Create first super admin
router.post('/create-super-admin', asyncHandler(async (req, res) => {
  // Check if any admin already exists
  const existingAdmin = await Admin.findOne();
  if (existingAdmin) {
    return res.status(400).json({ 
      message: 'Setup already completed. Admin already exists.' 
    });
  }

  const { name, email, password, mobile } = req.body;

  // Validation
  if (!name || !email || !password || !mobile) {
    return res.status(400).json({ 
      message: 'All fields are required: name, email, password, mobile' 
    });
  }

  // Validate mobile number (10 digits)
  if (!/^[6-9]\d{9}$/.test(mobile)) {
    return res.status(400).json({ 
      message: 'Invalid mobile number. Please enter a valid 10-digit Indian mobile number' 
    });
  }

  // Validate email
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ 
      message: 'Invalid email address' 
    });
  }

  // Validate password strength
  if (password.length < 8) {
    return res.status(400).json({ 
      message: 'Password must be at least 8 characters long' 
    });
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create super admin
  const superAdmin = await Admin.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    mobile: mobile.trim(),
    role: 'super_admin',
    isActive: true
  });

  res.status(201).json({
    message: 'Super Admin created successfully! You can now login.',
    admin: {
      id: superAdmin._id,
      name: superAdmin.name,
      email: superAdmin.email,
      role: superAdmin.role
    }
  });
}));

module.exports = router;
