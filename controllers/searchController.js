// Controller that calls axios and gets data from OpenAlex
// Is called inside search route

const axios = require("axios");
const relevanceService = require("../services/relevanceService");
const aetherScoreService = require("../services/aetherScoreService");

function reconstructAbstract(invertedIndex){
    if(!invertedIndex){
        return null;
    }

    const words = [];

    for(const [word,positions] of Object.entries(invertedIndex)){
        positions.forEach(position=>{
            words[position] = word;
        });
    }

    return words.join(" ");
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

async function getSearchResults(query){

    const url =
        `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=50`;

    const response =
        await axios.get(url);

    let rawPapers =
        response.data.results;

    rawPapers =
        await relevanceService
            .addRelevanceScores(
                query,
                rawPapers
            );

    rawPapers =
        aetherScoreService
            .rankPapers(
                rawPapers
            );

    const papers =
        rawPapers.map(
            paper=>{

                const authorNames =
                    (
                        paper.authorships ||
                        []
                    ).map(
                        author=>
                            author.author
                                .display_name
                    );

                const displayedAuthors =
                    authorNames
                        .slice(0,3)
                        .join(" • ")+
                    (
                        authorNames.length>3
                            ? ` +${authorNames.length-3} more`
                            : ""
                    );

                const abstract =
                    reconstructAbstract(
                        paper.abstract_inverted_index
                    );

                return {
                    id:
                        paper.id
                            .split("/")
                            .pop(),

                    title:
                        paper.display_name ||
                        "Untitled Research Paper",

                    authors:
                        displayedAuthors ||
                        "Unknown Authors",

                    year:
                        paper.publication_year ||
                        "Unknown Year",

                    journal:
                        paper
                            .primary_location
                            ?.source
                            ?.display_name ||
                        "Unknown Source",

                    doi:
                        paper.doi
                            ? paper.doi.replace(
                                "https://doi.org/",
                                ""
                            )
                            : null,

                    openAccess:
                        paper
                            .open_access
                            ?.is_oa ||
                        false,

                    paperUrl:
                        paper
                            .primary_location
                            ?.landing_page_url ||
                        paper.doi ||
                        "#",

                    abstract:
                        abstract ||
                        "Abstract unavailable.",

                    citedBy:
                        paper.cited_by_count ||
                        0,

                    publicationType:
                        formatPublicationType(
                            paper.type
                        ),

                    scores:
                        paper.scores,

                    scoreBreakdown:
                        paper.scoreBreakdown
                };
            }
        );

    return papers;
}

async function searchPapers(req,res){
    try{
        const query =
            req.query.q;

        if(!query || !query.trim()){
            return res.render(
                "search",
                {
                    query:"",
                    papers:[]
                }
            );
        }

        const papers =
            await getSearchResults(
                query
            );

        res.render(
            "search",
            {
                query,
                papers
            }
        );

    }catch(err){
        console.error(
            "Search error:",
            err
        );

        res.status(500).send(
            "Something went wrong."
        );
    }
}

async function searchPapersAPI(req,res){
    try{
        const query =
            req.query.q;

        if(!query || !query.trim()){
            return res.status(400).json({
                error:
                    "Search query is required."
            });
        }

        const papers =
            await getSearchResults(
                query
            );

        res.json({
            query,
            count:
                papers.length,
            papers
        });

    }catch(err){
        console.error(
            "Search API error:",
            err
        );

        res.status(500).json({
            error:
                "Unable to search for papers."
        });
    }
}

module.exports = {
    searchPapers,
    searchPapersAPI
}; 

//async helps us await for OpenAlex to return data
//axios makes the API req - its stored in response
//we extract papers from the response