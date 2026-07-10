// Controller who calls axios and gets data from axios 
// Is called inside search route
const axios = require("axios");

async function searchPapers(req, res) {
    try {
        const query = req.query.q;

        const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}`;

        const response = await axios.get(url);

        const papers = response.data.results;

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