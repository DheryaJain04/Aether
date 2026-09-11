// services/lab/labAiCaller.js
// Multi-provider LLM caller with resilient fallback hierarchy:
// Primary: Google Gemini 2.5/2.0 Flash
// Fallback 1: Groq (Llama 3.3 70B / Fast Inference)
// Fallback 2: Local Ollama (Qwen 2.5)

require("dotenv").config();
const axios = require("axios");
const { GoogleGenAI } = require("@google/genai");
const Groq = require("groq-sdk");

const gemini = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const OLLAMA_URL = "http://localhost:11434/api/generate";
const OLLAMA_MODEL = "qwen2.5:3b";

/**
 * Strips markdown code fences, comments, and repairs common JSON formatting issues.
 */
function cleanAndParseJson(rawText) {
    if (!rawText || typeof rawText !== "string") {
        throw new Error("Empty or invalid LLM response.");
    }

    let cleaned = rawText.trim();

    // Strip markdown code fences ```json ... ``` or ``` ... ```
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/, "");
    cleaned = cleaned.trim();

    // Locate first '{' or '[' and last '}' or ']'
    const firstBrace = cleaned.indexOf("{");
    const firstBracket = cleaned.indexOf("[");
    let startIdx = -1;
    if (firstBrace !== -1 && firstBracket !== -1) {
        startIdx = Math.min(firstBrace, firstBracket);
    } else {
        startIdx = firstBrace !== -1 ? firstBrace : firstBracket;
    }

    const lastBrace = cleaned.lastIndexOf("}");
    const lastBracket = cleaned.lastIndexOf("]");
    const endIdx = Math.max(lastBrace, lastBracket);

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        cleaned = cleaned.substring(startIdx, endIdx + 1);
    }

    try {
        return JSON.parse(cleaned);
    } catch (parseErr) {
        // Attempt basic fix for trailing commas: ,} or ,]
        const relaxed = cleaned.replace(/,\s*([\]}])/g, "$1");
        return JSON.parse(relaxed);
    }
}

/**
 * Executes an LLM prompt requiring valid structured JSON output.
 */
async function callLlmJson({ systemPrompt, userPrompt, temperature = 0.2 }) {
    const combinedPrompt = `${systemPrompt}\n\nIMPORTANT: Output ONLY valid, raw JSON matching the required schema. Do not include markdown code blocks, backticks, or any conversational filler.\n\n${userPrompt}`;

    // 1. Primary: Gemini
    try {
        const response = await gemini.models.generateContent({
            model: "gemini-3.5-flash",
            contents: combinedPrompt,
            config: {
                temperature,
                responseMimeType: "application/json"
            }
        });

        const text = response.text;
        return cleanAndParseJson(text);
    } catch (geminiErr) {
        console.warn("Lab Agent Gemini JSON generation failed:", geminiErr.message, "— Falling back to Groq...");
    }

    // 2. Fallback: Groq
    try {
        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [
                { role: "system", content: systemPrompt + " Return ONLY valid raw JSON." },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature
        });

        const text = completion.choices[0].message.content;
        return cleanAndParseJson(text);
    } catch (groqErr) {
        console.warn("Lab Agent Groq JSON generation failed:", groqErr.message, "— Falling back to local Qwen...");
    }

    // 3. Fallback: Local Qwen (Ollama)
    try {
        const res = await axios.post(OLLAMA_URL, {
            model: OLLAMA_MODEL,
            prompt: combinedPrompt,
            stream: false,
            format: "json"
        }, { timeout: 30000 });

        return cleanAndParseJson(res.data.response);
    } catch (ollamaErr) {
        console.error("Lab Agent all LLM JSON providers failed:", ollamaErr.message);
        throw new Error("Multi-agent cognitive engine is temporarily unavailable. Please verify API keys or local LLM status.");
    }
}

/**
 * Executes an LLM prompt requiring free-form text or Markdown analysis.
 */
async function callLlmText({ systemPrompt, userPrompt, temperature = 0.3 }) {
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;

    // 1. Primary: Gemini
    try {
        const response = await gemini.models.generateContent({
            model: "gemini-3.5-flash",
            contents: combinedPrompt,
            config: { temperature }
        });
        return response.text.trim();
    } catch (geminiErr) {
        console.warn("Lab Agent Gemini text generation failed:", geminiErr.message, "— Falling back to Groq...");
    }

    // 2. Fallback: Groq
    try {
        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature
        });
        return completion.choices[0].message.content.trim();
    } catch (groqErr) {
        console.warn("Lab Agent Groq text generation failed:", groqErr.message, "— Falling back to local Qwen...");
    }

    // 3. Fallback: Local Qwen
    try {
        const res = await axios.post(OLLAMA_URL, {
            model: OLLAMA_MODEL,
            prompt: combinedPrompt,
            stream: false
        }, { timeout: 30000 });

        return res.data.response.trim();
    } catch (ollamaErr) {
        console.error("Lab Agent all LLM text providers failed:", ollamaErr.message);
        throw new Error("Multi-agent cognitive engine is temporarily unavailable.");
    }
}

module.exports = {
    callLlmJson,
    callLlmText,
    cleanAndParseJson
};
