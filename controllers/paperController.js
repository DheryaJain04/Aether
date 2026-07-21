// Controller calls OpenAlex for AI generation

const axios = require("axios");
const aiService = require("../services/aiService");
const citationService = require("../services/citationService");
const ragService = require("../services/ragService");

//helper fn to reconstruct abstract from OpenAlex
function reconstructAbstract(invertedIndex){
    if(!invertedIndex){
        return "Abstract unavailable.";
    }

    const words = [];

    for(const word in invertedIndex){
        invertedIndex[word].forEach(position=>{
            words[position] = word;
        });
    }

    return words.join(" ");
}

//loads paper page
async function showPaper(req,res){
    try{
        const id = req.params.id;
        const url = `https://api.openalex.org/works/${id}`;

        const response = await axios.get(url);

        const paper = response.data;
        const citations = citationService.generateCitations(paper);
        const abstract = reconstructAbstract(
            paper.abstract_inverted_index
        );

        console.log("Best OA Location:",paper.best_oa_location);
        console.log("Primary Location:",paper.primary_location);
        const searchQuery = req.query.q || "";

        const authorNames = paper.authorships.map(
            author=>author.author.display_name
        );

        const displayedAuthors =
            authorNames.slice(0,3).join(" • ") +
            (authorNames.length>3
                ? ` +${authorNames.length-3} more`
                : "");

        const paperData = {
            id: paper.id.split("/").pop(),
            title: paper.display_name,
            authors: displayedAuthors,
            journal:
                paper.primary_location?.source?.display_name ||
                "Research Paper",
            year: paper.publication_year,
            doi: paper.doi
                ? paper.doi.replace("https://doi.org/","")
                : null,
            openAccess: paper.open_access?.is_oa,
            abstract,
            summary:"Generating Aether Summary...",
            keywords:["Loading..."],
            citations
        };

        res.render("paper",{
            paper:paperData,
            searchQuery
        });

    }catch(err){
        console.log(err);
        res.send("Error loading paper.");
    }
}

//generates aether summary
async function generateSummary(req,res){
    try{
        const id = req.params.id;
        const url = `https://api.openalex.org/works/${id}`;
        const response = await axios.get(url);
        const paper = response.data;

        const abstract = reconstructAbstract(
            paper.abstract_inverted_index
        );

        const summary = await aiService.getSummary(
            paper.display_name,
            abstract
        );

        res.json({
            summary
        });

    }catch(err){
        console.log(err);
        res.status(500).json({
            summary:"Unable to generate summary."
        });
    }
}

//generates keywords
async function generateKeywords(req,res){
    try{
        const id = req.params.id;
        const url = `https://api.openalex.org/works/${id}`;
        const response = await axios.get(url);
        const paper = response.data;
        
        const abstract = reconstructAbstract(
            paper.abstract_inverted_index
        );
        
        const keywords = await aiService.getKeywords(
            paper.display_name,
            abstract
        );

        res.json({
            keywords
        });
    }catch(err){
        console.log(err);
        res.status(500).json({
            keywords:[]
        });
    }
}

//RAG Chatbot
async function chatWithPaper(req,res){
    try{
        const id = req.params.id;
        const question = req.body.question;

        if(!question || !question.trim()){
            return res.status(400).json({
                error:"Please enter a question."
            });
        }

        const url = `https://api.openalex.org/works/${id}`;
        const response = await axios.get(url);
        const paper = response.data;

        let pdfUrl =
            paper.best_oa_location?.pdf_url ||
            paper.primary_location?.pdf_url ||
            null;

        if(!pdfUrl && Array.isArray(paper.locations)){
            const pdfLocation = paper.locations.find(
                location=>location.pdf_url
            );

            if(pdfLocation){
                pdfUrl = pdfLocation.pdf_url;
            }
        }

        if(!pdfUrl){
            return res.status(400).json({
                error:"Aether cannot access the full text of this paper, so the paper chatbot is unavailable."
            });
        }

        const paperData = {
            id:paper.id.split("/").pop(),
            title:paper.display_name,
            pdfUrl
        };

        const vectorStore =
            await ragService.getPaperVectorStore(
                paperData
            );

        const relevantDocuments =
            await ragService.retrieveRelevantChunks(
                vectorStore,
                question
            );

        const answer =
            await ragService.generateRAGAnswer(
                question,
                relevantDocuments
            );

        return res.json({
            answer
        });
    }catch(err){
        console.error("Paper chat error:",err.message);

        return res.status(500).json({
            error:"Aether was unable to process this paper. Please try again."
        });
    }
}

module.exports = {
    showPaper,
    generateSummary,
    generateKeywords,
    chatWithPaper
};