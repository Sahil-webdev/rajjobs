/**
 * Database Cleanup Script for ExamDetails Collection
 * 
 * Purpose: Remove old unused fields from existing documents
 * This script will:
 * 1. Remove all old unused sections (vacancyDetails, examPattern, howToApply, etc.)
 * 2. Keep only the fields that the new simplified schema uses
 * 3. Fix category enum values if needed
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const ExamDetail = require('../models/ExamDetail');

async function cleanupExamDetails() {
  try {
    console.log('\n🔧 Starting Database Cleanup...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get current count
    const totalDocs = await ExamDetail.countDocuments();
    console.log(`📊 Total documents in collection: ${totalDocs}\n`);

    if (totalDocs === 0) {
      console.log('⚠️  No documents found. Collection is empty.\n');
      process.exit(0);
    }

    // Show a sample old document structure
    const sampleDoc = await ExamDetail.findOne();
    console.log('📄 Sample document keys BEFORE cleanup:');
    console.log(Object.keys(sampleDoc.toObject()).join(', '));
    console.log('\n');

    // Option 1: Remove unused fields from all documents
    console.log('🗑️  Removing old unused fields from all documents...\n');
    
    const updateResult = await ExamDetail.updateMany(
      {}, // All documents
      {
        $unset: {
          // Remove all old unused fields
          description2: 1,
          enabledSections: 1,
          quickHighlights: 1,
          importantDates: 1,
          vacancyDetails: 1,
          eligibility: 1,
          ageLimit: 1,
          requiredDocuments: 1,
          examPattern: 1,
          salary: 1,
          syllabus: 1,
          howToApply: 1,
          selectionProcess: 1,
          previousCutoff: 1,
          applicationFees: 1,
          importantLinks: 1,
          faqs: 1,
          tags: 1,
          relatedPosts: 1
        }
      }
    );

    console.log(`✅ Updated ${updateResult.modifiedCount} documents\n`);

    // Fix category enum values
    console.log('🔧 Fixing category enum values...\n');
    
    const fixTeacher = await ExamDetail.updateMany(
      { category: 'Teacher' },
      { $set: { category: 'Teaching' } }
    );
    console.log(`   Fixed 'Teacher' → 'Teaching': ${fixTeacher.modifiedCount} documents`);

    const fixStateWise = await ExamDetail.updateMany(
      { category: 'State Wise' },
      { $set: { category: 'State Govt' } }
    );
    console.log(`   Fixed 'State Wise' → 'State Govt': ${fixStateWise.modifiedCount} documents\n`);

    // Show cleaned document structure
    const cleanedDoc = await ExamDetail.findOne();
    console.log('📄 Document keys AFTER cleanup:');
    console.log(Object.keys(cleanedDoc.toObject()).join(', '));
    console.log('\n');

    // Show summary
    console.log('📊 CLEANUP SUMMARY:');
    console.log('=================================');
    console.log(`Total documents: ${totalDocs}`);
    console.log(`Documents cleaned: ${updateResult.modifiedCount}`);
    console.log(`Category fixes: ${fixTeacher.modifiedCount + fixStateWise.modifiedCount}`);
    console.log('=================================\n');

    console.log('✅ Cleanup completed successfully!\n');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed\n');
    process.exit(0);
  }
}

// Optional: Delete all exam details and start fresh
async function deleteAllExamDetails() {
  try {
    console.log('\n⚠️  WARNING: DELETING ALL EXAM DETAILS...\n');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const result = await ExamDetail.deleteMany({});
    console.log(`🗑️  Deleted ${result.deletedCount} documents\n`);
    console.log('✅ Collection cleared successfully!\n');

  } catch (error) {
    console.error('❌ Error during deletion:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed\n');
    process.exit(0);
  }
}

// Run based on command line argument
const action = process.argv[2];

if (action === 'delete') {
  console.log('\n🚨 You chose to DELETE all exam documents!\n');
  deleteAllExamDetails();
} else if (action === 'clean') {
  console.log('\n🧹 You chose to CLEAN existing documents!\n');
  cleanupExamDetails();
} else {
  console.log('\n❌ Invalid action. Use one of these:\n');
  console.log('   node src/scripts/cleanupExamDetails.js clean   - Remove unused fields');
  console.log('   node src/scripts/cleanupExamDetails.js delete  - Delete all exam documents\n');
  process.exit(1);
}
