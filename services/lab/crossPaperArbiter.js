// services/lab/crossPaperArbiter.js
// Agent 3: Cross-Paper Arbiter & Semantic Synthesizer
// Responsibilities:
// 1. Ingests all standardized IR sheets from Agent 2
// 2. Performs deep cross-paper comparative reasoning and stance evaluation
// 3. Executes specialized tool prompts for: Synthesis, Compare, Matrix, and Gaps

const { callLlmJson } = require("./labAiCaller");

// ── Prompts for Each Tool ──────────────────────────────────────────

const SYNTHESIS_PROMPT = `
You are Agent 3: Cross-Paper Arbiter & Synthesis Specialist in the Aether Scholar Lab multi-agent intelligence pipeline.
Your task is to conduct an authoritative, high-level literature meta-analysis synthesizing the provided research papers.

Analyze the papers collectively to identify:
1. An Executive Meta-Summary capturing the current state-of-the-art across these works.
2. Major Key Themes and overarching paradigms across the papers.
3. Points of Convergence: Concrete empirical or theoretical findings supported by multiple papers (explicitly link their paperIds).
4. Points of Contradiction or Methodological Divergence: Areas where papers dispute findings, assume differing premises, or utilize opposing architectures.
5. Future Research Trajectory: Where this collective body of research is steering the field.

Return ONLY a JSON object matching this schema:
{
  "title": "string (A descriptive academic title for this synthesis)",
  "executiveSummary": "string (3-4 well-structured paragraphs)",
  "keyThemes": [
    {
      "theme": "string",
      "description": "string",
      "papersSupported": ["string (exact paperId)"],
      "methodologicalApproach": "string"
    }
  ],
  "pointsOfConvergence": [
    {
      "finding": "string",
      "papers": ["string (exact paperId)"],
      "evidence": "string"
    }
  ],
  "pointsOfContradiction": [
    {
      "dispute": "string",
      "viewpointA": { "paperId": "string", "stance": "string" },
      "viewpointB": { "paperId": "string", "stance": "string" },
      "underlyingReason": "string"
    }
  ],
  "futureTrajectory": "string (detailed synthesis of future trajectory)"
}
`;

const COMPARE_PROMPT = `
You are Agent 3: Paper Comparison Specialist in the Aether Scholar Lab multi-agent intelligence pipeline.
Your task is to generate a structured, side-by-side dimensional comparison across the provided research papers.

For each paper, summarize its attributes across these 6 standard dimensions:
- Problem Statement
- Core Architecture / Methodology
- Dataset & Experimental Setup
- Key Results & Metrics
- Limitations & Constraints
- Trade-offs

Then provide an overall Comparative Summary and a deep Trade-Off Analysis weighing the advantages and disadvantages of each approach.

Return ONLY a JSON object matching this schema:
{
  "dimensions": [
    "Problem Statement",
    "Core Architecture / Methodology",
    "Dataset & Experimental Setup",
    "Key Results & Metrics",
    "Limitations & Constraints",
    "Trade-offs"
  ],
  "paperProfiles": [
    {
      "paperId": "string (exact paperId)",
      "title": "string",
      "values": {
        "problemStatement": "string",
        "methodology": "string",
        "dataset": "string",
        "results": "string",
        "limitations": "string",
        "tradeOffs": "string"
      }
    }
  ],
  "comparativeSummary": "string",
  "tradeOffAnalysis": "string"
}
`;

const MATRIX_PROMPT = `
You are Agent 3: Evidence Matrix Arbiter in the Aether Scholar Lab multi-agent intelligence pipeline.
Your task is to extract 4 to 8 central, contentious, or foundational empirical claims made across the provided papers, and evaluate each paper's stance on each claim.

For each claim:
- Formulate the claim as a clear, falsifiable scientific assertion.
- For EVERY paper in the corpus, determine its stance:
  * "supports": The paper explicitly validates or provides evidence for the claim.
  * "contradicts": The paper disputes, disproves, or opposes the claim.
  * "partial": The paper offers mixed, conditional, or nuanced evidence.
  * "silent": The paper does not address or evaluate this claim.
- Provide a confidence level ("high", "medium", "low") and a brief quote or concrete evidence excerpt grounding the stance.

Calculate an overall corpus Consensus Score (integer 0 to 100) indicating the degree of agreement across the papers.

Return ONLY a JSON object matching this schema:
{
  "claims": [
    {
      "id": "claim_1",
      "claimText": "string (clear assertion)",
      "domain": "string (e.g. Scalability, Generalization, Efficiency)",
      "stances": [
        {
          "paperId": "string (exact paperId)",
          "stance": "supports" | "contradicts" | "partial" | "silent",
          "confidence": "high" | "medium" | "low",
          "quoteExcerpt": "string (evidence or reason for this stance)"
        }
      ]
    }
  ],
  "consensusScore": 75,
  "matrixSummary": "string (meta-analysis of the empirical evidence grid)"
}
`;

const GAPS_PROMPT = `
You are Agent 3: Research Gap Detector in the Aether Scholar Lab multi-agent intelligence pipeline.
Your task is to analyze the collective corpus of papers to identify blind spots, unaddressed limitations, and generate novel, high-impact research questions.

Categorize gaps into:
1. Methodological Gaps: Algorithmic, architectural, or structural flaws/limitations in the methods used.
2. Data & Evaluation Gaps: Skewed datasets, lack of diverse benchmarks, narrow metrics, or missing real-world evaluation.
3. Theoretical Blindspots: Unverified fundamental assumptions, mathematical edge cases, or lack of interpretability.
4. Novel Research Questions: 3-5 concrete, actionable, and inspiring research directions for future papers.

Return ONLY a JSON object matching this schema:
{
  "methodologicalGaps": [
    {
      "gap": "string",
      "affectedPapers": ["string (exact paperId)"],
      "explanation": "string",
      "proposedApproach": "string"
    }
  ],
  "dataEvaluationGaps": [
    {
      "gap": "string",
      "affectedPapers": ["string (exact paperId)"],
      "explanation": "string",
      "proposedApproach": "string"
    }
  ],
  "theoreticalBlindspots": [
    {
      "gap": "string",
      "affectedPapers": ["string (exact paperId)"],
      "explanation": "string",
      "proposedApproach": "string"
    }
  ],
  "novelResearchQuestions": [
    {
      "question": "string",
      "rationale": "string",
      "suggestedMethod": "string"
    }
  ]
}
`;

/**
 * Arbitrates cross-paper analysis for any of the 4 Scholar Lab cognitive tools.
 * @param {string} tool - 'synthesis' | 'compare' | 'matrix' | 'gaps'
 * @param {Array} irSheets - Array of standardized IR sheets from Agent 2
 * @param {Object} options - Tool-specific configuration
 * @returns {Promise<Object>} - Raw arbitrated cross-paper analysis
 */
async function arbitrateCrossPapers(tool, irSheets = [], options = {}) {
    const normalizedTool = tool.toLowerCase().trim();

    let systemPrompt = SYNTHESIS_PROMPT;
    if (normalizedTool === "compare") systemPrompt = COMPARE_PROMPT;
    else if (normalizedTool === "matrix") systemPrompt = MATRIX_PROMPT;
    else if (normalizedTool === "gaps") systemPrompt = GAPS_PROMPT;

    const irDigest = irSheets.map((sheet, idx) => `
---
Paper [${idx + 1}] ID: ${sheet.paperId}
Title: ${sheet.title}
Authors: ${sheet.authors} (${sheet.year})
Core Problem: ${sheet.coreProblem}
Methodology: ${sheet.methodology}
Datasets & Benchmarks: ${sheet.datasetsBenchmarks}
Key Findings:
${sheet.keyFindings.map(f => `  • ${f}`).join("\n")}
Limitations:
${sheet.limitations.map(l => `  • ${l}`).join("\n")}
Key Claims:
${sheet.keyClaims.map(c => `  • ${c}`).join("\n")}
`).join("\n");

    const userPrompt = `
Here are the Intermediate Representation (IR) sheets for the ${irSheets.length} papers staged on the workbench:

${irDigest}

Execute the comprehensive cross-paper analysis for the "${normalizedTool}" tool. Ensure all paper IDs in your output match the provided paper IDs exactly.
`;

    const rawResult = await callLlmJson({
        systemPrompt,
        userPrompt,
        temperature: 0.2
    });

    return rawResult;
}

module.exports = {
    arbitrateCrossPapers
};
