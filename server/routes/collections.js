const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const collectionController = require("../controllers/collectionController");

// All collection routes are protected and scoped per user
router.get("/", protect, collectionController.getCollections);
router.post("/", protect, collectionController.createCollection);
router.post("/:id/papers", protect, collectionController.addPaperToCollection);
router.delete("/:id", protect, collectionController.deleteCollection);

module.exports = router;
