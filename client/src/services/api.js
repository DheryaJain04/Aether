const API_BASE_URL = "/api";

async function request(url, options = {}){
    const config = {
        ...options,
        credentials: "include", // Required for httpOnly cookie passing
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    };

    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if(!response.ok){
        throw new Error(data.error || "Something went wrong. Please try again.");
    }

    return data;
}

// Paper Search & Details
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

export function askPaper(id, question, history = []){
    return request(`/paper/${encodeURIComponent(id)}/chat`, {
        method: "POST",
        body: JSON.stringify({ question, history })
    });
}

export async function uploadPaper(file){
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/papers/upload`, {
        method: "POST",
        credentials: "include",
        body: formData
    });

    const data = await response.json().catch(() => ({}));
    if(!response.ok){
        throw new Error(data.error || "Failed to upload and parse research paper.");
    }
    return data;
}

// Authentication & Account Management
export function signupUser(data){
    return request(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        body: JSON.stringify(data)
    });
}

export function loginUser(credentials){
    return request(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        body: JSON.stringify(credentials)
    });
}

export function logoutUser(){
    return request(`${API_BASE_URL}/auth/logout`, {
        method: "POST"
    });
}

export function getCurrentUser(){
    return request(`${API_BASE_URL}/auth/me`);
}

export function changePassword(currentPassword, newPassword){
    return request(`${API_BASE_URL}/auth/password`, {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword })
    });
}

export function deleteAccount(password){
    return request(`${API_BASE_URL}/auth/account`, {
        method: "DELETE",
        body: JSON.stringify({ password })
    });
}

// User History
export function getSearchHistory(){
    return request(`${API_BASE_URL}/history/search`);
}

export function getViewHistory(){
    return request(`${API_BASE_URL}/history/views`);
}

export function clearUserHistory(type = "all"){
    return request(`${API_BASE_URL}/history`, {
        method: "DELETE",
        body: JSON.stringify({ type })
    });
}

// Collections API
export function getCollections(){
    return request(`${API_BASE_URL}/collections`);
}

export function createCollection(collectionData){
    return request(`${API_BASE_URL}/collections`, {
        method: "POST",
        body: JSON.stringify(collectionData)
    });
}

export function addPaperToCollection(collectionId, paper){
    return request(`${API_BASE_URL}/collections/${encodeURIComponent(collectionId)}/papers`, {
        method: "POST",
        body: JSON.stringify({ paper })
    });
}

export function removePaperFromCollection(collectionId, paperId){
    return request(`${API_BASE_URL}/collections/${encodeURIComponent(collectionId)}/papers/${encodeURIComponent(paperId)}`, {
        method: "DELETE"
    });
}

// Projects API
export function getProjects(){
    return request(`${API_BASE_URL}/projects`);
}

export function createProject(projectData){
    return request(`${API_BASE_URL}/projects`, {
        method: "POST",
        body: JSON.stringify(projectData)
    });
}

// Scholar Lab Multi-Agent Cognitive Tools
export function runSynthesis(papers, options = {}) {
    return request(`${API_BASE_URL}/lab/synthesize`, {
        method: "POST",
        body: JSON.stringify({ papers, options })
    });
}

export function runCompare(papers, options = {}) {
    return request(`${API_BASE_URL}/lab/compare`, {
        method: "POST",
        body: JSON.stringify({ papers, options })
    });
}

export function runMatrix(papers, options = {}) {
    return request(`${API_BASE_URL}/lab/matrix`, {
        method: "POST",
        body: JSON.stringify({ papers, options })
    });
}

export function runGaps(papers, options = {}) {
    return request(`${API_BASE_URL}/lab/gaps`, {
        method: "POST",
        body: JSON.stringify({ papers, options })
    });
}
