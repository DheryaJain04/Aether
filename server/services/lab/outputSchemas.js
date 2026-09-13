// services/lab/outputSchemas.js
// Standardized JSON output schemas for all 4 Scholar Lab cognitive tools

const SCHEMAS = {
    SYNTHESIS: {
        title: "string",
        executiveSummary: "string",
        keyThemes: [
            {
                theme: "string",
                description: "string",
                papersSupported: ["string (paperId)"],
                methodologicalApproach: "string"
            }
        ],
        pointsOfConvergence: [
            {
                finding: "string",
                papers: ["string (paperId)"],
                evidence: "string"
            }
        ],
        pointsOfContradiction: [
            {
                dispute: "string",
                viewpointA: { paperId: "string", stance: "string" },
                viewpointB: { paperId: "string", stance: "string" },
                underlyingReason: "string"
            }
        ],
        futureTrajectory: "string"
    },

    COMPARE: {
        dimensions: [
            "Problem Statement",
            "Core Architecture / Methodology",
            "Dataset & Experimental Setup",
            "Key Results & Metrics",
            "Limitations & Constraints",
            "Trade-offs"
        ],
        paperProfiles: [
            {
                paperId: "string",
                title: "string",
                values: {
                    problemStatement: "string",
                    methodology: "string",
                    dataset: "string",
                    results: "string",
                    limitations: "string",
                    tradeOffs: "string"
                }
            }
        ],
        comparativeSummary: "string",
        tradeOffAnalysis: "string"
    },

    MATRIX: {
        claims: [
            {
                id: "string",
                claimText: "string",
                domain: "string",
                stances: [
                    {
                        paperId: "string",
                        stance: "supports | contradicts | partial | silent",
                        confidence: "high | medium | low",
                        quoteExcerpt: "string"
                    }
                ]
            }
        ],
        consensusScore: "number (0-100)",
        matrixSummary: "string"
    },

    GAPS: {
        methodologicalGaps: [
            {
                gap: "string",
                affectedPapers: ["string"],
                explanation: "string",
                proposedApproach: "string"
            }
        ],
        dataEvaluationGaps: [
            {
                gap: "string",
                affectedPapers: ["string"],
                explanation: "string",
                proposedApproach: "string"
            }
        ],
        theoreticalBlindspots: [
            {
                gap: "string",
                affectedPapers: ["string"],
                explanation: "string",
                proposedApproach: "string"
            }
        ],
        novelResearchQuestions: [
            {
                question: "string",
                rationale: "string",
                suggestedMethod: "string"
            }
        ]
    }
};

module.exports = {
    SCHEMAS
};
