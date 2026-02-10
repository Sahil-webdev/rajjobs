require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const { verifyAccessToken, requireAdmin } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const adminCourses = require('./routes/admin/courses');
const adminBanners = require('./routes/admin/banners');
const adminNotifications = require('./routes/admin/notifications');
const adminSettings = require('./routes/admin/settings');
const adminReports = require('./routes/admin/reports');
const adminExamDetails = require('./routes/admin/exam-details');
const adminFileUpload = require('./routes/admin/file-upload');
const adminTestSeries = require('./routes/admin/test-series');
const adminEnquiries = require('./routes/admin/enquiries');
const adminSetup = require('./routes/admin/setup');
const adminPasswordReset = require('./routes/admin/password-reset');
const adminProfile = require('./routes/admin/profile');

const publicBanners = require('./routes/public/banners');
const publicExamDetails = require('./routes/public/exam-details');
const publicCourses = require('./routes/public/courses');
const publicTestSeries = require('./routes/public/test-series');
const publicEnquiry = require('./routes/public/enquiry');
const publicNotifications = require('./routes/public/notifications');

const PORT = process.env.PORT;

const app = express();

const originCandidates = [
  process.env.CORS_ORIGINS,
  process.env.FRONTEND_URL,
  'http://localhost:3000,http://localhost:3001,http://localhost:3002',
]
  .filter(Boolean)
  .join(',')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set(originCandidates));
const path = require('path');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow mobile apps / curl
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);

// Public admin setup routes (no auth required)
app.use('/api/admin/setup', adminSetup);
app.use('/api/admin/password-reset', adminPasswordReset);

// Admin protected routes
app.use('/api/admin/profile', verifyAccessToken, requireAdmin, adminProfile);
app.use('/api/admin/courses', verifyAccessToken, requireAdmin, adminCourses);
app.use('/api/admin/banners', verifyAccessToken, requireAdmin, adminBanners);
app.use('/api/admin/notifications', verifyAccessToken, requireAdmin, adminNotifications);
app.use('/api/admin/settings', verifyAccessToken, requireAdmin, adminSettings);
app.use('/api/admin/reports', verifyAccessToken, requireAdmin, adminReports);
app.use('/api/admin/exam-details', verifyAccessToken, requireAdmin, adminExamDetails);
app.use('/api/admin/file', verifyAccessToken, requireAdmin, adminFileUpload);
app.use('/api/admin/test-series', verifyAccessToken, requireAdmin, adminTestSeries);
app.use('/api/admin/enquiries', verifyAccessToken, requireAdmin, adminEnquiries);

// Public routes
app.use('/api/public/banners', publicBanners);
app.use('/api/public/exam-details', publicExamDetails);
app.use('/api/public/courses', publicCourses);
app.use('/api/public/test-series', publicTestSeries);
app.use('/api/public/enquiry', publicEnquiry);
app.use('/api/public/notifications', publicNotifications);

// Example protected admin route
app.get('/api/admin/dashboard', verifyAccessToken, requireAdmin, (req, res) => {
  res.json({ message: 'Welcome to admin dashboard', admin: { id: req.admin.id, email: req.admin.email } });
});

// Error handler
app.use(errorHandler);

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();