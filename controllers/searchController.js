// Controller that calls axios and gets data from axios 
// Is called inside search route
const axios = require("axios");

// Reconstruct OpenAlex abstract from inverted index
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

// Format OpenAlex publication type
function formatPublicationType(type){
    if(!type){
        return "Research Paper";
    }
    return type
        .split("-")
        .map(word=>word.charAt(0).toUpperCase()+word.slice(1))
        .join(" ");
}

async function searchPapers(req,res){
    try{
        const query = req.query.q;

        const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}`;

        const response = await axios.get(url);

        const papers = response.data.results.map((paper)=>{

            // Format authors
            const authorNames = paper.authorships.map(
                author=>author.author.display_name
            );

            const displayedAuthors =
                authorNames.slice(0,3).join(" • ") +
                (
                    authorNames.length>3
                        ? ` +${authorNames.length-3} more`
                        : ""
                );

            // Reconstruct abstract
            const abstract = reconstructAbstract(
                paper.abstract_inverted_index
            );

            return {
                id:paper.id.split("/").pop(),

                title: paper.display_name ||"Untitled Research Paper",

                authors: displayedAuthors,

                year: paper.publication_year ||
                    "Unknown Year",

                journal: paper.primary_location?.source?.display_name ||
                    "Unknown Source",

                doi:
                    paper.doi
                        ? paper.doi.replace(
                            "https://doi.org/",
                            ""
                        )
                        : null,

                openAccess:
                    paper.open_access?.is_oa || false,

                paperUrl:
                    paper.primary_location?.landing_page_url ||
                    paper.doi ||
                    "#",

                abstract,

                citedBy:
                    paper.cited_by_count || 0,

                publicationType:
                    formatPublicationType(paper.type),

                relevance:
                    Math.floor(Math.random()*16)+85
            };
        });

        res.render("search",{
            query,
            papers
        });
    }catch(err){
        console.log(err);
        res.send("Something went wrong.");
    }
}

module.exports = {
    searchPapers
};

//async helps us await for OpenAlex to return data
//axios makes the API req - its stored in response
//we extract papers from the response