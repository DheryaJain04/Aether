const STORAGE_KEY = "aether-saved-papers";

export function getSavedPapers(){
    try{
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    }catch{
        return [];
    }
}

export function isPaperSaved(id){
    return getSavedPapers().some(paper => paper.id === id);
}

export function toggleSavedPaper(paper){
    const saved = getSavedPapers();
    const alreadySaved = saved.some(item => item.id === paper.id);

    let next;
    if (alreadySaved) {
        next = saved.filter(item => item.id !== paper.id);
    } else {
        const originTopic = paper.originTopic || paper.searchQuery || (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("aether_last_search_query") : "") || "";
        const entry = {
            ...paper,
            originTopic,
            playlists: Array.isArray(paper.playlists) ? paper.playlists : [],
            savedAt: new Date().toISOString()
        };
        next = [entry, ...saved];
    }

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
        console.error("Failed to save paper to localStorage", e);
    }

    return !alreadySaved;
}

export function updateSavedPaper(paperId, updates) {
    const saved = getSavedPapers();
    const next = saved.map(p => {
        if (p.id === paperId) {
            return { ...p, ...updates };
        }
        return p;
    });
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {}
    return next;
}
