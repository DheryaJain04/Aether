// services/lab/paperContextPackager.js
// Agent 1: Ingestion & Context Packager
// Responsibilities:
// 1. Validates paper inputs and limits
// 2. Extracts and sanitizes fullText, abstracts, and metadata
// 3. Allocates token budgets to guarantee context bounds across models

const MAX_TOKENS_PER_PAPER = 4000;

/**
 * Sanitizes and packages raw bench paper objects into normalized context packets.
 * @param {Array} papers - Array of bench paper objects
 * @param {number} maxLimit - Maximum allowed papers for current tool
 * @returns {Array} - Array of sanitized paper context packets
 */
function packagePaperContext(papers = [], maxLimit = 5) {
    if (!Array.isArray(papers) || papers.length === 0) {
        throw new Error("No papers provided for analysis.");
    }

    const clampedPapers = papers.slice(0, maxLimit);

    return clampedPapers.map((paper, idx) => {
        const id = paper.id || `paper_${idx + 1}`;
        const title = (paper.title || "Untitled Research Paper").trim();
        const authors = (paper.authors || "Unknown Authors").trim();
        const year = paper.year || "Unknown Year";
        const journal = paper.journal || "";

        // Normalize text content: prioritize fullText, fallback to abstract or summary
        let rawContent = paper.fullText || paper.abstract || paper.summary || "";
        if (typeof rawContent !== "string") {
            rawContent = JSON.stringify(rawContent);
        }

        // Basic token bounding (~4 characters per token heuristic)
        const maxChars = MAX_TOKENS_PER_PAPER * 4;
        const boundedText = rawContent.length > maxChars 
            ? rawContent.slice(0, maxChars) + "\n...[Context truncated for token limits]..." 
            : rawContent;

        return {
            id,
            index: idx + 1,
            title,
            authors,
            year,
            journal,
            isCustom: Boolean(paper.isCustom),
            content: boundedText
        };
    });
}

module.exports = {
    packagePaperContext
};
