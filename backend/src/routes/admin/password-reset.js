const express = require('express');
const router = express.Router();
const Admin = require('../../models/Admin');
const OTP = require('../../models/OTP');
const { hashPassword } = require('../../utils/hash');
const { sendOTPEmail, generateOTP } = require('../../utils/email');
const asyncHandler = require('../../utils/asyncHandler');

// Step 1: Send OTP to email for password reset
router.post('/send-otp', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email address is required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      message: 'Invalid email address format' 
    });
  }

  // Check if admin with this email exists
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(404).json({ 
      message: 'No admin account found with this email address' 
    });
  }

  // Delete any existing OTPs for this email
  await OTP.deleteMany({ email, purpose: 'password_reset' });

  // Generate new OTP
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Save OTP to database
  await OTP.create({
    email,
    otp,
    purpose: 'password_reset',
    expiresAt,
    verified: false
  });

  // Send OTP via Email
  const emailResult = await sendOTPEmail(email, otp);

  res.json({
    message: 'OTP sent successfully to your email address',
    expiresIn: '10 minutes',
    email: email.replace(/(.{2})(.*)(@.*)/, '$1****$3'), // Mask email
    emailMode: emailResult.mode || 'sent' // console/email/console-fallback
  });
}));

// Step 2: Verify OTP
router.post('/verify-otp', asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email address and OTP are required' });
  }

  // Find OTP
  const otpRecord = await OTP.findOne({
    email,
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
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ 
      message: 'Email address, OTP, and new password are required' 
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
    email,
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
  const admin = await Admin.findOne({ email });
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
  await OTP.deleteMany({ email, purpose: 'password_reset' });

  res.json({
    message: 'Password reset successful! You can now login with your new password.',
    success: true
  });
}));

module.exports = router;
