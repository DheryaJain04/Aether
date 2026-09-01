export const RANKING_MODES = {
    balanced: {
        id: "balanced",
        label: "Balanced",
        icon: "⚖️",
        weights: { relevance: 50, impact: 20, freshness: 15, venue: 15 },
        description: "Optimal balance of semantic relevance, citation impact, freshness, and venue authority."
    },
    relevant: {
        id: "relevant",
        label: "Relevance",
        icon: "🎯",
        weights: { relevance: 70, impact: 15, freshness: 10, venue: 5 },
        description: "Prioritizes exact conceptual alignment with your search query."
    },
    freshness: {
        id: "freshness",
        label: "Freshness",
        icon: "⚡",
        weights: { relevance: 40, impact: 10, freshness: 40, venue: 10 },
        description: "Elevates modern state-of-the-art literature and recent discoveries."
    },
    impact: {
        id: "impact",
        label: "Impact",
        icon: "🏆",
        weights: { relevance: 35, impact: 45, freshness: 5, venue: 15 },
        description: "Surfaces seminal, highly-cited papers with major scholarly influence."
    },
    venue: {
        id: "venue",
        label: "Venue",
        icon: "🏛️",
        weights: { relevance: 35, impact: 10, freshness: 10, venue: 45 },
        description: "Favors certified peer-reviewed journals and high-tier academic conferences."
    }
};

export function calculateDynamicAetherScore(scoreBreakdown, weights) {
    if (!scoreBreakdown) return 50;

    const rel = Number(scoreBreakdown.relevance ?? 50);
    const imp = Number(scoreBreakdown.impact ?? 50);
    const fre = Number(scoreBreakdown.freshness ?? 50);
    const ven = Number(scoreBreakdown.venue ?? 50);

    const wRel = Number(weights.relevance || 0);
    const wImp = Number(weights.impact || 0);
    const wFre = Number(weights.freshness || 0);
    const wVen = Number(weights.venue || 0);

    const totalWeight = wRel + wImp + wFre + wVen;
    if (totalWeight <= 0) return Math.round(rel);

    const raw = (wRel * rel + wImp * imp + wFre * fre + wVen * ven) / totalWeight;
    return Math.min(100, Math.max(0, Math.round(raw)));
}

export function rankPapersByWeights(papers, weights) {
    if (!Array.isArray(papers) || papers.length === 0) return [];

    const scored = papers.map((paper) => {
        const dynamicScore = calculateDynamicAetherScore(paper.scoreBreakdown, weights);
        return {
            ...paper,
            dynamicScore
        };
    });

    // Deterministic tie-breaker: dynamic score descending, then title alphabetical
    scored.sort((a, b) => {
        if (b.dynamicScore !== a.dynamicScore) {
            return b.dynamicScore - a.dynamicScore;
        }
        return (a.title || "").localeCompare(b.title || "");
    });

    return scored;
}
