const User = require("../models/User");

const auth = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated. Please login." });
  }
  try {
    const user = await User.findById(req.session.userId).select("-password -otp -otpExpiry");
    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }
    if (user.isBlocked) {
      req.session.destroy();
      return res.status(403).json({ error: "Account has been blocked." });
    }
    req.user = user;
    next();
  } catch (error) {
    // CastError = invalid ObjectId in session — destroy it and treat as unauthenticated
    req.session.destroy(() => {});
    res.status(401).json({ error: "Session invalid. Please login again." });
  }
};

module.exports = auth;
