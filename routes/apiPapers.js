const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 30 * 1024 * 1024 }, // 30MB max
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === "application/pdf" ||
            file.originalname.toLowerCase().endsWith(".pdf")
        ) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF documents (.pdf) are allowed."), false);
        }
    }
});

const paperController = require("../controllers/paperController");

// Upload route with auth and multer error handling wrapper
router.post(
    "/upload",
    protect,
    (req, res, next) => {
        upload.single("file")(req, res, (err) => {
            if (err) {
                return res.status(400).json({ error: err.message || "File upload error." });
            }
            next();
        });
    },
    paperController.uploadPaper
);

router.get("/:id", optionalAuth, paperController.getPaperData);

module.exports = router;

