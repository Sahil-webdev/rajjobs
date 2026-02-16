// Quick test to check exams in database
require('dotenv').config();
const mongoose = require('mongoose');
const ExamDetail = require('./src/models/ExamDetail');

const testExams = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rajjobs');
    console.log('✅ MongoDB connected\n');

    // Get all exams
    console.log('📊 Fetching ALL exams from database...');
    const allExams = await ExamDetail.find({});
    console.log(`Total exams in database: ${allExams.length}\n`);

    if (allExams.length === 0) {
      console.log('❌ No exams found in database!');
      process.exit(0);
    }

    // Show exam details
    allExams.forEach((exam, index) => {
      console.log(`\n${index + 1}. ${exam.title}`);
      console.log(`   Category: ${exam.category}`);
      console.log(`   Status: ${exam.status}`);
      console.log(`   Slug: ${exam.slug}`);
      console.log(`   Created: ${exam.createdAt}`);
    });

    console.log('\n' + '='.repeat(60));
    
    // Get published exams only
    console.log('\n📊 Fetching PUBLISHED exams...');
    const publishedExams = await ExamDetail.find({ status: 'published' });
    console.log(`Published exams: ${publishedExams.length}`);

    if (publishedExams.length > 0) {
      console.log('\nPublished exam titles:');
      publishedExams.forEach((exam, index) => {
        console.log(`${index + 1}. ${exam.title} (${exam.category})`);
      });
    } else {
      console.log('❌ No published exams found!');
      console.log('💡 Make sure to set exam status to "published" in admin panel');
    }

    console.log('\n' + '='.repeat(60));

    // Get draft exams
    const draftExams = await ExamDetail.find({ status: 'draft' });
    console.log(`\n📝 Draft exams: ${draftExams.length}`);
    if (draftExams.length > 0) {
      console.log('\nDraft exam titles:');
      draftExams.forEach((exam, index) => {
        console.log(`${index + 1}. ${exam.title} (${exam.category})`);
      });
      console.log('\n💡 Publish these exams to show them on website');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testExams();
