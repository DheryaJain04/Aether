// Scholar Lab Controller
// Stub handlers — AI logic for each tool will be implemented per phase.
// Each endpoint receives { papers: [...], options: {} } in the request body.

const TOOL_LIMITS = {
    synthesize: 5,
    compare: 4,
    matrix: 6,
    gaps: 5
};

function synthesize(req, res) {
    const { papers = [] } = req.body;
    const limit = TOOL_LIMITS.synthesize;
    if (!papers.length) {
        return res.status(400).json({ error: "No papers provided. Add papers to the bench first." });
    }
    res.json({
        status: "coming_soon",
        tool: "synthesis",
        papersReceived: papers.length,
        papersLimit: limit,
        message: "Literature Synthesis is under construction. The AI engine will be wired in the next phase."
    });
}

function compare(req, res) {
    const { papers = [] } = req.body;
    const limit = TOOL_LIMITS.compare;
    if (papers.length < 2) {
        return res.status(400).json({ error: "Comparison requires at least 2 papers." });
    }
    res.json({
        status: "coming_soon",
        tool: "compare",
        papersReceived: papers.length,
        papersLimit: limit,
        message: "Paper Comparison is under construction. The AI engine will be wired in the next phase."
    });
}

function matrix(req, res) {
    const { papers = [] } = req.body;
    const limit = TOOL_LIMITS.matrix;
    if (!papers.length) {
        return res.status(400).json({ error: "No papers provided. Add papers to the bench first." });
    }
    res.json({
        status: "coming_soon",
        tool: "matrix",
        papersReceived: papers.length,
        papersLimit: limit,
        message: "Evidence Matrix is under construction. The AI engine will be wired in the next phase."
    });
}

function gaps(req, res) {
    const { papers = [] } = req.body;
    const limit = TOOL_LIMITS.gaps;
    if (!papers.length) {
        return res.status(400).json({ error: "No papers provided. Add papers to the bench first." });
    }
    res.json({
        status: "coming_soon",
        tool: "gaps",
        papersReceived: papers.length,
        papersLimit: limit,
        message: "Research Gap Detector is under construction. The AI engine will be wired in the next phase."
    });
}

module.exports = {
    synthesize,
    compare,
    matrix,
    gaps,
    TOOL_LIMITS
};
