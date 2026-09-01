import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import PaperCard from "../components/PaperCard";
import PlaylistMenu from "../components/PlaylistMenu";
import { getSavedPapers, toggleSavedPaper } from "../services/savedPapers";
import {
    getCustomPlaylists,
    createPlaylist,
    deletePlaylist,
    getSmartTopicGroups,
    togglePaperPlaylist,
    removePaperFromPlaylist,
    generateBatchBibliography
} from "../services/playlistService";
import AetherBrand from "../components/AetherBrand";
import UserMenu from "../components/UserMenu";
import "./SavedPapers.css";

export default function SavedPapers() {
    const [papers, setPapers] = useState(getSavedPapers);
    const [playlists, setPlaylists] = useState(getCustomPlaylists);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState("all");
    const [filterQuery, setFilterQuery] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddPapersModal, setShowAddPapersModal] = useState(false);
    const [modalFilterQuery, setModalFilterQuery] = useState("");
    const [newPlTitle, setNewPlTitle] = useState("");
    const [newPlDesc, setNewPlDesc] = useState("");
    const [exportFormat, setExportFormat] = useState("apa");
    const [copiedExport, setCopiedExport] = useState(false);

    function reloadData() {
        setPapers(getSavedPapers());
        setPlaylists(getCustomPlaylists());
    }

    const isCustomPlaylist = selectedPlaylistId !== "all" && !selectedPlaylistId.startsWith("topic_");

    // Auto-discover smart topic playlists from saved papers
    const smartTopics = useMemo(() => {
        return getSmartTopicGroups(papers);
    }, [papers]);

    // Active playlist metadata
    const activePlaylistInfo = useMemo(() => {
        if (selectedPlaylistId === "all") {
            return {
                id: "all",
                name: "All Saved Papers",
                icon: "✦",
                description: "Complete personal library of saved peer-reviewed research papers."
            };
        }
        if (selectedPlaylistId.startsWith("topic_")) {
            const topicGroup = smartTopics.find(t => t.id === selectedPlaylistId);
            return {
                id: selectedPlaylistId,
                name: topicGroup?.name || "Topic Group",
                icon: "🔍",
                description: `Smart Auto-Playlist: Curated from search query "${topicGroup?.name}".`
            };
        }
        const custom = playlists.find(p => p.id === selectedPlaylistId);
        return custom || {
            id: selectedPlaylistId,
            name: "Research Playlist",
            icon: "📁",
            description: "Custom scholar research playlist."
        };
    }, [selectedPlaylistId, smartTopics, playlists]);

    // Filter papers for current view
    const currentPlaylistPapers = useMemo(() => {
        let list = papers;

        if (selectedPlaylistId === "all") {
            list = papers;
        } else if (selectedPlaylistId.startsWith("topic_")) {
            const topicGroup = smartTopics.find(t => t.id === selectedPlaylistId);
            const targetTopic = topicGroup?.name?.toLowerCase();
            list = papers.filter(p => (p.originTopic || p.searchQuery || "").toLowerCase() === targetTopic);
        } else {
            list = papers.filter(p => Array.isArray(p.playlists) && p.playlists.includes(selectedPlaylistId));
        }

        if (filterQuery.trim()) {
            const q = filterQuery.toLowerCase();
            list = list.filter(p =>
                (p.title || "").toLowerCase().includes(q) ||
                (p.authors || "").toLowerCase().includes(q) ||
                (p.journal || "").toLowerCase().includes(q)
            );
        }

        return list;
    }, [papers, selectedPlaylistId, smartTopics, filterQuery]);

    // Filtered papers inside the "Add Papers to Playlist" modal
    const modalFilteredPapers = useMemo(() => {
        if (!modalFilterQuery.trim()) return papers;
        const q = modalFilterQuery.toLowerCase();
        return papers.filter(p =>
            (p.title || "").toLowerCase().includes(q) ||
            (p.authors || "").toLowerCase().includes(q) ||
            (p.journal || "").toLowerCase().includes(q) ||
            (p.originTopic || "").toLowerCase().includes(q)
        );
    }, [papers, modalFilterQuery]);

    const modalInPlaylistCount = useMemo(() => {
        return papers.filter(p => Array.isArray(p.playlists) && p.playlists.includes(selectedPlaylistId)).length;
    }, [papers, selectedPlaylistId]);

    function handleCreatePlaylistSubmit(e) {
        e.preventDefault();
        if (!newPlTitle.trim()) return;
        const created = createPlaylist(newPlTitle, "📁", newPlDesc);
        if (created) {
            setPlaylists(getCustomPlaylists());
            setSelectedPlaylistId(created.id);
            setNewPlTitle("");
            setNewPlDesc("");
            setShowCreateModal(false);
        }
    }

    function handleDeletePlaylist(plId, e) {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this research playlist? Papers will remain in your library.")) {
            deletePlaylist(plId);
            setPlaylists(getCustomPlaylists());
            if (selectedPlaylistId === plId) {
                setSelectedPlaylistId("all");
            }
        }
    }

    function handleTogglePaperInPlaylist(paperId) {
        togglePaperPlaylist(paperId, selectedPlaylistId);
        reloadData();
    }

    function handleRemovePaperFromCurrent(paperId) {
        removePaperFromPlaylist(paperId, selectedPlaylistId);
        reloadData();
    }

    async function handleExportBibliography() {
        const text = generateBatchBibliography(currentPlaylistPapers, exportFormat);
        try {
            await navigator.clipboard.writeText(text);
            setCopiedExport(true);
            setTimeout(() => setCopiedExport(false), 2000);
        } catch {
            alert(text);
        }
    }

    return (
        <main className="workspace-page">
            <header className="workspace-top-header">
                <Link to="/" className="back-search-btn">← Back to Search</Link>
                <AetherBrand size="md" variant="horizontal" />
                <div style={{ display: "flex", alignItems: "center", justifySelf: "end" }}>
                    <UserMenu />
                </div>
            </header>

            <div className="workspace-container">
                {/* LEFT SIDEBAR: PLAYLIST NAVIGATION */}
                <aside className="workspace-sidebar" aria-label="Research Playlists">
                    <div className="sidebar-header">
                        <span className="sidebar-badge">RESEARCH WORKSPACE</span>
                        <h2>Library & Playlists</h2>
                    </div>

                    <div className="sidebar-nav-group">
                        <button
                            type="button"
                            className={`sidebar-nav-item ${selectedPlaylistId === "all" ? "is-active" : ""}`}
                            onClick={() => setSelectedPlaylistId("all")}
                        >
                            <span className="nav-icon">✦</span>
                            <span className="nav-label">All Saved Papers</span>
                            <span className="nav-count">{papers.length}</span>
                        </button>
                    </div>

                    {/* SMART AUTO-TOPIC PLAYLISTS */}
                    {smartTopics.length > 0 && (
                        <div className="sidebar-section">
                            <div className="sidebar-section-title">
                                <span>SMART TOPIC GROUPS</span>
                                <span className="auto-pill">AUTO</span>
                            </div>
                            <div className="sidebar-nav-group">
                                {smartTopics.map(topic => {
                                    const isSelected = selectedPlaylistId === topic.id;
                                    return (
                                        <button
                                            key={topic.id}
                                            type="button"
                                            className={`sidebar-nav-item ${isSelected ? "is-active" : ""}`}
                                            onClick={() => setSelectedPlaylistId(topic.id)}
                                            title={topic.description}
                                        >
                                            <span className="nav-icon">{topic.icon}</span>
                                            <span className="nav-label">{topic.name}</span>
                                            <span className="nav-count">{topic.count}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* CUSTOM SCHOLAR PLAYLISTS */}
                    <div className="sidebar-section">
                        <div className="sidebar-section-title">
                            <span>CUSTOM PLAYLISTS</span>
                            <button
                                type="button"
                                className="add-playlist-inline-btn"
                                onClick={() => setShowCreateModal(true)}
                                title="Create new playlist"
                            >
                                + New
                            </button>
                        </div>

                        <div className="sidebar-nav-group">
                            {playlists.map(pl => {
                                const isSelected = selectedPlaylistId === pl.id;
                                const count = papers.filter(p => Array.isArray(p.playlists) && p.playlists.includes(pl.id)).length;
                                return (
                                    <div
                                        key={pl.id}
                                        className={`sidebar-nav-item custom-pl-item ${isSelected ? "is-active" : ""}`}
                                        onClick={() => setSelectedPlaylistId(pl.id)}
                                    >
                                        <span className="nav-icon">{pl.icon || "📁"}</span>
                                        <span className="nav-label">{pl.name}</span>
                                        <span className="nav-count">{count}</span>
                                        <button
                                            type="button"
                                            className="delete-pl-btn"
                                            onClick={(e) => handleDeletePlaylist(pl.id, e)}
                                            title="Delete this playlist"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                );
                            })}

                            <button
                                type="button"
                                className="create-playlist-btn"
                                onClick={() => setShowCreateModal(true)}
                            >
                                <span className="plus-sign">+</span>
                                <span>New Research Playlist</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT: ACTIVE PLAYLIST CANVAS */}
                <section className="workspace-canvas" aria-label="Playlist Details and Papers">
                    <header className="canvas-header">
                        <div className="canvas-header-meta">
                            <div className="canvas-title-row">
                                <span className="canvas-icon">{activePlaylistInfo.icon}</span>
                                <h1>{activePlaylistInfo.name}</h1>
                            </div>
                            <p className="canvas-desc">{activePlaylistInfo.description}</p>
                            <span className="canvas-stats">
                                {currentPlaylistPapers.length} {currentPlaylistPapers.length === 1 ? "Research Paper" : "Research Papers"}
                            </span>
                        </div>

                        {/* CANVAS ACTIONS: ADD PAPERS DIRECTLY & BATCH EXPORT */}
                        <div className="canvas-actions-row">
                            {isCustomPlaylist && (
                                <button
                                    type="button"
                                    className="add-papers-main-btn"
                                    onClick={() => {
                                        setModalFilterQuery("");
                                        setShowAddPapersModal(true);
                                    }}
                                >
                                    <span className="plus-icon">+</span>
                                    <span>Add Papers from Library</span>
                                </button>
                            )}

                            {currentPlaylistPapers.length > 0 && (
                                <button
                                    type="button"
                                    className={`export-btn ${copiedExport ? "is-copied" : ""}`}
                                    onClick={handleExportBibliography}
                                >
                                    {copiedExport ? "✓ All Citations Copied!" : "📋 Copy All Citations"}
                                </button>
                            )}
                        </div>
                    </header>

                    {/* IN-PLAYLIST SEARCH / FILTER */}
                    {papers.length > 0 && (
                        <div className="playlist-search-bar">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder={`Filter papers in "${activePlaylistInfo.name}"...`}
                                value={filterQuery}
                                onChange={(e) => setFilterQuery(e.target.value)}
                            />
                            {filterQuery && (
                                <button
                                    type="button"
                                    className="clear-filter-btn"
                                    onClick={() => setFilterQuery("")}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    )}

                    <hr className="workspace-divider" />

                    {/* PAPERS LIST */}
                    <div className="workspace-papers-list">
                        {currentPlaylistPapers.length > 0 ? (
                            currentPlaylistPapers.map(paper => (
                                <div key={paper.id} className="workspace-paper-row">
                                    <PaperCard
                                        paper={paper}
                                        onSavedChange={reloadData}
                                    />
                                    {/* Playlist Assignment Bar */}
                                    <div className="paper-playlist-toolbar">
                                        <div className="paper-tags">
                                            {paper.originTopic && (
                                                <span className="topic-tag">
                                                    🔍 {paper.originTopic}
                                                </span>
                                            )}
                                            {Array.isArray(paper.playlists) && paper.playlists.map(plId => {
                                                const pl = playlists.find(p => p.id === plId);
                                                return pl ? (
                                                    <span key={plId} className="playlist-tag">
                                                        📁 {pl.name}
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>

                                        <div className="paper-toolbar-actions">
                                            {isCustomPlaylist && (
                                                <button
                                                    type="button"
                                                    className="remove-from-playlist-btn"
                                                    onClick={() => handleRemovePaperFromCurrent(paper.id)}
                                                    title="Remove paper from this playlist"
                                                >
                                                    ✕ Remove from Playlist
                                                </button>
                                            )}
                                            <PlaylistMenu
                                                paper={paper}
                                                onPlaylistChange={reloadData}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="workspace-empty-state">
                                <h2>No papers in this playlist yet</h2>
                                <p>
                                    {papers.length === 0
                                        ? "Your research library is empty. Save papers from search results to curate your playlists."
                                        : isCustomPlaylist
                                        ? "Add papers directly from your saved library into this playlist."
                                        : "Save papers from search results matching this topic to see them here."}
                                </p>
                                {isCustomPlaylist && papers.length > 0 ? (
                                    <button
                                        type="button"
                                        className="workspace-search-cta"
                                        onClick={() => {
                                            setModalFilterQuery("");
                                            setShowAddPapersModal(true);
                                        }}
                                    >
                                        + Add Papers from Saved Library
                                    </button>
                                ) : (
                                    <Link to="/" className="workspace-search-cta">Start Searching Papers</Link>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* DIRECT "ADD PAPERS TO PLAYLIST" MODAL */}
            {showAddPapersModal && isCustomPlaylist && (
                <div className="modal-backdrop" onClick={() => setShowAddPapersModal(false)}>
                    <div className="modal-box modal-add-papers" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3>Add Papers to "{activePlaylistInfo.name}"</h3>
                                <p className="modal-subtitle">Pick papers from your saved library to include in this playlist.</p>
                            </div>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setShowAddPapersModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-search-box">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Search saved papers by title, author, or topic..."
                                value={modalFilterQuery}
                                onChange={e => setModalFilterQuery(e.target.value)}
                                autoFocus
                            />
                            {modalFilterQuery && (
                                <button
                                    type="button"
                                    className="clear-modal-filter"
                                    onClick={() => setModalFilterQuery("")}
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <div className="modal-papers-scroll">
                            {papers.length === 0 ? (
                                <div className="modal-empty-hint">
                                    <p>Your library is empty. Save papers from search results first!</p>
                                </div>
                            ) : modalFilteredPapers.length === 0 ? (
                                <div className="modal-empty-hint">
                                    <p>No matching saved papers found for "{modalFilterQuery}".</p>
                                </div>
                            ) : (
                                modalFilteredPapers.map(p => {
                                    const inThisPl = Array.isArray(p.playlists) && p.playlists.includes(selectedPlaylistId);
                                    return (
                                        <div key={p.id} className={`modal-paper-item ${inThisPl ? "is-in-playlist" : ""}`}>
                                            <div className="modal-paper-info">
                                                <h4>{p.title}</h4>
                                                <p className="modal-paper-meta">
                                                    {p.authors} • {p.year} • {p.journal}
                                                </p>
                                                {p.originTopic && (
                                                    <span className="modal-topic-pill">🔍 {p.originTopic}</span>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                className={`modal-toggle-btn ${inThisPl ? "btn-remove" : "btn-add"}`}
                                                onClick={() => handleTogglePaperInPlaylist(p.id)}
                                                title={inThisPl ? "Remove from this playlist" : "Add to this playlist"}
                                            >
                                                {inThisPl ? "✓ Added" : "+ Add"}
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="modal-footer">
                            <span className="modal-count-status">
                                <strong>{modalInPlaylistCount}</strong> paper{modalInPlaylistCount === 1 ? "" : "s"} in this playlist
                            </span>
                            <button
                                type="button"
                                className="create-submit-btn"
                                onClick={() => setShowAddPapersModal(false)}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE PLAYLIST MODAL */}
            {showCreateModal && (
                <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Create Research Playlist</h3>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setShowCreateModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleCreatePlaylistSubmit}>
                            <div className="form-group">
                                <label>Playlist Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Thesis Literature Review, Transformer SOTA..."
                                    value={newPlTitle}
                                    onChange={e => setNewPlTitle(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label>Description (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Core papers for methodology section"
                                    value={newPlDesc}
                                    onChange={e => setNewPlDesc(e.target.value)}
                                />
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="create-submit-btn">
                                    Create Playlist
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
