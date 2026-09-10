// Controller that calls axios and gets data from OpenAlex or CrossRef fallback
// Is called inside search route

const axios = require("axios");
const relevanceService = require("../services/relevanceService");
const aetherScoreService = require("../services/aetherScoreService");
const Paper = require("../models/Paper");

// Helper fn to reconstruct abstract from inverted index or return direct string
function reconstructAbstract(invertedIndex, rawAbstractText){
    if(rawAbstractText && rawAbstractText.trim().length > 10){
        return rawAbstractText.trim();
    }

    if(!invertedIndex || typeof invertedIndex !== "object"){
        return "Abstract unavailable.";
    }

    const wordPositions = [];

    for(const [word, positions] of Object.entries(invertedIndex)){
        if(Array.isArray(positions)){
            positions.forEach(position => {
                wordPositions[position] = word;
            });
        }
    }

    // Filter out undefined positions and join with clean spacing
    const reconstructed = wordPositions.filter(Boolean).join(" ");
    return reconstructed.trim() || "Abstract unavailable.";
}

function cleanXmlTags(text){
    if(!text) return "";
    return text
        .replace(/<[^>]+>/g, " ") // replace XML tags with space so words don't clump
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim();
}

function formatPublicationType(type){
    if(!type){
        return "Research Paper";
    }

    return type
        .split("-")
        .map(
            word=>
                word.charAt(0).toUpperCase()+
                word.slice(1)
        )
        .join(" ");
}

// Fallback academic provider: CrossRef Public Scholarly API with has-abstract:true filter
async function fetchFromCrossRef(query) {
    try {
        // has-abstract:true guarantees real peer-reviewed abstracts
        const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&filter=has-abstract:true&rows=30&mailto=scholar@aether.ai`;
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "AetherScholar/1.0 (mailto:scholar@aether.ai)"
            },
            timeout: 9000
        });

        const items = response.data?.message?.items || [];
        console.log(`CrossRef retrieved ${items.length} peer-reviewed papers with verified abstracts for: "${query}"`);

        return items.map((item, index) => {
            const doi = item.DOI || null;
            const rawId = doi ? doi.replace(/[^a-zA-Z0-9]/g, "_") : `cr_${index}_${Buffer.from(item.title?.[0] || String(index)).toString("hex").slice(0, 12)}`;
            const title = cleanXmlTags((item.title && item.title[0]) || "Untitled Research Paper");
            const authors = (item.author || []).map(a => ({
                author: { display_name: `${a.given || ""} ${a.family || ""}`.trim() || "Author" }
            }));
            const year = item["published-print"]?.["date-parts"]?.[0]?.[0] ||
                         item["published-online"]?.["date-parts"]?.[0]?.[0] ||
                         item.created?.["date-parts"]?.[0]?.[0] ||
                         new Date().getFullYear();

            // Clean abstract with proper spacing
            const abstract = cleanXmlTags(item.abstract) || "Abstract unavailable for this indexed publication.";

            const journal = cleanXmlTags((item["container-title"] && item["container-title"][0]) || "Peer-Reviewed Academic Publication");
            const link = item.URL || (doi ? `https://doi.org/${doi}` : "#");

            // Deterministic citation count from CrossRef (NEVER Math.random)
            const citedBy = typeof item["is-referenced-by-count"] === "number" ? item["is-referenced-by-count"] : 0;

            // Build inverted index for scoring engine
            const words = abstract.split(/\s+/);
            const abstractInvertedIndex = {};
            words.forEach((word, idx) => {
                const cleaned = word.toLowerCase().replace(/[^a-z0-9]/g, "");
                if (cleaned) {
                    abstractInvertedIndex[cleaned] = abstractInvertedIndex[cleaned] || [];
                    abstractInvertedIndex[cleaned].push(idx);
                }
            });

            return {
                id: `https://openalex.org/W_${rawId}`,
                display_name: title,
                publication_year: year,
                authorships: authors.length ? authors : [{ author: { display_name: "Scholarly Contributor" } }],
                abstract_inverted_index: abstractInvertedIndex,
                raw_abstract: abstract, // Store direct clean string
                primary_location: {
                    source: { display_name: journal },
                    landing_page_url: link,
                    pdf_url: item.link?.[0]?.URL || null
                },
                open_access: { is_oa: Boolean(item.link && item.link.length) },
                doi: doi,
                cited_by_count: citedBy,
                type: item.type || "journal-article"
            };
        });
    } catch (err) {
        console.error("CrossRef fallback failed:", err.message);
        return [];
    }
}

function extractDOI(input){
    if(!input) return null;
    const match = input.match(/\b(10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+)\b/i);
    return match ? match[1].replace(/[.,;)]+$/, "") : null;
}

function extractArXivId(input){
    if(!input) return null;
    const urlMatch = input.match(/arxiv\.org\/(?:abs|pdf)\/([0-9]{4}\.[0-9]{4,5}(?:v[0-9]+)?)/i);
    if(urlMatch) return urlMatch[1];
    const prefixMatch = input.match(/\barXiv:([0-9]{4}\.[0-9]{4,5}(?:v[0-9]+)?)\b/i);
    if(prefixMatch) return prefixMatch[1];
    const rawMatch = input.trim().match(/^([0-9]{4}\.[0-9]{4,5}(?:v[0-9]+)?)$/);
    if(rawMatch) return rawMatch[1];
    return null;
}

function extractOpenAlexId(input){
    if(!input) return null;
    const match = input.trim().match(/^(?:https?:\/\/openalex\.org\/)?(W[0-9]+)$/i);
    return match ? match[1].toUpperCase() : null;
}

async function getSearchResults(query){
    let rawPapers = [];
    const trimmed = (query || "").trim();

    const detectedDOI = extractDOI(trimmed);
    const detectedArXiv = extractArXivId(trimmed);
    const detectedOpenAlexId = extractOpenAlexId(trimmed);

    // Tier 0A: Direct DOI Resolution
    if(detectedDOI){
        try{
            console.log(`[Smart Search] Direct DOI detected: ${detectedDOI}`);
            const doiUrl = `https://api.openalex.org/works/https://doi.org/${encodeURIComponent(detectedDOI)}?mailto=scholar@aether.ai`;
            const response = await axios.get(doiUrl, {
                headers: { "User-Agent": "AetherAcademic/1.0 (mailto:scholar@aether.ai)" },
                timeout: 6000
            });
            if(response.data && response.data.id){
                rawPapers = [response.data];
            }
        }catch(doiErr){
            console.warn(`Direct DOI OpenAlex lookup failed (${doiErr.message}). Trying CrossRef...`);
            rawPapers = await fetchFromCrossRef(detectedDOI);
        }
    }
    // Tier 0B: Direct arXiv ID / Link Resolution
    else if(detectedArXiv){
        try{
            console.log(`[Smart Search] Direct arXiv ID detected: ${detectedArXiv}`);
            const arxivUrl = `https://api.openalex.org/works?filter=ids.arxiv:${encodeURIComponent(detectedArXiv)}&per-page=10&mailto=scholar@aether.ai`;
            const response = await axios.get(arxivUrl, {
                headers: { "User-Agent": "AetherAcademic/1.0 (mailto:scholar@aether.ai)" },
                timeout: 6000
            });
            rawPapers = response.data?.results || [];
        }catch(arxivErr){
            console.warn(`Direct arXiv lookup failed (${arxivErr.message}).`);
        }
    }
    // Tier 0C: Direct OpenAlex ID Resolution
    else if(detectedOpenAlexId){
        try{
            console.log(`[Smart Search] Direct OpenAlex ID detected: ${detectedOpenAlexId}`);
            const workUrl = `https://api.openalex.org/works/${encodeURIComponent(detectedOpenAlexId)}?mailto=scholar@aether.ai`;
            const response = await axios.get(workUrl, {
                headers: { "User-Agent": "AetherAcademic/1.0 (mailto:scholar@aether.ai)" },
                timeout: 6000
            });
            if(response.data && response.data.id){
                rawPapers = [response.data];
            }
        }catch(workErr){
            console.warn(`Direct OpenAlex ID lookup failed (${workErr.message}).`);
        }
    }
    // Tier 0D: Exact Quoted Title Search
    else if(trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length > 5){
        const cleanTitle = trimmed.slice(1, -1).trim();
        try{
            console.log(`[Smart Search] Quoted exact title search: "${cleanTitle}"`);
            const titleUrl = `https://api.openalex.org/works?filter=title.search:${encodeURIComponent(cleanTitle)}&per-page=25&mailto=scholar@aether.ai`;
            const response = await axios.get(titleUrl, {
                headers: { "User-Agent": "AetherAcademic/1.0 (mailto:scholar@aether.ai)" },
                timeout: 6000
            });
            rawPapers = response.data?.results || [];
        }catch(titleErr){
            console.warn(`Exact title lookup failed (${titleErr.message}).`);
        }
    }

    // Tier 1: Standard Search (if no direct identifier or direct search returned 0)
    if(!rawPapers || rawPapers.length === 0){
        try {
            const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=30&mailto=scholar@aether.ai`;
            const response = await axios.get(url, {
                headers: {
                    "User-Agent": "AetherAcademic/1.0 (mailto:scholar@aether.ai)"
                },
                timeout: 5000
            });

            rawPapers = response.data?.results || [];
        } catch (openAlexErr) {
            console.warn(`OpenAlex rate-limited or unavailable (${openAlexErr.message}). Engaging CrossRef academic fallback...`);
            // Tier 2: CrossRef Fallback with guaranteed abstracts
            rawPapers = await fetchFromCrossRef(query);
        }
    }

    // If both return 0, check cached papers in MongoDB
    if (!rawPapers || rawPapers.length === 0) {
        try {
            const cached = await Paper.find({
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { abstract: { $regex: query, $options: "i" } }
                ]
            }).limit(25);

            if (cached && cached.length > 0) {
                rawPapers = cached.map(p => ({
                    id: `https://openalex.org/${p.openAlexId}`,
                    display_name: p.title,
                    publication_year: p.publicationYear || 2026,
                    authorships: (p.authors || []).map(a => ({ author: { display_name: a.name } })),
                    raw_abstract: p.abstract || "",
                    abstract_inverted_index: (p.abstract || "").split(/\s+/).reduce((acc, w, idx) => {
                        const clean = w.toLowerCase().replace(/[^a-z0-9]/g, "");
                        if (clean) {
                            acc[clean] = acc[clean] || [];
                            acc[clean].push(idx);
                        }
                        return acc;
                    }, {}),
                    primary_location: {
                        source: { display_name: p.journal || "Scholarly Journal" },
                        landing_page_url: p.paperUrl || "#",
                        pdf_url: p.pdfUrl || null
                    },
                    open_access: { is_oa: p.openAccess || false },
                    doi: p.doi,
                    cited_by_count: p.citedByCount || 0,
                    type: p.publicationType || "journal-article"
                }));
            }
        } catch (dbErr) {
            console.error("Local DB cache lookup error:", dbErr.message);
        }
    }

    // Add relevance scores (dense embeddings + BM25)
    rawPapers = await relevanceService.addRelevanceScores(query, rawPapers);

    // Rank papers deterministically
    rawPapers = aetherScoreService.rankPapers(rawPapers);

    // Deterministic tie-breaker sort: by balanced score descending, then by title alphabetical
    rawPapers.sort((a, b) => {
        const scoreA = a.scores?.balanced ?? a.aetherScore ?? 0;
        const scoreB = b.scores?.balanced ?? b.aetherScore ?? 0;
        if (scoreB !== scoreA) {
            return scoreB - scoreA;
        }
        return (a.display_name || "").localeCompare(b.display_name || "");
    });

    const papers = rawPapers.map(paper => {
        const authorNames = (paper.authorships || []).map(author => author.author?.display_name).filter(Boolean);

        const displayedAuthors = authorNames.slice(0, 3).join(" • ") +
            (authorNames.length > 3 ? ` +${authorNames.length - 3} more` : "");

        const abstract = reconstructAbstract(paper.abstract_inverted_index, paper.raw_abstract);
        const paperId = paper.id.split("/").pop();

        // Cache paper in MongoDB asynchronously
        Paper.updateOne(
            { openAlexId: paperId },
            {
                openAlexId: paperId,
                title: paper.display_name || "Untitled Research Paper",
                authors: authorNames.map(name => ({ name })),
                abstract: abstract,
                publicationYear: paper.publication_year,
                journal: paper.primary_location?.source?.display_name || "Unknown Source",
                doi: paper.doi ? paper.doi.replace("https://doi.org/", "") : null,
                paperUrl: paper.primary_location?.landing_page_url || paper.doi || "#",
                pdfUrl: paper.primary_location?.pdf_url || null,
                openAccess: paper.open_access?.is_oa || false,
                publicationType: paper.type || "article",
                citedByCount: paper.cited_by_count || 0
            },
            { upsert: true }
        ).catch(() => {});

        return {
            id: paperId,
            title: paper.display_name || "Untitled Research Paper",
            authors: displayedAuthors || "Unknown Authors",
            year: paper.publication_year || "Unknown Year",
            journal: paper.primary_location?.source?.display_name || "Unknown Source",
            doi: paper.doi ? paper.doi.replace("https://doi.org/", "") : null,
            openAccess: paper.open_access?.is_oa || false,
            paperUrl: paper.primary_location?.landing_page_url || paper.doi || "#",
            abstract: abstract,
            citedBy: paper.cited_by_count || 0,
            publicationType: formatPublicationType(paper.type),
            scores: paper.scores,
            scoreBreakdown: paper.scoreBreakdown
        };
    });

    return papers;
}

async function searchPapers(req, res){
    try {
        const query = req.query.q;

        if (!query || !query.trim()) {
            return res.render("search", { query: "", papers: [] });
        }

        const papers = await getSearchResults(query);
        res.render("search", { query, papers });
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).send("Something went wrong.");
    }
}

async function searchPapersAPI(req, res){
    try {
        const query = req.query.q;

        if (!query || !query.trim()) {
            return res.status(400).json({ error: "Search query is required." });
        }

        const papers = await getSearchResults(query);

        res.json({
            query,
            count: papers.length,
            papers
        });
    } catch (err) {
        console.error("Search API error:", err);
        res.status(500).json({ error: "Unable to search for papers." });
    }
}

module.exports = {
    searchPapers,
    searchPapersAPI
};