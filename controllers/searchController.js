// Controller who calls axios and gets data from axios 
// Is called inside search route
const axios = require("axios");

async function searchPapers(req, res) {
    try {
        const query = req.query.q;

        const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}`;

        const response = await axios.get(url);        

        const papers = response.data.results.map((paper) => {
            
            const authorNames = paper.authorships.map(
                author => author.author.display_name
            );

            const displayedAuthors =
            authorNames.slice(0,3).join(" • ") +
            (authorNames.length > 3
                ? ` +${authorNames.length-3} more`
                : "");

            return {
                id: paper.id,
                title: paper.display_name,
                authors: displayedAuthors,
                year: paper.publication_year,
                journal: 
                    paper.primary_location?.source?.display_name ||
                    "Research Paper",
                doi:
                    paper.doi
                        ? paper.doi.replace("https://doi.org/", "")
                        : null,
                openAccess: paper.open_access?.is_oa,
                paperUrl:
                    paper.primary_location?.landing_page_url ||
                    paper.doi ||
                    "#",
                keywords: ["Unavailable"],
                abstract: "Coming soon",
                relevance: Math.floor(Math.random()*16)+85,
            };
        });

        res.render("search", {
            query,
            papers
        });

    } catch (err) {
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