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

        console.log("CHAT REQUEST:",id);
        console.log("QUESTION:",question);

        // Fetch paper from OpenAlex
        const url = `https://api.openalex.org/works/${id}`;
        const response = await axios.get(url);
        const paper = response.data;

        // Collect every possible PDF URL
        const pdfUrls = [];

        if(paper.best_oa_location?.pdf_url){
            pdfUrls.push(
                paper.best_oa_location.pdf_url
            );
        }

        if(paper.primary_location?.pdf_url){
            pdfUrls.push(
                paper.primary_location.pdf_url
            );
        }

        if(Array.isArray(paper.locations)){
            paper.locations.forEach(location=>{
                if(location.pdf_url){
                    pdfUrls.push(location.pdf_url);
                }
            });
        }

        // Remove duplicate URLs
        const uniquePdfUrls = [
            ...new Set(pdfUrls)
        ];

        console.log(
            "PDF locations found:",
            uniquePdfUrls.length
        );

        // Try every available PDF
        for(const pdfUrl of uniquePdfUrls){
            try{
                console.log(
                    "Trying PDF:",
                    pdfUrl
                );

                const paperData = {
                    id:paper.id.split("/").pop(),
                    title:paper.display_name,
                    pdfUrl
                };

                const vectorStore =
                    await ragService.getPaperVectorStore(
                        paperData
                    );

                console.log(
                    "PDF successfully processed."
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
                    answer,
                    source:"full-paper"
                });

            }catch(pdfError){
                console.log(
                    "PDF failed:",
                    pdfUrl
                );

                console.log(
                    pdfError.message
                );
            }
        }

        // If every PDF failed, use abstract
        console.log(
            "No accessible PDF. Trying abstract fallback."
        );

        const abstract = reconstructAbstract(
            paper.abstract_inverted_index
        );

        if(
            abstract &&
            abstract.trim().length > 0
        ){
            const answer =
                await ragService.generateAbstractAnswer(
                    question,
                    paper.display_name,
                    abstract
                );

            return res.json({
                answer,
                source:"abstract"
            });
        }

        // Nothing usable available
        return res.status(400).json({
            error:
                "Aether could not access enough content from this paper to answer your question."
        });

    }catch(err){
        console.error(
            "PAPER CHAT ERROR:",
            err
        );

        return res.status(500).json({
            error:
                "Aether was unable to process this paper. Please try again."
        });
    }
}

module.exports = {
    showPaper,
    generateSummary,
    generateKeywords,
    chatWithPaper
};