const express = require("express");
const router = express.Router();
const { optionalAuth } = require("../middleware/authMiddleware");
const paperController = require("../controllers/paperController");

router.get("/:id/summary", optionalAuth, paperController.generateSummary);
router.get("/:id/keywords", optionalAuth, paperController.generateKeywords);
router.post("/:id/chat", optionalAuth, paperController.chatWithPaper);

module.exports = router;