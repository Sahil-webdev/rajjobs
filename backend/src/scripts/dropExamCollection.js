require('dotenv').config();
const mongoose = require('mongoose');

async function dropCollection() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected!');

    console.log('\n🗑️  Dropping examdetails collection...');
    await mongoose.connection.db.dropCollection('examdetails');
    console.log('✅ Collection DROPPED successfully!');
    
    console.log('\n🎉 Fresh start ready! Collection will be recreated with NEW schema on first save.\n');
    
  } catch (error) {
    if (error.message.includes('ns not found')) {
      console.log('ℹ️  Collection already does not exist. Nothing to drop.');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await mongoose.connection.close();
    console.log('👋 Connection closed.');
    process.exit(0);
  }
}

dropCollection();
