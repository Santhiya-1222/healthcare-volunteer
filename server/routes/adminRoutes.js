const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const {
  getDashboard,
  getPendingVolunteers,
  verifyVolunteer,
  blockVolunteer,
  getAllRequests,
  getAllVolunteers,
} = require("../controllers/adminController");

router.get("/dashboard", auth, authorize("admin"), getDashboard);
router.get("/volunteers/pending", auth, authorize("admin"), getPendingVolunteers);
router.get("/volunteers/all", auth, authorize("admin"), getAllVolunteers);
router.put("/volunteers/:id/verify", auth, authorize("admin"), verifyVolunteer);
router.put("/volunteers/:id/block", auth, authorize("admin"), blockVolunteer);
router.get("/requests", auth, authorize("admin"), getAllRequests);

module.exports = router;
