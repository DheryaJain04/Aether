// services/lab/labPipeline.js
// Scholar Lab 5-Layer Multi-Agent Relay Pipeline Orchestrator

const { packagePaperContext } = require("./paperContextPackager");
const { extractIntermediateRepresentations } = require("./domainExtractor");
const { arbitrateCrossPapers } = require("./crossPaperArbiter");
const { validateAndFormatOutput } = require("./groundingValidator");

const TOOL_LIMITS = {
    synthesis: 5,
    compare: 4,
    matrix: 6,
    gaps: 5
};

/**
 * Executes the full multi-agent pipeline for any Scholar Lab tool.
 * @param {string} tool - 'synthesis' | 'compare' | 'matrix' | 'gaps'
 * @param {Array} papers - Array of paper objects from user's workbench
 * @param {Object} options - Custom execution options
 * @returns {Promise<Object>} - Final validated result object
 */
async function runLabToolPipeline(tool, papers = [], options = {}) {
    const normalizedTool = tool.toLowerCase().trim();
    const limit = TOOL_LIMITS[normalizedTool] || 5;

    // Step 1: Agent 1 - Ingestion & Context Packager
    const paperPackets = packagePaperContext(papers, limit);

    // Step 2: Agent 2 - Domain Extraction (Parallelized IR Sheets)
    const irSheets = await extractIntermediateRepresentations(paperPackets, options);

    // Step 3: Agent 3 - Cross-Paper Arbiter & Semantic Synthesizer
    const rawArbitration = await arbitrateCrossPapers(normalizedTool, irSheets, options);

    // Step 4 & 5: Agent 4 & 5 - Grounding, Fact-Checking & Deterministic Output Formatter
    const finalResult = await validateAndFormatOutput(normalizedTool, rawArbitration, paperPackets);

    return finalResult;
}

module.exports = {
    runLabToolPipeline,
    TOOL_LIMITS
};
