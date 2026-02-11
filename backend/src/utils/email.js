const nodemailer = require('nodemailer');

/**
 * Generate 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create email transporter
 */
function createTransporter() {
  const emailEnabled = process.env.EMAIL_ENABLED === 'true';
  
  if (!emailEnabled) {
    console.log('⚠️ Email disabled - OTP will be logged to console');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Send OTP email
 */
async function sendOTPEmail(email, otp) {
  const emailEnabled = process.env.EMAIL_ENABLED === 'true';

  // Development mode - just log to console
  if (!emailEnabled) {
    console.log('\n=======================================');
    console.log('📧 [EMAIL DISABLED] OTP Email Details:');
    console.log(`📨 To: ${email}`);
    console.log(`🔐 OTP: ${otp}`);
    console.log('⚠️ Set EMAIL_ENABLED=true in .env to send real emails');
    console.log('=======================================\n');
    return { success: true, mode: 'console' };
  }

  // Production mode - send real email
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"RajJobs Admin" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset OTP - RajJobs Admin Panel',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
              <p>RajJobs Admin Panel</p>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You requested to reset your password. Use the OTP below to proceed:</p>
              
              <div class="otp-box">
                <div style="font-size: 14px; color: #666; margin-bottom: 10px;">Your OTP Code</div>
                <div class="otp-code">${otp}</div>
              </div>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This OTP is valid for <strong>10 minutes</strong></li>
                  <li>Do not share this OTP with anyone</li>
                  <li>If you didn't request this, please ignore this email</li>
                </ul>
              </div>

              <p>If you have any questions, please contact our support team.</p>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} RajJobs. All rights reserved.</p>
                <p>This is an automated email. Please do not reply.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        RajJobs Admin Panel - Password Reset OTP
        
        Your OTP: ${otp}
        
        This OTP is valid for 10 minutes.
        Do not share this OTP with anyone.
        
        If you didn't request this, please ignore this email.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, mode: 'email', messageId: info.messageId };

  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    
    // Fallback to console logging
    console.log('\n=======================================');
    console.log('📧 [EMAIL FAILED - CONSOLE FALLBACK]');
    console.log(`📨 To: ${email}`);
    console.log(`🔐 OTP: ${otp}`);
    console.log(`❌ Error: ${error.message}`);
    console.log('=======================================\n');
    
    return { success: true, mode: 'console-fallback', error: error.message };
  }
}

module.exports = {
  generateOTP,
  sendOTPEmail,
};
