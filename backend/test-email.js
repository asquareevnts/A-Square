// Test script to verify email configuration
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

console.log('Testing email configuration...');
console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Password:', process.env.EMAIL_PASSWORD ? '****' + process.env.EMAIL_PASSWORD.slice(-4) : 'NOT SET');

// Verify connection
transporter.verify(function(error, success) {
  if (error) {
    console.log('\n❌ EMAIL CONFIGURATION ERROR:');
    console.log('Error Code:', error.code);
    console.log('Error Message:', error.message);
    console.log('\n💡 TROUBLESHOOTING STEPS:');
    
    if (error.code === 'EAUTH') {
      console.log('1. ✅ Enable 2-Factor Authentication:');
      console.log('   → Visit: https://myaccount.google.com/security');
      console.log('   → Click "2-Step Verification"');
      console.log('   → Complete the setup\n');
      
      console.log('2. ✅ Generate App Password:');
      console.log('   → Visit: https://myaccount.google.com/apppasswords');
      console.log('   → Select "Mail" and "Other (Custom name)"');
      console.log('   → Copy the 16-character password');
      console.log('   → Paste it in .env as EMAIL_PASSWORD (no spaces)\n');
      
      console.log('3. ✅ Check Gmail Security Settings:');
      console.log('   → Visit: https://myaccount.google.com/lesssecureapps');
      console.log('   → Make sure you\'re using App Password instead\n');
    }
    
    if (error.responseCode === 535) {
      console.log('❌ Invalid Credentials!');
      console.log('   → Double-check EMAIL_USER and EMAIL_PASSWORD in .env');
      console.log('   → Make sure there are NO SPACES in the password');
      console.log('   → Use App Password, not your Gmail password\n');
    }
  } else {
    console.log('\n✅ EMAIL SERVICE READY!');
    console.log('   Server is ready to send password reset emails.');
    
    // Send test email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Test Email - ASquare Events',
      text: 'If you receive this email, your email configuration is working correctly!',
      html: '<h2>✅ Email Configuration Successful!</h2><p>Your forgot password feature is ready to use.</p>'
    };
    
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log('\n❌ Failed to send test email:', err.message);
      } else {
        console.log('\n📧 Test email sent successfully!');
        console.log('   Message ID:', info.messageId);
        console.log('   Check your inbox:', process.env.EMAIL_USER);
      }
      process.exit(0);
    });
  }
});
