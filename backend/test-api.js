// Test API endpoints
const testAPI = async () => {
  console.log('🧪 Testing Exam Details API\n');
  console.log('='.repeat(60));

  // Test 1: Get all published exams
  console.log('\n📡 Test 1: GET /api/public/exam-details (All categories)');
  try {
    const response1 = await fetch('http://localhost:4000/api/public/exam-details');
    const data1 = await response1.json();
    console.log('Status:', response1.status);
    console.log('Response:', JSON.stringify(data1, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(60));

  // Test 2: Get SSC category exams
  console.log('\n📡 Test 2: GET /api/public/exam-details?category=SSC');
  try {
    const response2 = await fetch('http://localhost:4000/api/public/exam-details?category=SSC');
    const data2 = await response2.json();
    console.log('Status:', response2.status);
    console.log('Response:', JSON.stringify(data2, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(60));

  // Test 3: Get specific exam by slug
  console.log('\n📡 Test 3: GET /api/public/exam-details/ssc-cgl-2025');
  try {
    const response3 = await fetch('http://localhost:4000/api/public/exam-details/ssc-cgl-2025');
    const data3 = await response3.json();
    console.log('Status:', response3.status);
    console.log('Response:', JSON.stringify(data3, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ API Tests Complete!\n');
};

testAPI();
