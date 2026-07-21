require("dotenv").config();
const axios = require("axios");
const {GoogleGenAI} = require("@google/genai");
const Groq = require("groq-sdk");

const gemini = new GoogleGenAI({
    apiKey:process.env.GEMINI_API_KEY
});

const groq = new Groq({
    apiKey:process.env.GROQ_API_KEY
});

const OLLAMA_URL = "http://localhost:11434/api/generate";
const OLLAMA_MODEL = "qwen2.5:3b";

// Local Qwen fallback
async function generateWithQwen(prompt){
    const response = await axios.post(OLLAMA_URL,{
        model:OLLAMA_MODEL,
        prompt,
        stream:false
    });
    return response.data.response;
}

// Generate paper summary using Gemini
async function getSummary(title,abstract){
    const prompt = `
You are Aether, an AI research assistant.

Generate a clear, academically accurate summary of the following research paper.

The summary should:
- Explain the main research problem.
- Describe the proposed approach or methodology.
- Highlight the most important findings.
- Explain the significance of the research.
- Be concise but informative.
- Use clear language suitable for a university student.
- Do not invent information not present in the provided abstract.
- Return only the summary without greetings, headings, introductions, or markdown formatting.

Title:
${title}

Abstract:
${abstract}
`;

    try{
        console.time("Gemini Summary Time");

        const response = await gemini.models.generateContent({
            model:"gemini-3.5-flash",
            contents:prompt
        });

        console.timeEnd("Gemini Summary Time");
        return response.text.trim();
    }catch(err){
        console.log("Gemini summary failed:",err.message);
        console.log("Falling back to local Qwen...");
        try{
            return await generateWithQwen(prompt);
        }catch(fallbackErr){
            console.log("Qwen summary fallback failed:",fallbackErr.message);
            return "Unable to generate Aether Summary.";
        }
    }
}

// Generate paper keywords using Groq
async function getKeywords(title,abstract){
    const prompt = `
You are Aether, an AI research assistant.

Analyze the following research paper and generate exactly 5 relevant academic keywords.

Rules:
- Return only the keywords.
- Separate each keyword using a comma.
- Do not number the keywords.
- Do not include explanations.
- Do not include headings.
- Do not invent concepts unrelated to the provided abstract.

Title:
${title}

Abstract:
${abstract}
`;

    try{
        console.time("Groq Keywords Time");

        const completion = await groq.chat.completions.create({
            model:"llama-3.3-70b-versatile",
            messages:[
                {
                    role:"user",
                    content:prompt
                }
            ]
        });

        console.timeEnd("Groq Keywords Time");

        const result = completion.choices[0].message.content;

        return result
            .split(",")
            .map(keyword=>keyword.trim())
            .filter(keyword=>keyword.length>0)
            .slice(0,5);
    }catch(err){
        console.log("Groq keywords failed:",err.message);
        console.log("Falling back to local Qwen...");

        try{
            const result = await generateWithQwen(prompt);

            return result
                .split(",")
                .map(keyword=>keyword.trim())
                .filter(keyword=>keyword.length>0)
                .slice(0,5);
        }catch(fallbackErr){
            console.log("Qwen keywords fallback failed:",fallbackErr.message);
            return ["Keywords unavailable"];
        }
    }
}

module.exports = {
    getSummary,
    getKeywords
};