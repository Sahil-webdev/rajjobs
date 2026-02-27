require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const ExamDetail = require('../models/ExamDetail');

async function verifyCleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected\n');

    const doc = await ExamDetail.findOne().lean();
    
    console.log('📄 Current document fields:');
    console.log(Object.keys(doc).join(', '));
    console.log('\n');

    console.log('🔍 Checking for old unused fields:');
    const oldFields = [
      'description2',
      'vacancyDetails', 
      'examPattern', 
      'howToApply', 
      'eligibility',
      'ageLimit',
      'requiredDocuments',
      'salary',
      'syllabus',
      'selectionProcess',
      'previousCutoff',
      'applicationFees',
      'importantLinks',
      'faqs',
      'tags',
      'enabledSections',
      'quickHighlights',
      'importantDates',
      'relatedPosts'
    ];
    
    let foundOldFields = 0;
    oldFields.forEach(field => {
      const exists = doc[field] !== undefined;
      if (exists) {
        console.log(`  ❌ ${field}: STILL EXISTS`);
        foundOldFields++;
      } else {
        console.log(`  ✅ ${field}: REMOVED`);
      }
    });

    console.log('\n📊 SUMMARY:');
    console.log(`   Old fields still present: ${foundOldFields}`);
    console.log(`   Old fields removed: ${oldFields.length - foundOldFields}`);
    
    if (foundOldFields > 0) {
      console.log('\n⚠️  Some old fields still exist in documents!');
    } else {
      console.log('\n✅ All old fields successfully removed!');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyCleanup();
