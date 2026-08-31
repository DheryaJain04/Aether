const API_BASE_URL = "/api";

async function request(url, options){
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));

    if(!response.ok){
        throw new Error(data.error || "Something went wrong. Please try again.");
    }

    return data;
}

export function searchPapers(query){
    return request(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
}

export function getPaper(id){
    return request(`${API_BASE_URL}/papers/${encodeURIComponent(id)}`);
}

export function getSummary(id){
    return request(`/paper/${encodeURIComponent(id)}/summary`);
}

export function getKeywords(id){
    return request(`/paper/${encodeURIComponent(id)}/keywords`);
}

export function askPaper(id, question){
    return request(`/paper/${encodeURIComponent(id)}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
    });
}
