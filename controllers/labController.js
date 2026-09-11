// controllers/labController.js
// Scholar Lab Controller — Connects HTTP endpoints to the 5-Layer Multi-Agent Lab Pipeline

const { runLabToolPipeline, TOOL_LIMITS } = require("../services/lab/labPipeline");

async function synthesize(req, res) {
    try {
        const { papers = [], options = {} } = req.body;
        if (!papers.length) {
            return res.status(400).json({ error: "No papers provided. Add papers to the bench first." });
        }
        if (papers.length < 2) {
            return res.status(400).json({ error: "Literature synthesis requires at least 2 papers." });
        }

        const result = await runLabToolPipeline("synthesis", papers, options);
        res.json(result);
    } catch (err) {
        console.error("Scholar Lab [Synthesis] Error:", err.message);
        res.status(500).json({ error: err.message || "Failed to execute literature synthesis pipeline." });
    }
}

async function compare(req, res) {
    try {
        const { papers = [], options = {} } = req.body;
        if (!papers.length) {
            return res.status(400).json({ error: "No papers provided. Add papers to the bench first." });
        }
        if (papers.length < 2) {
            return res.status(400).json({ error: "Paper comparison requires at least 2 papers." });
        }

        const result = await runLabToolPipeline("compare", papers, options);
        res.json(result);
    } catch (err) {
        console.error("Scholar Lab [Compare] Error:", err.message);
        res.status(500).json({ error: err.message || "Failed to execute paper comparison pipeline." });
    }
}

async function matrix(req, res) {
    try {
        const { papers = [], options = {} } = req.body;
        if (!papers.length) {
            return res.status(400).json({ error: "No papers provided. Add papers to the bench first." });
        }
        if (papers.length < 2) {
            return res.status(400).json({ error: "Evidence matrix requires at least 2 papers." });
        }

        const result = await runLabToolPipeline("matrix", papers, options);
        res.json(result);
    } catch (err) {
        console.error("Scholar Lab [Matrix] Error:", err.message);
        res.status(500).json({ error: err.message || "Failed to execute evidence matrix pipeline." });
    }
}

async function gaps(req, res) {
    try {
        const { papers = [], options = {} } = req.body;
        if (!papers.length) {
            return res.status(400).json({ error: "No papers provided. Add papers to the bench first." });
        }
        if (papers.length < 2) {
            return res.status(400).json({ error: "Gap detection requires at least 2 papers." });
        }

        const result = await runLabToolPipeline("gaps", papers, options);
        res.json(result);
    } catch (err) {
        console.error("Scholar Lab [Gaps] Error:", err.message);
        res.status(500).json({ error: err.message || "Failed to execute research gap detector pipeline." });
    }
}

module.exports = {
    synthesize,
    compare,
    matrix,
    gaps,
    TOOL_LIMITS
};
