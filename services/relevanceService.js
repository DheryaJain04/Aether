// Calculates 70% dense + 30% lexical relevance

const {
    OllamaEmbeddings
} = require("@langchain/ollama");

const bm25Factory =
    require("wink-bm25-text-search");

const {
    calculateDenseRelevance
} = require("./aetherScoreService");

const embeddings =
    new OllamaEmbeddings({
        model:"nomic-embed-text"
    });

// Reconstruct OpenAlex abstract
function reconstructAbstract(invertedIndex){
    if(!invertedIndex){
        return "";
    }

    const words = [];

    for(
        const [word,positions]
        of Object.entries(invertedIndex)
    ){
        positions.forEach(position=>{
            words[position] = word;
        });
    }

    return words.join(" ");
}

// Build searchable representation of paper
function getPaperText(paper){
    const title =
        paper.display_name || "";

    const abstract =
        paper.raw_abstract ||
        reconstructAbstract(
            paper.abstract_inverted_index
        ) || "";

    const topics =
        (paper.topics || [])
            .map(topic =>
                topic.display_name
            )
            .join(" ");

    const keywords =
        (paper.keywords || [])
            .map(keyword =>
                keyword.display_name
            )
            .join(" ");

    return `
${title}
${title}
${title}

${abstract}

${topics}

${keywords}
`.trim();
}

// Normalize text consistently
function normalizeText(text){
    return String(text || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g," ")
        .replace(/\s+/g," ")
        .trim();
}

// Tokenizer used by BM25
function tokenize(text){
    return normalizeText(text)
        .split(" ")
        .filter(Boolean);
}

// Calculate dense semantic similarity
async function calculateDenseScores(
    query,
    papers
){
    const paperTexts =
        papers.map(
            getPaperText
        );

    const queryEmbedding =
        await embeddings.embedQuery(
            query
        );

    const paperEmbeddings =
        await embeddings.embedDocuments(
            paperTexts
        );

    return paperEmbeddings.map(
        paperEmbedding =>
            calculateDenseRelevance(
                queryEmbedding,
                paperEmbedding
            )
    );
}

// Fallback lexical overlap score
function calculateLexicalOverlap(
    query,
    paper
){
    const queryTerms =
        [...new Set(
            tokenize(query)
        )];

    if(queryTerms.length === 0){
        return 0;
    }

    const title =
        normalizeText(
            paper.display_name || ""
        );

    const fullText =
        normalizeText(
            getPaperText(paper)
        );

    let score = 0;

    queryTerms.forEach(term=>{

        // Strong reward if query term
        // appears in title
        if(
            title
                .split(" ")
                .includes(term)
        ){
            score += 2;
        }

        // Smaller reward if it appears
        // elsewhere in paper metadata
        else if(
            fullText
                .split(" ")
                .includes(term)
        ){
            score += 1;
        }
    });

    const maximumScore =
        queryTerms.length * 2;

    return Math.min(
        score / maximumScore,
        1
    );
}

// Calculate BM25 lexical scores
function calculateBM25Scores(
    query,
    papers
){
    try{
        const engine =
            bm25Factory();

        engine.defineConfig({
            fldWeights:{
                body:1
            },

            bm25Params:{
                k1:1.2,
                b:0.75,
                k:1
            }
        });

        // Same preprocessing for
        // documents and search query
        engine.definePrepTasks([
            tokenize
        ]);

        papers.forEach(
            (paper,index)=>{

                engine.addDoc(
                    {
                        body:
                            getPaperText(paper)
                    },
                    String(index)
                );
            }
        );

        engine.consolidate();

        const normalizedQuery =
            normalizeText(query);

        const results =
            engine.search(
                normalizedQuery
            );

        const rawScores =
            new Array(
                papers.length
            ).fill(0);

        results.forEach(result=>{

            const index =
                Number(result[0]);

            const score =
                Number(result[1]) || 0;

            if(
                Number.isInteger(index) &&
                index >= 0 &&
                index < papers.length
            ){
                rawScores[index] =
                    score;
            }
        });

        const maxScore =
            Math.max(
                ...rawScores
            );

        // If BM25 fails to produce
        // meaningful results, use
        // lexical overlap fallback
        if(
            !Number.isFinite(maxScore) ||
            maxScore <= 0
        ){
            return papers.map(
                paper =>
                    calculateLexicalOverlap(
                        query,
                        paper
                    )
            );
        }

        return rawScores.map(
            (score,index)=>{

                const bm25Normalized =
                    score / maxScore;

                const lexicalFallback =
                    calculateLexicalOverlap(
                        query,
                        papers[index]
                    );

                // Preserve BM25 ranking while
                // preventing obvious exact
                // matches from receiving zero
                return Math.max(
                    bm25Normalized,
                    lexicalFallback
                );
            }
        );

    }catch(err){

        console.error(
            "BM25 calculation failed:",
            err.message
        );

        return papers.map(
            paper =>
                calculateLexicalOverlap(
                    query,
                    paper
                )
        );
    }
}

// Add relevance components to papers
async function addRelevanceScores(
    query,
    papers
){
    let denseScores;
    try {
        denseScores = await calculateDenseScores(query, papers);
    } catch (denseErr) {
        // Gracefully fall back to BM25 when Ollama/embeddings are unavailable
        denseScores = papers.map(() => 0.5);
    }

    const bm25Scores = calculateBM25Scores(query, papers);

    return papers.map((paper, index) => {
        return {
            ...paper,
            denseScore: denseScores[index] !== undefined ? denseScores[index] : 0.5,
            bm25Score: bm25Scores[index] !== undefined ? bm25Scores[index] : 0.5
        };
    });
}

module.exports = {
    reconstructAbstract,
    getPaperText,
    calculateDenseScores,
    calculateBM25Scores,
    addRelevanceScores
};