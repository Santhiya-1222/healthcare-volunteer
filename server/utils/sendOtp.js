const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtp = async (phone, otp) => {
  // In development, log OTP to console
  // In production, integrate with SMS gateway (Twilio / Fast2SMS)
  console.log(`\n=============================`);
  console.log(`  OTP for ${phone}: ${otp}`);
  console.log(`=============================\n`);
  return true;
};

module.exports = { generateOtp, sendOtp };
