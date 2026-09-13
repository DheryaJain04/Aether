const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const historyController = require("../controllers/historyController");

router.get("/searches", protect, historyController.getSearchHistory);
router.get("/views", protect, historyController.getViewHistory);
router.delete("/searches", protect, historyController.clearSearchHistory);

module.exports = router;
