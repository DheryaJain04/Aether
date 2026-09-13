function getStorageKey() {
    try {
        const raw = typeof localStorage !== "undefined" ? localStorage.getItem("aether_current_user") : null;
        if (raw) {
            const user = JSON.parse(raw);
            if (user?.id) return `aether-saved-papers_${user.id}`;
        }
    } catch {}
    return "aether-saved-papers";
}

export function getSavedPapers(){
    try{
        const key = getStorageKey();
        return JSON.parse(localStorage.getItem(key) || "[]");
    }catch{
        return [];
    }
}

export function saveSavedPapers(papers) {
    try {
        const key = getStorageKey();
        localStorage.setItem(key, JSON.stringify(papers));
        if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("aether-saved-updated"));
        }
    } catch (e) {
        console.error("Failed to save papers to localStorage", e);
    }
    return papers;
}

export function isPaperSaved(id){
    if (!id) return false;
    return getSavedPapers().some(paper => String(paper.id) === String(id));
}

export function toggleSavedPaper(paper){
    if (!paper || !paper.id) return false;
    const saved = getSavedPapers();
    const alreadySaved = saved.some(item => String(item.id) === String(paper.id));

    let next;
    if (alreadySaved) {
        next = saved.filter(item => String(item.id) !== String(paper.id));
    } else {
        const originTopic = paper.originTopic || paper.searchQuery || (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("aether_last_search_query") : "") || "";
        const entry = {
            id: paper.id,
            title: paper.title || "Untitled Research Paper",
            authors: paper.authors || "Scholarly Contributor",
            year: paper.year || new Date().getFullYear(),
            journal: paper.journal || "Academic Source",
            abstract: paper.abstract || "",
            doi: paper.doi || null,
            openAccess: Boolean(paper.openAccess),
            originTopic,
            playlists: Array.isArray(paper.playlists) ? paper.playlists : [],
            savedAt: new Date().toISOString()
        };
        next = [entry, ...saved];
    }

    saveSavedPapers(next);
    return !alreadySaved;
}

export function updateSavedPaper(paperId, updates) {
    const saved = getSavedPapers();
    const next = saved.map(p => {
        if (String(p.id) === String(paperId)) {
            return { ...p, ...updates };
        }
        return p;
    });
    saveSavedPapers(next);
    return next;
}
