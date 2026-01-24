const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { hashRefreshToken, compareHash } = require('../utils/hash');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// User model (import if exists, or create inline for now)
let User;
try {
  User = require('../models/User');
} catch (err) {
  // Create User model inline if not exists
  const mongoose = require('mongoose');
  const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6 }
  }, { timestamps: true });

  userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });

  userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    return obj;
  };

  User = mongoose.model('User', userSchema);
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRE = '7d';

// User Signup
router.post('/signup', asyncHandler(async (req, res) => {
  const { name, email, mobile, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ 
      success: false, 
      message: 'User with this email already exists' 
    });
  }

  const user = new User({ name, email, mobile, password });
  await user.save();

  res.status(201).json({
    success: true,
    message: 'Account created successfully. Please login to continue.'
  });
}));

// User Login
router.post('/user-login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email });
  console.log('User found:', user ? 'Yes' : 'No');
  console.log('User password exists:', user?.password ? 'Yes' : 'No');
  
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  // Check if password exists in user object
  if (!user.password) {
    console.log('ERROR: Password field is missing from user object');
    console.log('User object keys:', Object.keys(user.toObject()));
    return res.status(500).json({ success: false, message: 'Password not found in database' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  console.log('Password valid:', isPasswordValid);
  
  if (!isPasswordValid) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile }
  });
}));

// Get current user
router.get('/user/me', asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const decoded = jwt.verify(token, JWT_SECRET);
  const user = await User.findById(decoded.userId);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile }
  });
}));

// User Logout
router.post('/user-logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// ADMIN AUTH ROUTES (existing)

// POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  // Sign tokens
  const accessToken = signAccessToken({ id: admin._id, email: admin.email, role: admin.role });
  const refreshToken = signRefreshToken({ id: admin._id });

  // Hash refresh token and store on user for revocation
  const refreshHash = await hashRefreshToken(refreshToken);
  admin.refreshTokenHash = refreshHash;
  await admin.save();

  // Set httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  });

  res.json({ accessToken, admin: { id: admin._id, email: admin.email, name: admin.name } });
}));

// POST /api/auth/refresh
router.post('/refresh', asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  try {
    const payload = verifyRefreshToken(token);
    const admin = await Admin.findById(payload.id);
    if (!admin || !admin.refreshTokenHash) return res.status(401).json({ message: 'Invalid token' });

    const ok = await compareHash(token, admin.refreshTokenHash);
    if (!ok) return res.status(401).json({ message: 'Invalid token' });

    // Token is valid: issue new tokens (rotate)
    const accessToken = signAccessToken({ id: admin._id, email: admin.email, role: admin.role });
    const newRefreshToken = signRefreshToken({ id: admin._id });
    admin.refreshTokenHash = await hashRefreshToken(newRefreshToken);
    await admin.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    res.json({ accessToken });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}));

// POST /api/auth/logout
router.post('/logout', asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      const payload = verifyRefreshToken(token);
      const admin = await Admin.findById(payload.id);
      if (admin) {
        admin.refreshTokenHash = null;
        await admin.save();
      }
    } catch (err) {
      // ignore
    }
  }

  res.clearCookie('refreshToken');
  res.json({ ok: true });
}));

// GET /api/auth/me
const { verifyAccessToken, attachAdmin } = require('../middleware/auth');
router.get('/me', verifyAccessToken, attachAdmin, (req, res) => {
  const admin = req.admin;
  res.json({ id: admin.id, email: admin.email, name: admin.name, role: admin.role });
});

module.exports = router;