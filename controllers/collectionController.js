const Collection = require("../models/Collection");
const Paper = require("../models/Paper");

// GET /api/collections - Get all collections for authenticated user
async function getCollections(req, res) {
    try {
        const collections = await Collection.find({ userId: req.user.id })
            .populate("papers")
            .sort({ updatedAt: -1 });
        res.json({ collections });
    } catch (err) {
        console.error("Get collections error:", err.message);
        res.status(500).json({ error: "Failed to fetch collections." });
    }
}

// POST /api/collections - Create a new collection
async function createCollection(req, res) {
    try {
        const { name, description = "" } = req.body;
        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ error: "Collection name is required." });
        }

        const trimmedName = name.trim();
        const existing = await Collection.findOne({ userId: req.user.id, name: trimmedName });
        if (existing) {
            return res.status(409).json({ error: "A collection with this name already exists." });
        }

        const collection = await Collection.create({
            userId: req.user.id,
            name: trimmedName,
            description: typeof description === "string" ? description.trim() : "",
            papers: []
        });

        res.status(201).json({ collection });
    } catch (err) {
        console.error("Create collection error:", err.message);
        res.status(500).json({ error: "Failed to create collection." });
    }
}

// POST /api/collections/:id/papers - Add a paper to a collection
async function addPaperToCollection(req, res) {
    try {
        const { id } = req.params;
        const { paperId } = req.body;

        if (!paperId) {
            return res.status(400).json({ error: "Paper ID is required." });
        }

        const collection = await Collection.findOne({ _id: id, userId: req.user.id });
        if (!collection) {
            return res.status(404).json({ error: "Collection not found." });
        }

        let paper = await Paper.findOne({ openAlexId: paperId });
        if (!paper) {
            return res.status(404).json({ error: "Paper record not found." });
        }

        if (!collection.papers.includes(paper._id)) {
            collection.papers.push(paper._id);
            await collection.save();
        }

        res.json({ collection });
    } catch (err) {
        console.error("Add paper to collection error:", err.message);
        res.status(500).json({ error: "Failed to add paper to collection." });
    }
}

// DELETE /api/collections/:id - Delete a collection
async function deleteCollection(req, res) {
    try {
        const { id } = req.params;
        const deleted = await Collection.findOneAndDelete({ _id: id, userId: req.user.id });
        if (!deleted) {
            return res.status(404).json({ error: "Collection not found." });
        }
        res.json({ message: "Collection deleted successfully." });
    } catch (err) {
        console.error("Delete collection error:", err.message);
        res.status(500).json({ error: "Failed to delete collection." });
    }
}

module.exports = {
    getCollections,
    createCollection,
    addPaperToCollection,
    deleteCollection
};
