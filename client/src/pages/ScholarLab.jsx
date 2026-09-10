import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useLab } from "../context/LabContext";
import { getSavedPapers } from "../services/savedPapers";
import AetherBrand from "../components/AetherBrand";
import UserMenu from "../components/UserMenu";
import "./ScholarLab.css";

// Tool definitions
const TOOLS = [
    {
        id: "synthesis",
        icon: "✦",
        label: "Literature Synthesis",
        path: "/lab/synthesis",
        limit: 5,
        desc: "AI-generated cross-paper meta-analysis"
    },
    {
        id: "compare",
        icon: "⊞",
        label: "Paper Comparison",
        path: "/lab/compare",
        limit: 4,
        desc: "Side-by-side structured comparison"
    },
    {
        id: "matrix",
        icon: "≡",
        label: "Evidence Matrix",
        path: "/lab/matrix",
        limit: 6,
        desc: "Claims × papers evidence grid"
    },
    {
        id: "gaps",
        icon: "◎",
        label: "Gap Detector",
        path: "/lab/gaps",
        limit: 5,
        desc: "Identify unexplored research areas"
    }
];


// ── Add Papers Modal ───────────────────────────────────────────
function AddPapersModal({ onClose }) {
    const { bench, addToBench, removeFromBench, isOnBench, BENCH_CAP } = useLab();
    const [filterQuery, setFilterQuery] = useState("");
    const inputRef = useRef(null);
    const allSaved = getSavedPapers();

    useEffect(() => {
        inputRef.current?.focus();
        function onKey(e) { if (e.key === "Escape") onClose(); }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const filtered = useMemo(() => {
        const q = filterQuery.toLowerCase().trim();
        if (!q) return allSaved;
        return allSaved.filter(p =>
            p.title?.toLowerCase().includes(q) ||
            p.authors?.toLowerCase().includes(q) ||
            String(p.year || "").includes(q)
        );
    }, [filterQuery, allSaved]);

    function togglePaper(paper) {
        if (isOnBench(paper.id)) {
            removeFromBench(paper.id);
        } else if (bench.length < BENCH_CAP) {
            addToBench(paper);
        }
    }

    return (
        <div className="lab-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="lab-modal" role="dialog" aria-modal="true" aria-label="Add papers to bench">
                <div className="lab-modal-header">
                    <div>
                        <div className="lab-modal-title">Add Papers to Bench</div>
                        <div className="lab-modal-subtitle">
                            {bench.length}/{BENCH_CAP} papers loaded · Click to toggle
                        </div>
                    </div>
                    <button className="lab-modal-close" onClick={onClose} aria-label="Close">✕</button>
                </div>

                <div className="lab-modal-search">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Filter by title, author, or year..."
                        value={filterQuery}
                        onChange={e => setFilterQuery(e.target.value)}
                    />
                </div>

                <div className="lab-modal-list">
                    {filtered.length === 0 ? (
                        <div className="lab-modal-empty">
                            <div className="lab-modal-empty-icon">📭</div>
                            {allSaved.length === 0
                                ? "Your library is empty. Save some papers first."
                                : "No papers match your search."}
                        </div>
                    ) : filtered.map(paper => {
                        const onBench = isOnBench(paper.id);
                        const atCap = bench.length >= BENCH_CAP && !onBench;
                        return (
                            <div
                                key={paper.id}
                                className={`lab-modal-paper-row${onBench ? " on-bench" : ""}${atCap ? " disabled" : ""}`}
                                onClick={() => !atCap && togglePaper(paper)}
                                role="checkbox"
                                aria-checked={onBench}
                                tabIndex={0}
                                onKeyDown={e => e.key === "Enter" && !atCap && togglePaper(paper)}
                            >
                                <div className="lab-modal-paper-check">
                                    {onBench ? "✓" : ""}
                                </div>
                                <div className="lab-modal-paper-info">
                                    <div className="lab-modal-paper-title">{paper.title}</div>
                                    <div className="lab-modal-paper-meta">
                                        {[paper.authors, paper.year].filter(Boolean).join(" · ")}
                                        {atCap && <span style={{ color: "#F59E0B", marginLeft: 8 }}>Bench full</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ── Bench Panel ────────────────────────────────────────────────
function BenchPanel({ onAddPapers }) {
    const { bench, removeFromBench, clearBench } = useLab();
    const [dragIndex, setDragIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [localBench, setLocalBench] = useState(bench);

    // Keep local bench in sync when context bench changes from outside
    useEffect(() => { setLocalBench(bench); }, [bench]);

    function handleDragStart(e, index) {
        setDragIndex(index);
        e.dataTransfer.effectAllowed = "move";
    }

    function handleDragOver(e, index) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverIndex(index);
    }

    function handleDrop(e, index) {
        e.preventDefault();
        if (dragIndex === null || dragIndex === index) return;
        const reordered = [...localBench];
        const [moved] = reordered.splice(dragIndex, 1);
        reordered.splice(index, 0, moved);
        setLocalBench(reordered);
        setDragIndex(null);
        setDragOverIndex(null);
    }

    function handleDragEnd() {
        setDragIndex(null);
        setDragOverIndex(null);
    }

    return (
        <div className="lab-bench-panel">
            <div className="lab-bench-header">
                <div className="lab-bench-title">
                    <span className="lab-bench-title-icon">⚗️</span>
                    BENCH
                    <span className="lab-bench-count">({localBench.length})</span>
                </div>
                {localBench.length > 0 && (
                    <button className="lab-bench-clear-btn" onClick={clearBench} title="Clear bench">
                        <svg viewBox="0 0 16 16" fill="currentColor">
                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66H14.5a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Z"/>
                        </svg>
                        Reset
                    </button>
                )}
            </div>

            {localBench.length === 0 ? (
                <div className="lab-bench-empty">
                    <div className="lab-bench-empty-icon">🧪</div>
                    <div className="lab-bench-empty-text">
                        No papers on bench.<br />Add papers from your library to get started.
                    </div>
                </div>
            ) : (
                <div className="lab-bench-papers">
                    {localBench.map((paper, index) => (
                        <div
                            key={paper.id}
                            className={`lab-bench-tile${dragIndex === index ? " dragging" : ""}${dragOverIndex === index ? " drag-over" : ""}`}
                            draggable
                            onDragStart={e => handleDragStart(e, index)}
                            onDragOver={e => handleDragOver(e, index)}
                            onDrop={e => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="lab-bench-tile-drag" aria-hidden="true">⠿</div>
                            <div className="lab-bench-tile-body">
                                <div className="lab-bench-tile-title">{paper.title}</div>
                                <div className="lab-bench-tile-meta">
                                    {paper.year ? `${paper.year} · ` : ""}{paper.journal || paper.authors || ""}
                                </div>
                            </div>
                            <button
                                className="lab-bench-tile-remove"
                                onClick={() => removeFromBench(paper.id)}
                                aria-label={`Remove ${paper.title} from bench`}
                                title="Remove from bench"
                            >✕</button>
                        </div>
                    ))}
                </div>
            )}

            <button className="lab-bench-add-btn" onClick={onAddPapers}>
                + Add Papers
            </button>
        </div>
    );
}

// ── Scholar Lab Root Layout ────────────────────────────────────
export default function ScholarLab() {
    const { bench } = useLab();
    const [showAddModal, setShowAddModal] = useState(false);

    return (
        <div className="lab-root">
            {/* Header */}
            <header className="lab-header">
                <div className="lab-header-left">
                    <AetherBrand size="md" variant="horizontal" />
                    <div className="lab-header-divider" aria-hidden="true"></div>
                    <h1 className="lab-header-title">Scholar Lab</h1>
                </div>
                <div className="lab-header-right">
                    <span className="lab-header-tagline">A Cross-Paper Intelligence Studio</span>
                    <div className="lab-header-tagline-divider" aria-hidden="true"></div>
                    <Link to="/saved" className="lab-header-library-btn" aria-label="Open Scholar Library">
                        <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                            <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v10.748c-.917-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"/>
                        </svg>
                        Scholar Library
                    </Link>
                    <UserMenu />
                </div>
            </header>

            {/* Body */}
            <div className="lab-body">
                {/* Sidebar */}
                <aside className="lab-sidebar" aria-label="Lab tools and bench">
                    <nav className="lab-tool-nav" aria-label="Lab tools">
                        <span className="lab-nav-label">Select Analysis Tool</span>
                        {TOOLS.map(tool => (
                            <NavLink
                                key={tool.id}
                                to={tool.path}
                                className={({ isActive }) => `lab-nav-item${isActive ? " active" : ""}`}
                                title={tool.desc}
                            >
                                <span className="lab-nav-icon">{tool.icon}</span>
                                <div className="lab-nav-info">
                                    <span className="lab-nav-title">{tool.label}</span>
                                    <span className="lab-nav-desc">{tool.desc}</span>
                                </div>
                            </NavLink>
                        ))}
                    </nav>

                    <div className="lab-nav-divider" aria-hidden="true" />

                    <BenchPanel onAddPapers={() => setShowAddModal(true)} />
                </aside>

                {/* Main tool content area */}
                <main className="lab-main" aria-label="Tool workspace">
                    <Outlet context={{ bench, setShowAddModal }} />
                </main>
            </div>

            {/* Add Papers Modal */}
            {showAddModal && (
                <AddPapersModal onClose={() => setShowAddModal(false)} />
            )}
        </div>
    );
}
