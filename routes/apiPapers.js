const express = require("express");
const router = express.Router();

const paperController = require("../controllers/paperController");

router.get("/:id", paperController.getPaperData);

module.exports = router;
