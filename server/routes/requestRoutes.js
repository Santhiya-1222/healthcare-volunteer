const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const {
  createRequest,
  getMyRequests,
  getNearbyRequests,
  acceptRequest,
  updateStatus,
  submitFeedback,
  getRequestById,
} = require("../controllers/requestController");

router.post("/", auth, authorize("user"), createRequest);
router.get("/my", auth, authorize("user"), getMyRequests);
router.get("/nearby", auth, authorize("volunteer"), getNearbyRequests);
router.put("/:id/accept", auth, authorize("volunteer"), acceptRequest);
router.put("/:id/status", auth, authorize("volunteer"), updateStatus);
router.post("/:id/feedback", auth, authorize("user"), submitFeedback);
router.get("/:id", auth, getRequestById);

module.exports = router;
