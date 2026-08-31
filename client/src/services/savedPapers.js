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
    const next = alreadySaved
        ? saved.filter(item => item.id !== paper.id)
        : [{ ...paper, savedAt: new Date().toISOString() }, ...saved];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return !alreadySaved;
}
