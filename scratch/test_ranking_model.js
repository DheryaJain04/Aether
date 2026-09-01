const aetherScoreService = require("../services/aetherScoreService");

// Test with synthetic diverse research papers
const testPapers = [
    {
        display_name: "Attention Is All You Need",
        publication_year: 2017,
        cited_by_count: 120000,
        type: "proceedings-article",
        doi: "10.5555/3295222.3295349",
        primary_location: { source: { display_name: "NeurIPS", type: "conference", is_core: true } },
        denseScore: 0.95,
        bm25Score: 1.0
    },
    {
        display_name: "Recent Advances in Multimodal Large Language Models (2025)",
        publication_year: 2025,
        cited_by_count: 14,
        type: "journal-article",
        doi: "10.1016/j.ai.2025.01.002",
        primary_location: { source: { display_name: "Artificial Intelligence", type: "journal", is_core: true } },
        denseScore: 0.92,
        bm25Score: 0.9
    },
    {
        display_name: "Survey on Quantum Computing Paradigms",
        publication_year: 2021,
        cited_by_count: 450,
        type: "journal-article",
        doi: "10.1109/TQE.2021.001",
        primary_location: { source: { display_name: "IEEE Transactions on Quantum Engineering", type: "journal", is_core: true } },
        denseScore: 0.75,
        bm25Score: 0.6
    },
    {
        display_name: "A Preliminary Note on Transformer Layers",
        publication_year: 2026,
        cited_by_count: 0,
        type: "posted-content",
        doi: "10.48550/arXiv.2601.0001",
        primary_location: { source: { display_name: "arXiv", type: "repository" } },
        denseScore: 0.88,
        bm25Score: 0.85
    }
];

const ranked = aetherScoreService.rankPapers(testPapers);

console.log("=== RANKING MODEL TEST RESULTS ===");
ranked.forEach((p, idx) => {
    console.log(`\n#${idx + 1}: ${p.display_name} (${p.publication_year})`);
    console.log(`  Citations: ${p.cited_by_count} | Venue: ${p.primary_location?.source?.display_name}`);
    console.log(`  Subscores: Rel=${p.scoreBreakdown.relevance}% | Fresh=${p.scoreBreakdown.freshness}% | Imp=${p.scoreBreakdown.impact}% | Ven=${p.scoreBreakdown.venue}%`);
    console.log(`  Scores by Mode: Balanced=${p.scores.balanced}% | Relevant=${p.scores.relevant}% | Latest=${p.scores.latest}% | Influential=${p.scores.influential}%`);
});
