/**
 * 🧪 Test Script: FormattedNote Save Test
 * 
 * Tests whether HTML content in formattedNote field saves correctly to MongoDB
 * Run with: node test-formatted-note.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Enable Mongoose debug to see exact MongoDB operations
mongoose.set('debug', true);

const ExamDetail = require('./src/models/ExamDetail');

const testHTML = '<b>Bold text</b> and <i>italic text</i> with <a href="http://example.com">a link</a>. Some normal text here.';

async function runTest() {
  try {
    console.log('========================================');
    console.log('🧪 FORMATTED NOTE SAVE TEST');
    console.log('========================================\n');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rajjobs');
    console.log('✅ Connected!\n');
    
    // Test 1: Create with formattedNote
    console.log('========================================');
    console.log('TEST 1: Create exam with formattedNote');
    console.log('========================================');
    console.log('📝 Input HTML:', testHTML);
    console.log('📝 Input length:', testHTML.length, 'chars\n');
    
    const exam1 = await ExamDetail.create({
      title: 'Test Exam with Formatted Note',
      slug: 'test-exam-formatted-' + Date.now(),
      category: 'SSC',
      metaDescription: 'Test exam for formatted note',
      formattedNote: testHTML
    });
    
    console.log('\n✅ Created exam ID:', exam1._id);
    console.log('💾 Saved formattedNote:', exam1.formattedNote ? 'EXISTS' : 'MISSING');
    console.log('💾 Saved length:', exam1.formattedNote?.length || 0, 'chars');
    console.log('💾 Content matches:', exam1.formattedNote === testHTML ? 'YES ✅' : 'NO ❌');
    
    // Test 2: Fetch from database to verify
    console.log('\n========================================');
    console.log('TEST 2: Fetch from database');
    console.log('========================================');
    
    const fetched = await ExamDetail.findById(exam1._id);
    console.log('🔄 Fetched formattedNote:', fetched.formattedNote ? 'EXISTS' : 'MISSING');
    console.log('🔄 Fetched length:', fetched.formattedNote?.length || 0, 'chars');
    console.log('🔄 Content matches:', fetched.formattedNote === testHTML ? 'YES ✅' : 'NO ❌');
    
    if (fetched.formattedNote !== testHTML) {
      console.log('\n❌ MISMATCH DETECTED!');
      console.log('Expected:', testHTML);
      console.log('Got:', fetched.formattedNote);
    }
    
    // Test 3: Update formattedNote
    console.log('\n========================================');
    console.log('TEST 3: Update formattedNote');
    console.log('========================================');
    
    const updatedHTML = '<b>Updated</b> content with <i>different</i> text';
    console.log('📝 New HTML:', updatedHTML);
    console.log('📝 New length:', updatedHTML.length, 'chars\n');
    
    fetched.formattedNote = updatedHTML;
    await fetched.save();
    
    console.log('✅ Updated');
    console.log('💾 Updated formattedNote:', fetched.formattedNote ? 'EXISTS' : 'MISSING');
    console.log('💾 Updated length:', fetched.formattedNote?.length || 0, 'chars');
    console.log('💾 Content matches:', fetched.formattedNote === updatedHTML ? 'YES ✅' : 'NO ❌');
    
    // Test 4: Verify update persisted
    console.log('\n========================================');
    console.log('TEST 4: Verify update persisted');
    console.log('========================================');
    
    const reFetched = await ExamDetail.findById(exam1._id);
    console.log('🔄 Re-fetched formattedNote:', reFetched.formattedNote ? 'EXISTS' : 'MISSING');
    console.log('🔄 Re-fetched length:', reFetched.formattedNote?.length || 0, 'chars');
    console.log('🔄 Content matches:', reFetched.formattedNote === updatedHTML ? 'YES ✅' : 'NO ❌');
    
    // Cleanup
    console.log('\n========================================');
    console.log('CLEANUP');
    console.log('========================================');
    await ExamDetail.deleteOne({ _id: exam1._id });
    console.log('🗑️  Test document deleted');
    
    // Final summary
    console.log('\n========================================');
    console.log('TEST SUMMARY');
    console.log('========================================');
    console.log('Create:', exam1.formattedNote === testHTML ? '✅ PASS' : '❌ FAIL');
    console.log('Fetch:', fetched.formattedNote === testHTML ? '✅ PASS' : '❌ FAIL');
    console.log('Update:', fetched.formattedNote === updatedHTML ? '✅ PASS' : '❌ FAIL');
    console.log('Persist:', reFetched.formattedNote === updatedHTML ? '✅ PASS' : '❌ FAIL');
    console.log('========================================\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

runTest();
