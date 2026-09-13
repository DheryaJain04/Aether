const express = require("express");
const router = express.Router();
const { optionalAuth } = require("../middleware/authMiddleware");
const searchController = require("../controllers/searchController");

router.get("/", optionalAuth, searchController.searchPapersAPI);

module.exports = router;