const SearchHistory = require("../models/SearchHistory");
const ViewHistory = require("../models/ViewHistory");

// GET /api/history/searches - Get recent searches for authenticated user
async function getSearchHistory(req, res) {
    try {
        const searches = await SearchHistory.find({ userId: req.user.id })
            .sort({ searchedAt: -1 })
            .limit(30);
        res.json({ searches });
    } catch (err) {
        console.error("Get search history error:", err.message);
        res.status(500).json({ error: "Failed to fetch search history." });
    }
}

// GET /api/history/views - Get recent viewed papers for authenticated user
async function getViewHistory(req, res) {
    try {
        const views = await ViewHistory.find({ userId: req.user.id })
            .populate("paperId")
            .sort({ viewedAt: -1 })
            .limit(30);
        res.json({ views });
    } catch (err) {
        console.error("Get view history error:", err.message);
        res.status(500).json({ error: "Failed to fetch view history." });
    }
}

// DELETE /api/history/searches - Clear search history
async function clearSearchHistory(req, res) {
    try {
        await SearchHistory.deleteMany({ userId: req.user.id });
        res.json({ message: "Search history cleared." });
    } catch (err) {
        console.error("Clear search history error:", err.message);
        res.status(500).json({ error: "Failed to clear search history." });
    }
}

module.exports = {
    getSearchHistory,
    getViewHistory,
    clearSearchHistory
};
