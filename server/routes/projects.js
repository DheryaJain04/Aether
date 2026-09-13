const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const projectController = require("../controllers/projectController");

// All project routes require authentication
router.get("/", protect, projectController.getProjects);
router.get("/:id", protect, projectController.getProjectById);
router.post("/", protect, projectController.createProject);
router.put("/:id", protect, projectController.updateProject);
router.post("/:id/papers", protect, projectController.addPaperToProject);
router.delete("/:id", protect, projectController.deleteProject);

module.exports = router;
