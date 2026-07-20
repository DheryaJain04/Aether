const axios = require("axios");

async function getSummary(title, abstract){
    try{

        const prompt = `
You are Aether, an AI research assistant.

Summarize the following research paper for a university computer science student.

Include:
1. Overview: A concise 2–3 sentence explanation of what the paper is about.
2. Key Contribution: What the researchers propose or introduce.
3. Key Findings: The main results/findings only if stated in the provided abstract.
4. Why It Matters: The significance based strictly on the supplied information.

Keep the summary under 150 words.
Use simple English.
Use only information contained in the title and abstract. 
Do not invent results, limitations, methods, or claims that are not explicitly supported. 
If information is unavailable, omit that section.

Title:
${title}

Abstract:
${abstract}
`;

        const response = await axios.post(
            "http://localhost:11434/api/generate",
            {
                model:"qwen2.5:3b",
                prompt,
                stream:false
            }
        );

        return response.data.response.trim();

    }
    catch(err){
        console.log(err);
        return "Unable to generate Aether Summary.";
    }

}

async function getKeywords(title,abstract){
    try{
        const prompt = `
You are Aether, an AI research assistant.

Analyze the title and abstract of the research paper below.
Generate 5 to 7 concise academic keywords that best represent the paper's main topics, methods, technologies, and research domain.

Rules:
- Use only information supported by the title and abstract.
- Do not invent concepts that are not supported by the provided information.
- Prefer specific technical terms over broad generic terms.
- Do not include explanations.
- Return only comma-separated keywords.

Title:
${title}

Abstract:
${abstract}
`;

        const response = await axios.post(
            "http://localhost:11434/api/generate",
            {
                model:"qwen2.5:3b",
                prompt,
                stream:false
            }
        );

        const keywords = response.data.response
            .split(",")
            .map(keyword=>keyword.trim())
            .filter(keyword=>keyword.length>0);

        return keywords;
    }catch(err){
        console.log(err);
        return [];
    }
}

module.exports = {
    getSummary,
    getKeywords
};