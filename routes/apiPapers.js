const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 30 * 1024 * 1024 } // 30MB max
});

const paperController = require("../controllers/paperController");

router.post("/upload", upload.single("file"), paperController.uploadPaper);
router.get("/:id", paperController.getPaperData);

module.exports = router;
