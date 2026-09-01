import { getSavedPapers } from "./savedPapers";

const PLAYLISTS_STORAGE_KEY = "aether-scholar-playlists";

const DEFAULT_PLAYLISTS = [
    {
        id: "pl_thesis",
        name: "Thesis Literature Review",
        icon: "📑",
        description: "Primary foundational papers and methodology citations.",
        createdAt: "2026-09-01T00:00:00.000Z"
    },
    {
        id: "pl_breakthroughs",
        name: "SOTA & Breakthroughs",
        icon: "⚡",
        description: "State-of-the-art models, recent preprints, and innovations.",
        createdAt: "2026-09-01T00:00:00.000Z"
    }
];

export function getCustomPlaylists() {
    try {
        const stored = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(DEFAULT_PLAYLISTS));
            return DEFAULT_PLAYLISTS;
        }
        return JSON.parse(stored);
    } catch {
        return DEFAULT_PLAYLISTS;
    }
}

export function saveCustomPlaylists(playlists) {
    try {
        localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
    } catch (e) {
        console.error("Failed to save playlists to localStorage", e);
    }
}

export function createPlaylist(name, icon = "📁", description = "") {
    if (!name || !name.trim()) return null;
    const playlists = getCustomPlaylists();
    const newPlaylist = {
        id: `pl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        icon: icon || "📁",
        description: description.trim(),
        createdAt: new Date().toISOString()
    };
    const next = [...playlists, newPlaylist];
    saveCustomPlaylists(next);
    return newPlaylist;
}

export function deletePlaylist(playlistId) {
    const playlists = getCustomPlaylists().filter(p => p.id !== playlistId);
    saveCustomPlaylists(playlists);

    // Also remove this playlist from any saved papers
    const saved = getSavedPapers();
    const updated = saved.map(paper => {
        if (Array.isArray(paper.playlists) && paper.playlists.includes(playlistId)) {
            return {
                ...paper,
                playlists: paper.playlists.filter(id => id !== playlistId)
            };
        }
        return paper;
    });
    try {
        localStorage.setItem("aether-saved-papers", JSON.stringify(updated));
    } catch (e) {}
}

export function renamePlaylist(playlistId, newName) {
    if (!newName || !newName.trim()) return;
    const playlists = getCustomPlaylists().map(p => {
        if (p.id === playlistId) {
            return { ...p, name: newName.trim() };
        }
        return p;
    });
    saveCustomPlaylists(playlists);
}

// Extract auto-topic groupings from saved papers
export function getSmartTopicGroups(papers) {
    const topicMap = new Map();

    (papers || []).forEach(paper => {
        const topic = (paper.originTopic || paper.searchQuery || "").trim();
        if (topic) {
            const count = topicMap.get(topic) || 0;
            topicMap.set(topic, count + 1);
        }
    });

    return Array.from(topicMap.entries()).map(([topic, count]) => ({
        id: `topic_${encodeURIComponent(topic.toLowerCase())}`,
        name: topic,
        isTopicGroup: true,
        count,
        icon: "🔍",
        description: `Auto-grouped from search topic: "${topic}"`
    }));
}

// Toggle a paper in/out of a playlist
export function togglePaperPlaylist(paperId, playlistId) {
    const saved = getSavedPapers();
    const updated = saved.map(paper => {
        if (paper.id === paperId) {
            const currentLists = Array.isArray(paper.playlists) ? paper.playlists : [];
            const exists = currentLists.includes(playlistId);
            const nextLists = exists
                ? currentLists.filter(id => id !== playlistId)
                : [...currentLists, playlistId];
            return { ...paper, playlists: nextLists };
        }
        return paper;
    });

    try {
        localStorage.setItem("aether-saved-papers", JSON.stringify(updated));
    } catch (e) {}

    return updated;
}

export function addPaperToPlaylist(paperId, playlistId) {
    const saved = getSavedPapers();
    const updated = saved.map(paper => {
        if (paper.id === paperId) {
            const currentLists = Array.isArray(paper.playlists) ? paper.playlists : [];
            if (!currentLists.includes(playlistId)) {
                return { ...paper, playlists: [...currentLists, playlistId] };
            }
        }
        return paper;
    });

    try {
        localStorage.setItem("aether-saved-papers", JSON.stringify(updated));
    } catch (e) {}

    return updated;
}

export function removePaperFromPlaylist(paperId, playlistId) {
    const saved = getSavedPapers();
    const updated = saved.map(paper => {
        if (paper.id === paperId) {
            const currentLists = Array.isArray(paper.playlists) ? paper.playlists : [];
            return { ...paper, playlists: currentLists.filter(id => id !== playlistId) };
        }
        return paper;
    });

    try {
        localStorage.setItem("aether-saved-papers", JSON.stringify(updated));
    } catch (e) {}

    return updated;
}

// Generate batch bibliography export for an entire playlist
export function generateBatchBibliography(papers, format = "apa") {
    if (!Array.isArray(papers) || papers.length === 0) {
        return "No papers selected for bibliography export.";
    }

    return papers.map((paper, index) => {
        const title = paper.title || "Untitled Research Paper";
        const authors = paper.authors || "Scholarly Contributor";
        const year = paper.year || "n.d.";
        const journal = paper.journal || "Academic Publication";
        const doi = paper.doi ? `https://doi.org/${paper.doi}` : "";

        switch (format.toLowerCase()) {
            case "ieee":
                return `[${index + 1}] ${authors}, "${title}," ${journal}, ${year}.${doi ? ` doi: ${paper.doi}` : ""}`;
            case "mla":
                return `${authors}. "${title}." ${journal} (${year}).`;
            case "chicago":
                return `${authors}. ${year}. "${title}." ${journal}.${doi ? ` ${doi}` : ""}`;
            case "apa":
            default:
                return `${authors} (${year}). ${title}. ${journal}.${doi ? ` ${doi}` : ""}`;
        }
    }).join("\n\n");
}
