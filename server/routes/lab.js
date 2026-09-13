const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const labController = require("../controllers/labController");

// All lab routes require authentication
router.post("/synthesize", protect, labController.synthesize);
router.post("/compare", protect, labController.compare);
router.post("/matrix", protect, labController.matrix);
router.post("/gaps", protect, labController.gaps);

module.exports = router;
