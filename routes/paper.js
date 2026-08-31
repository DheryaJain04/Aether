const express = require("express");
const router = express.Router();

const paperController = require("../controllers/paperController");

router.get("/:id/summary", paperController.generateSummary);
router.get("/:id/keywords", paperController.generateKeywords);
router.post("/:id/chat", paperController.chatWithPaper);

module.exports = router;