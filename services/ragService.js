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

// Create or retrieve cached vector store for a paper (supports URL or direct text)
async function getPaperVectorStore(paperData, directText = null){
    if(vectorStoreCache.has(paperData.id)){
        return vectorStoreCache.get(paperData.id);
    }

    let text = directText;
    if(!text && paperData.pdfUrl){
        text = await getPaperText(paperData.pdfUrl);
    }

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

// Clean raw LaTeX formatting into human-readable plain math
function cleanMathNotation(text) {
    if (!text || typeof text !== "string") return text;
    return text
        // Remove LaTeX math block/inline delimiters $$ or $
        .replace(/\$\$([\s\S]*?)\$\$/g, "$1")
        .replace(/\$([^\$\n]+)\$/g, "$1")
        // Convert \frac{a}{b} to (a / b)
        .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "($1 / $2)")
        // Convert \sqrt{x} to sqrt($1)
        .replace(/\\sqrt\{([^{}]+)\}/g, "sqrt($1)")
        // Convert \text{...}, \mathbf{...}, \mathit{...}, \mathrm{...}
        .replace(/\\(?:text|mathbf|mathit|mathrm|bm|mathcal)\{([^{}]+)\}/g, "$1")
        // Common LaTeX symbols to clean unicode / readable math
        .replace(/\\times/g, "×")
        .replace(/\\cdot/g, "*")
        .replace(/\\pm/g, "±")
        .replace(/\\leq/g, "<=")
        .replace(/\\geq/g, ">=")
        .replace(/\\neq/g, "!=")
        .replace(/\\approx/g, "≈")
        .replace(/\\sum(?:_\{([^}]+)\})?(?:\^\{([^}]+)\})?/g, "sum")
        .replace(/\\prod(?:_\{([^}]+)\})?(?:\^\{([^}]+)\})?/g, "product")
        .replace(/\\int/g, "integral")
        .replace(/\\alpha/g, "α")
        .replace(/\\beta/g, "β")
        .replace(/\\gamma/g, "γ")
        .replace(/\\theta/g, "θ")
        .replace(/\\lambda/g, "λ")
        .replace(/\\mu/g, "μ")
        .replace(/\\sigma/g, "σ")
        .replace(/\\pi/g, "π")
        .replace(/\\Delta/g, "Δ")
        .replace(/\\rightarrow/g, "→")
        .replace(/\\leftarrow/g, "←")
        .replace(/\\in/g, "∈")
        .replace(/\\infty/g, "∞")
        .replace(/\\left\(/g, "(")
        .replace(/\\right\)/g, ")")
        .replace(/\\left\[/g, "[")
        .replace(/\\right\]/g, "]")
        // Remove residual backslashes before plain words
        .replace(/\\([a-zA-Z]+)/g, "$1")
        .trim();
}

// Generate RAG answer using Groq + System Prompt
async function generateRAGAnswer(question, relevantDocuments) {
    const context = relevantDocuments
        .map((document, index) => {
            return `[Context ${index+1}]\n${document.pageContent}`;
        })
        .join("\n\n");

    const prompt = `
You are Aether, an AI research assistant answering questions about a specific research paper.

Answer the user's question using the provided context from the research paper.

Core Instructions:
1. Strict Context Grounding:
   - Base your answer strictly on the provided context.
   - As an AI assistant, you must NOT make ungrounded assumptions, speculate, or introduce outside knowledge.

2. Handling "Assumptions" and Hypotheses (Crucial):
   - Distinguish between YOU (the AI) making assumptions vs. THE AUTHORS/RESEARCHERS stating assumptions.
   - If the user asks about assumptions, premises, or hypotheses, identify and explain the explicit assumptions or constraints made by the researchers in the paper text.
   - If the provided context does not mention any assumptions made by the authors, state clearly: "The provided context does not mention any explicit assumptions made by the authors."

3. Mathematical Formulas and Equations:
   - When presenting formulas, equations, or mathematical metrics from the paper, do NOT output raw LaTeX markup (such as \\frac{}, \\sum_{}, \\begin{equation}, \\mathbf{}, or \\cdot).
   - Instead, present formulas in clean, intuitive plain-text mathematical notation (for example: "Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V" or "Loss = - sum(y_i * log(p_i))").
   - Always briefly describe what the key terms/variables represent in plain English.

4. Ambiguous or Unclear Queries:
   - If the user's question is too vague, ambiguous, or incomplete to answer meaningfully, do not guess or hallucinate.
   - Instead, politely ask a concise clarifying question and suggest 2-3 specific topics (e.g., methodology, datasets, findings, or limitations) they can ask about.

5. Response Clarity:
   - If the context only partially answers the question, explain what is available and note that the context provides partial details.
   - If the answer cannot be found in the context, state that the provided context does not contain enough information to answer.
   - Keep answers clear, concise, and academically accurate.
   - Do not mention context numbers unless necessary.
   - Do not use Markdown formatting or asterisks for bold text.

CONTEXT:
${context}

QUESTION:
${question}
`;

    const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
            {
                role: "user",
                content: prompt
            }
        ]
    });

    const rawAnswer = completion.choices[0].message.content.trim();
    return cleanMathNotation(rawAnswer);
}

async function generateAbstractAnswer(
    question,
    title,
    abstract
) {
    const prompt = `
You are Aether, an AI research assistant.

The full text of this research paper is not currently accessible. You have access only to the paper's title and abstract.

Answer the user's question using ONLY the information contained in the title and abstract below.

Core Instructions:
1. Strict Grounding:
   - Base your answer strictly on the provided title and abstract.
   - Do not use outside knowledge or make ungrounded AI assumptions.
   - Do not claim to have access to the full paper.

2. Handling "Assumptions" (Crucial):
   - If the user asks about assumptions or hypotheses, accurately explain any assumptions mentioned by the authors in the abstract.
   - If the abstract does not state the researchers' assumptions, state clearly: "The provided abstract does not specify any explicit assumptions made by the authors."

3. Mathematical Formulas and Equations:
   - Do NOT output raw LaTeX markup. Use clean, human-readable plain-text math notation (e.g., "E = m * c^2" or "Accuracy = (TP + TN) / Total").

4. Ambiguous or Unclear Queries:
   - If the user's question is vague, ambiguous, or incomplete, ask a brief clarifying question rather than guessing.

5. Response Clarity:
   - If the abstract contains only partial information, clearly state that the answer is based on limited information from the abstract.
   - If the abstract does not contain the requested information, state that the available abstract does not provide enough information.
   - Keep answers clear, concise, and academically accurate.
   - Do not use Markdown formatting or asterisks.

TITLE:
${title}

ABSTRACT:
${abstract}

QUESTION:
${question}
`;

    const completion =
        await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
        });

    const rawAnswer = completion.choices[0].message.content.trim();
    return cleanMathNotation(rawAnswer);
}

module.exports = {
    getPaperText,
    splitPaperText,
    createVectorStore,
    getPaperVectorStore,
    retrieveRelevantChunks,
    generateRAGAnswer,
    generateAbstractAnswer
};