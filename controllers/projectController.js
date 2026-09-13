const Project = require("../models/Project");

// GET /api/projects - Get all projects for authenticated user
async function getProjects(req, res) {
    try {
        const projects = await Project.find({ userId: req.user.id })
            .sort({ updatedAt: -1 });
        res.json({ projects });
    } catch (err) {
        console.error("Get projects error:", err.message);
        res.status(500).json({ error: "Failed to fetch projects." });
    }
}

// GET /api/projects/:id - Get a single project
async function getProjectById(req, res) {
    try {
        const project = await Project.findOne({ _id: req.params.id, userId: req.user.id });
        if (!project) {
            return res.status(404).json({ error: "Project not found." });
        }
        res.json({ project });
    } catch (err) {
        console.error("Get project error:", err.message);
        res.status(500).json({ error: "Failed to fetch project." });
    }
}

// POST /api/projects - Create a new project
async function createProject(req, res) {
    try {
        const { name, description = "", goal = "" } = req.body;
        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ error: "Project name is required." });
        }

        const project = await Project.create({
            userId: req.user.id,
            name: name.trim(),
            description: typeof description === "string" ? description.trim() : "",
            goal: typeof goal === "string" ? goal.trim() : "",
            papers: [],
            questions: [],
            notes: [],
            collections: [],
            activity: [{
                id: `act_${Date.now()}`,
                type: "created",
                text: `Project "${name.trim()}" created.`,
                timestamp: new Date()
            }],
            lastActiveAt: new Date()
        });

        res.status(201).json({ project });
    } catch (err) {
        console.error("Create project error:", err.message);
        res.status(500).json({ error: "Failed to create project." });
    }
}

// PUT /api/projects/:id - Update project details
async function updateProject(req, res) {
    try {
        const { name, description, goal } = req.body;
        const updates = { lastActiveAt: new Date() };

        if (typeof name === "string" && name.trim()) updates.name = name.trim();
        if (typeof description === "string") updates.description = description.trim();
        if (typeof goal === "string") updates.goal = goal.trim();

        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { $set: updates },
            { new: true }
        );

        if (!project) {
            return res.status(404).json({ error: "Project not found." });
        }

        res.json({ project });
    } catch (err) {
        console.error("Update project error:", err.message);
        res.status(500).json({ error: "Failed to update project." });
    }
}

// POST /api/projects/:id/papers - Add paper to project
async function addPaperToProject(req, res) {
    try {
        const { paperId, paperData } = req.body;
        if (!paperId || !paperData) {
            return res.status(400).json({ error: "paperId and paperData are required." });
        }

        const project = await Project.findOne({ _id: req.params.id, userId: req.user.id });
        if (!project) {
            return res.status(404).json({ error: "Project not found." });
        }

        const exists = project.papers.some(p => p.paperId === String(paperId));
        if (!exists) {
            project.papers.push({
                paperId: String(paperId),
                paperData,
                readingStatus: "unread",
                tags: [],
                addedAt: new Date()
            });

            project.activity.unshift({
                id: `act_${Date.now()}`,
                type: "paper_added",
                text: `Added paper: ${paperData.title || paperId}`,
                timestamp: new Date()
            });

            project.lastActiveAt = new Date();
            await project.save();
        }

        res.json({ project });
    } catch (err) {
        console.error("Add paper to project error:", err.message);
        res.status(500).json({ error: "Failed to add paper to project." });
    }
}

// DELETE /api/projects/:id - Delete a project
async function deleteProject(req, res) {
    try {
        const deleted = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!deleted) {
            return res.status(404).json({ error: "Project not found." });
        }
        res.json({ message: "Project deleted successfully." });
    } catch (err) {
        console.error("Delete project error:", err.message);
        res.status(500).json({ error: "Failed to delete project." });
    }
}

module.exports = {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    addPaperToProject,
    deleteProject
};
