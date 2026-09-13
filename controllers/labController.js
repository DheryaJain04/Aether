// controllers/labController.js
// Scholar Lab Controller — Connects HTTP endpoints to the 5-Layer Multi-Agent Lab Pipeline

const { runLabToolPipeline, TOOL_LIMITS } = require("../services/lab/labPipeline");

function validateLabPapers(papers) {
    if (!Array.isArray(papers)) {
        return "Papers payload must be an array.";
    }
    if (papers.length === 0) {
        return "No papers provided. Add papers to the bench first.";
    }
    if (papers.length < 2) {
        return "This lab tool requires at least 2 papers.";
    }
    if (papers.length > 10) {
        return "A maximum of 10 papers can be evaluated at once.";
    }
    for (let i = 0; i < papers.length; i++) {
        const p = papers[i];
        if (!p || typeof p !== "object") {
            return `Paper item at index ${i} is invalid.`;
        }
        if (!p.id && !p.title) {
            return `Paper at index ${i} must have an id or title.`;
        }
    }
    return null;
}

async function synthesize(req, res) {
    try {
        const { papers = [], options = {} } = req.body;
        const validationError = validateLabPapers(papers);
        if (validationError) {
            return res.status(400).json({ error: validationError });
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
        const validationError = validateLabPapers(papers);
        if (validationError) {
            return res.status(400).json({ error: validationError });
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
        const validationError = validateLabPapers(papers);
        if (validationError) {
            return res.status(400).json({ error: validationError });
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
        const validationError = validateLabPapers(papers);
        if (validationError) {
            return res.status(400).json({ error: validationError });
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
