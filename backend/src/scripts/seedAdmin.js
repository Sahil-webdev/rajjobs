require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const Course = require('../models/Course');
const Banner = require('../models/Banner');

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error('.env MONGO_URI missing');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Mongo connected');

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@rajjobs.test';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Password123!';

  const exists = await Admin.findOne({ email });
  if (!exists) {
    const hashed = await bcrypt.hash(password, 10);
    const admin = new Admin({ name: 'Super Admin', email, password: hashed, role: 'admin' });
    await admin.save();
    console.log('Seeded admin:', email, 'password:', password);
  } else {
    console.log('Admin already exists:', email);
  }

  // Seed sample course
  const sampleCourseTitle = 'Sample RajJobs Course';
  const courseExists = await Course.findOne({ title: sampleCourseTitle });
  if (!courseExists) {
    await Course.create({
      title: sampleCourseTitle,
      slug: 'sample-rajjobs-course',
      thumbnailUrl: 'https://placehold.co/600x400',
      description: 'This is a sample course description.',
      about: 'About this sample course.',
      language: 'hindi',
      validityDays: 180,
      totalVideos: 25,
      priceOriginal: 999,
      priceSale: 499,
      status: 'published',
      categories: ['sample'],
      instructor: 'Admin',
      publishedAt: new Date()
    });
    console.log('Seeded sample course');
  } else {
    console.log('Sample course already exists');
  }

  // Seed up to 4 sample banners
  const bannerCount = await Banner.countDocuments();
  if (bannerCount === 0) {
    const banners = Array.from({ length: 4 }).map((_, idx) => ({
      title: `Sample Banner ${idx + 1}`,
      imageUrl: `https://placehold.co/1200x400?text=Banner+${idx + 1}`,
      linkUrl: 'https://example.com',
      order: idx,
      isActive: true
    }));
    await Banner.insertMany(banners);
    console.log('Seeded sample banners');
  } else {
    console.log('Banners already present');
  }

  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });