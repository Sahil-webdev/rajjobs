const express = require('express');
const router = express.Router();
const Admin = require('../../models/Admin');
const OTP = require('../../models/OTP');
const { hashPassword } = require('../../utils/hash');
const { sendOTP, generateOTP } = require('../../utils/sms');
const asyncHandler = require('../../utils/asyncHandler');

// Step 1: Send OTP to mobile for password reset
router.post('/send-otp', asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ message: 'Mobile number is required' });
  }

  // Validate mobile number
  if (!/^[6-9]\d{9}$/.test(mobile)) {
    return res.status(400).json({ 
      message: 'Invalid mobile number. Please enter a valid 10-digit number' 
    });
  }

  // Check if admin with this mobile exists
  const admin = await Admin.findOne({ mobile });
  if (!admin) {
    return res.status(404).json({ 
      message: 'No admin account found with this mobile number' 
    });
  }

  // Delete any existing OTPs for this mobile
  await OTP.deleteMany({ mobile, purpose: 'password_reset' });

  // Generate new OTP
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Save OTP to database
  await OTP.create({
    mobile,
    otp,
    purpose: 'password_reset',
    expiresAt,
    verified: false
  });

  // Send OTP via SMS
  const smsResult = await sendOTP(mobile, otp);

  res.json({
    message: 'OTP sent successfully to your mobile number',
    expiresIn: '10 minutes',
    mobile: mobile.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2'), // Mask mobile
    smsMode: smsResult.mode || 'sent' // development/production/fallback
  });
}));

// Step 2: Verify OTP
router.post('/verify-otp', asyncHandler(async (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({ message: 'Mobile number and OTP are required' });
  }

  // Find OTP
  const otpRecord = await OTP.findOne({
    mobile,
    otp,
    purpose: 'password_reset',
    verified: false,
    expiresAt: { $gt: new Date() }
  });

  if (!otpRecord) {
    return res.status(400).json({ 
      message: 'Invalid or expired OTP. Please request a new OTP.' 
    });
  }

  // Mark OTP as verified (but don't delete yet - needed for password reset)
  otpRecord.verified = true;
  await otpRecord.save();

  res.json({
    message: 'OTP verified successfully. You can now reset your password.',
    verified: true
  });
}));

// Step 3: Reset password with verified OTP
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { mobile, otp, newPassword } = req.body;

  if (!mobile || !otp || !newPassword) {
    return res.status(400).json({ 
      message: 'Mobile number, OTP, and new password are required' 
    });
  }

  // Validate password strength
  if (newPassword.length < 8) {
    return res.status(400).json({ 
      message: 'Password must be at least 8 characters long' 
    });
  }

  // Find verified OTP
  const otpRecord = await OTP.findOne({
    mobile,
    otp,
    purpose: 'password_reset',
    verified: true,
    expiresAt: { $gt: new Date() }
  });

  if (!otpRecord) {
    return res.status(400).json({ 
      message: 'Invalid or expired OTP. Please verify OTP again.' 
    });
  }

  // Find admin
  const admin = await Admin.findOne({ mobile });
  if (!admin) {
    return res.status(404).json({ message: 'Admin not found' });
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  admin.password = hashedPassword;
  admin.refreshTokenHash = null; // Invalidate all sessions
  await admin.save();

  // Delete OTP after successful password reset
  await OTP.deleteMany({ mobile, purpose: 'password_reset' });

  res.json({
    message: 'Password reset successful! You can now login with your new password.',
    success: true
  });
}));

module.exports = router;
