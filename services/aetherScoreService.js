const CURRENT_YEAR = new Date().getFullYear();

const RANKING_WEIGHTS = {
    balanced: {
        relevance: 0.50,
        impact: 0.20,
        freshness: 0.15,
        venue: 0.15
    },
    relevant: {
        relevance: 0.70,
        impact: 0.15,
        freshness: 0.10,
        venue: 0.05
    },
    latest: {
        relevance: 0.40,
        impact: 0.10,
        freshness: 0.40,
        venue: 0.10
    },
    influential: {
        relevance: 0.35,
        impact: 0.45,
        freshness: 0.05,
        venue: 0.15
    }
};

function clamp(value,min=0,max=1){
    return Math.min(
        Math.max(value,min),
        max
    );
}

function calculateCosineSimilarity(vectorA,vectorB){
    if(
        !vectorA ||
        !vectorB ||
        vectorA.length !== vectorB.length
    ){
        return 0;
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for(let i=0;i<vectorA.length;i++){
        dotProduct += vectorA[i]*vectorB[i];
        magnitudeA += vectorA[i]*vectorA[i];
        magnitudeB += vectorB[i]*vectorB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if(magnitudeA===0 || magnitudeB===0){
        return 0;
    }

    return dotProduct/(magnitudeA*magnitudeB);
}

function calculateDenseRelevance(
    queryEmbedding,
    paperEmbedding
){
    const cosine =
        calculateCosineSimilarity(
            queryEmbedding,
            paperEmbedding
        );

    return clamp(
        (cosine+1)/2
    );
}

function calculateRelevanceScore(
    denseScore,
    bm25Score
){
    return clamp(
        0.70*denseScore+
        0.30*bm25Score
    );
}

function getCitationMomentum(paper){
    const counts =
        paper.counts_by_year || [];

    const completedYears = [
        CURRENT_YEAR-1,
        CURRENT_YEAR-2,
        CURRENT_YEAR-3
    ];

    const weights = [
        1.0,
        0.7,
        0.4
    ];

    let momentum = 0;

    completedYears.forEach(
        (year,index)=>{
            const yearData =
                counts.find(
                    item=>item.year===year
                );

            const citations =
                yearData
                    ? yearData.cited_by_count
                    : 0;

            momentum +=
                citations*weights[index];
        }
    );

    return momentum;
}

function calculateImpactScores(papers){
    const citationValues =
        papers.map(
            paper=>
                Math.log1p(
                    paper.cited_by_count || 0
                )
        );

    const momentumValues =
        papers.map(
            paper=>
                Math.log1p(
                    getCitationMomentum(paper)
                )
        );

    const maxCitation =
        Math.max(
            ...citationValues,
            1
        );

    const maxMomentum =
        Math.max(
            ...momentumValues,
            1
        );

    return papers.map(
        (paper,index)=>{

            const citationScore =
                citationValues[index]/
                maxCitation;

            const momentumScore =
                momentumValues[index]/
                maxMomentum;

            const rawImpact = 0.60 * citationScore + 0.40 * momentumScore;

            // Scientometric citation-lag incubation: freshly minted papers (< 2 years) get a fair baseline
            const pubYear = paper.publication_year || CURRENT_YEAR;
            const age = Math.max(0, CURRENT_YEAR - pubYear);
            const incubationBaseline = age < 2 ? 0.20 * (1 - age / 2) : 0;

            return clamp(Math.max(rawImpact, incubationBaseline));
        }
    );
}

function calculateFreshnessScore(
    publicationDate,
    publicationYear
){
    let age;

    if(publicationDate){
        const published =
            new Date(publicationDate);

        const now =
            new Date();

        age =
            (
                now.getTime()-
                published.getTime()
            )/
            (
                1000*
                60*
                60*
                24*
                365.25
            );
    }
    else if(publicationYear){
        age =
            CURRENT_YEAR-
            publicationYear;
    }
    else{
        return 0.5;
    }

    age =
        Math.max(
            0,
            age
        );

    return clamp(
        Math.exp(
            -0.10*age
        )
    );
}

function getSourceTypeScore(sourceType){
    switch(sourceType){
        case "journal":
            return 0.60;

        case "conference":
            return 0.60;

        case "book series":
            return 0.55;

        case "repository":
            return 0.40;

        default:
            return 0.40;
    }
}

function calculateVenueScore(paper){
    const location = paper.primary_location;
    const source = location?.source;
    const venueName = source?.display_name || paper.journal || "";

    const rawType = source?.type || (paper.type === "journal-article" ? "journal" : paper.type === "proceedings-article" ? "conference" : "repository");
    let score = getSourceTypeScore(rawType);

    if(source?.is_core){
        score += 0.20;
    }

    if(source?.is_in_doaj){
        score += 0.10;
    }

    if(location?.is_published || location?.is_accepted || paper.doi){
        score += 0.10;
    }

    // Recognize top academic publishers and prestigious scholarly indices
    const TOP_VENUES = /nature|science|ieee|acm|springer|elsevier|oxford|cambridge|wiley|cell|lancet|pnas|neurips|icml|cvpr|acl|aaai|embc|frontiers|plos/i;
    if (venueName && TOP_VENUES.test(venueName)) {
        score += 0.15;
    }

    return clamp(score);
}

function calculateAetherScore(
    components,
    mode="balanced"
){
    const weights =
        RANKING_WEIGHTS[mode] ||
        RANKING_WEIGHTS.balanced;

    const rawScore =
        weights.relevance*
            components.relevance+
        weights.impact*
            components.impact+
        weights.freshness*
            components.freshness+
        weights.venue*
            components.venue;

    return Math.round(
        clamp(rawScore)*100
    );
}

function rankPapers(papers){
    const impactScores =
        calculateImpactScores(papers);

    const scoredPapers =
        papers.map(
            (paper,index)=>{

                const relevance =
                    calculateRelevanceScore(
                        paper.denseScore || 0,
                        paper.bm25Score || 0
                    );

                const impact =
                    impactScores[index];

                const freshness =
                    calculateFreshnessScore(
                        paper.publication_date,
                        paper.publication_year
                    );

                const venue =
                    calculateVenueScore(
                        paper
                    );

                const components = {
                    relevance,
                    impact,
                    freshness,
                    venue
                };

                const scores = {
                    balanced:
                        calculateAetherScore(
                            components,
                            "balanced"
                        ),

                    relevant:
                        calculateAetherScore(
                            components,
                            "relevant"
                        ),

                    latest:
                        calculateAetherScore(
                            components,
                            "latest"
                        ),

                    influential:
                        calculateAetherScore(
                            components,
                            "influential"
                        )
                };

                return {
                    ...paper,

                    aetherScore:
                        scores.balanced,

                    scores,

                    scoreBreakdown:{
                        relevance:
                            Math.round(
                                relevance*100
                            ),

                        impact:
                            Math.round(
                                impact*100
                            ),

                        freshness:
                            Math.round(
                                freshness*100
                            ),

                        venue:
                            Math.round(
                                venue*100
                            )
                    }
                };
            }
        );

    scoredPapers.sort(
        (a,b)=>
            b.scores.balanced-
            a.scores.balanced
    );

    return scoredPapers;
}

module.exports = {
    calculateCosineSimilarity,
    calculateDenseRelevance,
    calculateRelevanceScore,
    calculateImpactScores,
    calculateFreshnessScore,
    calculateVenueScore,
    calculateAetherScore,
    rankPapers,
    RANKING_WEIGHTS
};