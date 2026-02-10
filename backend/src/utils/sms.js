const axios = require('axios');

/**
 * Send OTP SMS using MSG91
 * Note: Add MSG91_AUTH_KEY and MSG91_TEMPLATE_ID in .env file
 */
async function sendOTP(mobile, otp) {
  try {
    // Check if SMS is enabled via environment variable
    const SMS_ENABLED = process.env.SMS_ENABLED === 'true';
    
    if (!SMS_ENABLED) {
      // Development mode - just log OTP
      console.log(`📱 [SMS DISABLED] OTP for ${mobile}: ${otp}`);
      console.log(`⚠️ Set SMS_ENABLED=true in .env to enable real SMS`);
      return { success: true, mode: 'development' };
    }

    const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
    const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;
    const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || 'RAJJOB';

    if (!MSG91_AUTH_KEY || !MSG91_TEMPLATE_ID) {
      console.error('❌ MSG91 credentials not found in .env');
      console.log(`📱 [FALLBACK] OTP for ${mobile}: ${otp}`);
      return { success: true, mode: 'fallback' };
    }

    // MSG91 API v5
    const response = await axios.post(
      `https://control.msg91.com/api/v5/flow/`,
      {
        template_id: MSG91_TEMPLATE_ID,
        short_url: '0',
        recipients: [
          {
            mobiles: mobile,
            otp: otp
          }
        ]
      },
      {
        headers: {
          'authkey': MSG91_AUTH_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ SMS sent successfully to ${mobile}`);
    return { success: true, mode: 'production', response: response.data };

  } catch (error) {
    console.error('❌ SMS sending failed:', error.message);
    // Log OTP as fallback
    console.log(`📱 [FALLBACK] OTP for ${mobile}: ${otp}`);
    return { success: false, error: error.message, otp: otp };
  }
}

/**
 * Generate 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = {
  sendOTP,
  generateOTP
};
