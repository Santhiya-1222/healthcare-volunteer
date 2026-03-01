const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const { getMyTasks, getProfile } = require("../controllers/volunteerController");

router.get("/my-tasks", auth, authorize("volunteer"), getMyTasks);
router.get("/profile", auth, authorize("volunteer"), getProfile);

module.exports = router;
