const express = require('express');
const router = express.Router();
const Admin = require('../../models/Admin');
const { hashPassword, verifyPassword } = require('../../utils/hash');
const asyncHandler = require('../../utils/asyncHandler');

// Get current admin profile
router.get('/me', asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin.id).select('-password -refreshTokenHash');
  
  if (!admin) {
    return res.status(404).json({ message: 'Admin not found' });
  }

  res.json(admin);
}));

// Update profile (name, email, mobile)
router.put('/update', asyncHandler(async (req, res) => {
  const { name, email, mobile } = req.body;
  
  const admin = await Admin.findById(req.admin.id);
  
  if (!admin) {
    return res.status(404).json({ message: 'Admin not found' });
  }

  // Update fields if provided
  if (name) admin.name = name.trim();
  
  if (email) {
    // Validate email
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }
    
    // Check if email already exists (for other admin)
    const existingAdmin = await Admin.findOne({ 
      email: email.toLowerCase().trim(),
      _id: { $ne: req.admin.id }
    });
    
    if (existingAdmin) {
      return res.status(400).json({ message: 'Email already in use by another admin' });
    }
    
    admin.email = email.toLowerCase().trim();
  }
  
  if (mobile) {
    // Validate mobile
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({ 
        message: 'Invalid mobile number. Please enter a valid 10-digit number' 
      });
    }
    
    // Check if mobile already exists (for other admin)
    const existingAdmin = await Admin.findOne({ 
      mobile: mobile.trim(),
      _id: { $ne: req.admin.id }
    });
    
    if (existingAdmin) {
      return res.status(400).json({ message: 'Mobile number already in use by another admin' });
    }
    
    admin.mobile = mobile.trim();
  }

  await admin.save();

  res.json({
    message: 'Profile updated successfully',
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      mobile: admin.mobile,
      role: admin.role
    }
  });
}));

// Change password
router.put('/change-password', asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ 
      message: 'Current password and new password are required' 
    });
  }

  // Validate new password strength
  if (newPassword.length < 8) {
    return res.status(400).json({ 
      message: 'New password must be at least 8 characters long' 
    });
  }

  const admin = await Admin.findById(req.admin.id);
  
  if (!admin) {
    return res.status(404).json({ message: 'Admin not found' });
  }

  // Verify current password
  const isPasswordValid = await verifyPassword(currentPassword, admin.password);
  
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  admin.password = hashedPassword;
  admin.refreshTokenHash = null; // Invalidate all sessions
  await admin.save();

  res.json({
    message: 'Password changed successfully. Please login again with your new password.',
    success: true
  });
}));

module.exports = router;
