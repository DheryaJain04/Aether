//1.retrieves pdf using axios
//2.chunking text using langchain RecursiveTextSplitter (chunks+metadata)
//3.embedding using nomic-embed-text (each paper has its own FAISS index)

require("dotenv").config();
const axios = require("axios");
const pdf = require("pdf-parse");
const Groq = require("groq-sdk");
const {RecursiveCharacterTextSplitter} = require("@langchain/textsplitters");
const {OllamaEmbeddings} = require("@langchain/ollama");
const {FaissStore} = require("@langchain/community/vectorstores/faiss");

const groq = new Groq({
    apiKey:process.env.GROQ_API_KEY
});

const vectorStoreCache = new Map();

// Download PDF and extract full paper text
async function getPaperText(pdfUrl){
    try{
        const response = await axios.get(pdfUrl,{
            responseType:"arraybuffer"
        });
        const pdfBuffer = Buffer.from(response.data);
        const data = await pdf(pdfBuffer);
        return data.text;
    }catch(err){
        console.log("Error extracting paper text:",err.message);
        return null;
    }
}

// Split paper text into overlapping semantic chunks (stored as langchain docs with text+metadata)
async function splitPaperText(text,paperData){
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize:1500,
        chunkOverlap:200,
        separators:["\n\n","\n",". "," ",""]
    });

    const documents = await splitter.createDocuments(
        [text],
        [{
            paperId:paperData.id,
            title:paperData.title,
            source:paperData.pdfUrl
        }]
    );

    documents.forEach((document,index)=>{
        document.metadata.chunkIndex = index;
    });
    return documents;
}

// Generate embeddings and create FAISS vector store
async function createVectorStore(documents){
    const embeddings = new OllamaEmbeddings({
        model:"nomic-embed-text",
        baseUrl:"http://localhost:11434"
    });

    return await FaissStore.fromDocuments(
        documents,
        embeddings
    );
}

// Create or retrieve cached vector store for a paper
async function getPaperVectorStore(paperData){
    if(vectorStoreCache.has(paperData.id)){
        return vectorStoreCache.get(paperData.id);
    }

    const text = await getPaperText(paperData.pdfUrl);

    if(!text){
        throw new Error("Unable to extract paper text.");
    }

    const documents = await splitPaperText(
        text,
        paperData
    );

    const vectorStore = await createVectorStore(
        documents
    );

    vectorStoreCache.set(
        paperData.id,
        vectorStore
    );

    return vectorStore;
}

// Retrieve top-k (6) relevant chunks using FAISS similarity search
async function retrieveRelevantChunks(vectorStore,question){
    const relevantDocuments = await vectorStore.similaritySearch(
        question,
        6
    );
    return relevantDocuments;
}

// Generate RAG answer using Groq + System Prompt
async function generateRAGAnswer(question,relevantDocuments){
    const context = relevantDocuments
        .map((document,index)=>{
            return `[Context ${index+1}]\n${document.pageContent}`;
        })
        .join("\n\n");

    const prompt = `
You are Aether, an AI research assistant answering questions about a specific research paper.

Answer the user's question using ONLY the provided context from the research paper.

Rules:
- Base your answer strictly on the provided context.
- Do not use outside knowledge.
- Do not invent or assume information that is not present.
- If the context only partially answers the question, clearly state that the available context provides only partial information.
- If the answer cannot be found in the context, say that the provided context does not contain enough information to answer.
- Give a clear, concise, academically accurate answer.
- Do not mention context numbers unless necessary.

CONTEXT:
${context}

QUESTION:
${question}
`;

    const completion = await groq.chat.completions.create({
        model:"llama-3.3-70b-versatile",
        messages:[
            {
                role:"user",
                content:prompt
            }
        ]
    });

    return completion.choices[0].message.content.trim();
}

module.exports = {
    getPaperVectorStore,
    retrieveRelevantChunks,
    generateRAGAnswer
};