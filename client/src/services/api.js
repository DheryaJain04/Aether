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

export function askPaper(id, question){
    return request(`/paper/${encodeURIComponent(id)}/chat`, {
        method: "POST",
        body: JSON.stringify({ question })
    });
}

// Authentication Endpoints
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
