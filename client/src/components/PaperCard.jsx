import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isPaperSaved, toggleSavedPaper } from "../services/savedPapers";
import "./PaperCard.css";

function PaperCard({ paper, searchQuery, onSavedChange }){
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [saved, setSaved] = useState(() => isPaperSaved(paper.id));
    const [showBreakdown, setShowBreakdown] = useState(false);

    // Dynamic Aether score from active mode / weights
    const score = paper.dynamicScore ?? paper.scores?.balanced ?? paper.aetherScore ?? "—";
    const breakdown = paper.scoreBreakdown || {
        relevance: 50,
        freshness: 50,
        impact: 50,
        venue: 50
    };

    useEffect(() => {
        setSaved(isPaperSaved(paper.id));
    }, [paper.id]);

    function handleSave(){
        if (!isAuthenticated) {
            navigate("/login", { state: { from: location } });
            return;
        }
        const nowSaved = toggleSavedPaper(paper);
        setSaved(nowSaved);
        onSavedChange?.(nowSaved);
    }

    return (
        <div className="paper-wrapper">
            <article className="search-paper-card">
                {/* Clean Top Row: Title + Inside-Card Score Badge */}
                <div className="card-top-row">
                    <div className="card-header-left">
                        <h2 className="paper-title">
                            {paper.paperUrl && paper.paperUrl !== "#" ? (
                                <a href={paper.paperUrl} target="_blank" rel="noreferrer">{paper.title}</a>
                            ) : paper.title}
                        </h2>

                        {paper.authors && <p className="authors">{paper.authors}</p>}
                    </div>

                    {/* SCORE BADGE - NEATLY POSITIONED INSIDE THE CARD BOUNDARY */}
                    <div className="card-score-container">
                        <div className="card-score-box">
                            <span className="score-box-label">Aether Score</span>
                            <strong className="score-box-val">
                                {typeof score === "number" ? `${Math.round(score)}%` : score}
                            </strong>
                        </div>
                        <button
                            type="button"
                            className={`breakdown-toggle-btn ${showBreakdown ? "is-active" : ""}`}
                            onClick={() => setShowBreakdown((prev) => !prev)}
                            aria-expanded={showBreakdown}
                            title="View multi-factor score breakdown"
                        >
                            {showBreakdown ? "Hide Factors ▴" : "Factors ▾"}
                        </button>
                    </div>
                </div>

                {/* EXPANDABLE MULTI-FACTOR BREAKDOWN INSIDE CARD */}
                {showBreakdown && (
                    <div className="card-factors-drawer">
                        <div className="factors-grid">
                            <div className="factor-pill">
                                <span className="factor-name">🎯 Relevance</span>
                                <div className="factor-track">
                                    <div className="factor-fill fill-relevance" style={{ width: `${breakdown.relevance}%` }}></div>
                                </div>
                                <span className="factor-pct">{breakdown.relevance}%</span>
                            </div>

                            <div className="factor-pill">
                                <span className="factor-name">⚡ Freshness</span>
                                <div className="factor-track">
                                    <div className="factor-fill fill-freshness" style={{ width: `${breakdown.freshness}%` }}></div>
                                </div>
                                <span className="factor-pct">{breakdown.freshness}%</span>
                            </div>

                            <div className="factor-pill">
                                <span className="factor-name">🏆 Impact</span>
                                <div className="factor-track">
                                    <div className="factor-fill fill-impact" style={{ width: `${breakdown.impact}%` }}></div>
                                </div>
                                <span className="factor-pct">{breakdown.impact}%</span>
                            </div>

                            <div className="factor-pill">
                                <span className="factor-name">🏛️ Venue</span>
                                <div className="factor-track">
                                    <div className="factor-fill fill-venue" style={{ width: `${breakdown.venue}%` }}></div>
                                </div>
                                <span className="factor-pct">{breakdown.venue}%</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="meta">
                    <span className="journal">{paper.journal} <span aria-hidden="true">•</span> {paper.year}</span>
                    {paper.openAccess && <span className="oa-badge">● Open Access</span>}
                </div>

                {paper.doi && (
                    <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noreferrer" className="doi">
                        DOI <span aria-hidden="true">•</span> {paper.doi}
                    </a>
                )}

                {paper.abstract && (
                    <div className="section abstract-section">
                        <h4>Abstract</h4>
                        <p className="abstract">{paper.abstract}</p>
                    </div>
                )}

                <div className="paper-stats">
                    <span>{paper.publicationType || "Research Paper"}</span>
                    <span className="stat-separator">•</span>
                    <span>Cited by {Number(paper.citedBy || 0).toLocaleString()}</span>
                </div>

                <div className="actions">
                    <Link
                        to={`/paper/${paper.id}${
                            (searchQuery || paper.searchQuery || sessionStorage.getItem("aether_last_search_query"))
                                ? `?q=${encodeURIComponent(searchQuery || paper.searchQuery || sessionStorage.getItem("aether_last_search_query"))}`
                                : ""
                        }`}
                        className="read-btn"
                    >
                        View Paper <span aria-hidden="true">↗</span>
                    </Link>
                    <button
                        className={`save-btn ${saved ? "saved" : ""}`}
                        type="button"
                        onClick={handleSave}
                        aria-pressed={saved}
                    >
                        {saved ? "★ Saved" : "☆ Save"}
                    </button>
                </div>
            </article>
        </div>
    );
}

export default PaperCard;
