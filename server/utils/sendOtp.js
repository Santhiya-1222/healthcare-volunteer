const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtp = async (phone, otp) => {
  try {
    // Strip country code — Fast2SMS requires a 10-digit Indian number
    const digits = String(phone).replace(/^\+?91/, "").replace(/\D/g, "");

    const url =
      `https://www.fast2sms.com/dev/bulkV2` +
      `?authorization=${process.env.FAST2SMS_API_KEY}` +
      `&variables_values=${otp}` +
      `&route=otp` +
      `&numbers=${digits}`;

    console.log("[Fast2SMS] Calling URL:", url.replace(process.env.FAST2SMS_API_KEY, "***"));

    const res = await fetch(url, {
      method: "GET",
      headers: { "cache-control": "no-cache" },
    });

    const text = await res.text();
    console.log("[Fast2SMS] Raw response:", text);

    const data = JSON.parse(text);
    if (!data.return) {
      throw new Error(data.message?.[0] || "Fast2SMS delivery failed.");
    }
    return true;
  } catch (err) {
    console.error("[Fast2SMS] Error:", err.message);
    if (process.env.NODE_ENV !== "production") {
      // Dev fallback: log OTP to console so the app still works without SMS
      console.log(`\n=============================`);
      console.log(`  OTP for ${phone}: ${otp}`);
      console.log(`  (Fast2SMS skipped: ${err.message})`);
      console.log(`=============================\n`);
      return true;
    }
    throw err;
  }
};

module.exports = { generateOtp, sendOtp };
