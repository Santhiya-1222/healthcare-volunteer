const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const { createSchedule, getMySchedules, cancelSchedule } = require("../controllers/recurringController");

router.post("/", auth, authorize("user"), createSchedule);
router.get("/my", auth, authorize("user"), getMySchedules);
router.put("/:id/cancel", auth, authorize("user"), cancelSchedule);

module.exports = router;
