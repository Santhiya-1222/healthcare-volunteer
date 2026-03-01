const express = require("express");
const router = express.Router();
const { register, sendOtp, verifyOtp, logout, getMe } = require("../controllers/authController");
const auth = require("../middleware/auth");

router.post("/register", register);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/logout", auth, logout);
router.get("/me", auth, getMe);

module.exports = router;
