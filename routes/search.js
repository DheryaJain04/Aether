const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    const query = req.query.q;
    res.render("search", {query});
});

module.exports = router;