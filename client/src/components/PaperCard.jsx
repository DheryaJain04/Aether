import { Link } from "react-router-dom";
import { isPaperSaved, toggleSavedPaper } from "../services/savedPapers";
import "./PaperCard.css";

function PaperCard({ paper, onSavedChange }){
    const saved = isPaperSaved(paper.id);
    const score = paper.scores?.balanced ?? paper.aetherScore ?? paper.relevance ?? "—";

    function handleSave(){
        const nowSaved = toggleSavedPaper(paper);
        onSavedChange?.(nowSaved);
    }

    return (
        <div className="paper-wrapper">
            <div className="score-badge">
                <span>Aether Score</span>
                <strong>{typeof score === "number" ? `${Math.round(score)}%` : score}</strong>
            </div>

            <article className="search-paper-card">
                <h2 className="paper-title">
                    {paper.paperUrl && paper.paperUrl !== "#" ? (
                        <a href={paper.paperUrl} target="_blank" rel="noreferrer">{paper.title}</a>
                    ) : paper.title}
                </h2>

                {paper.authors && <p className="authors">{paper.authors}</p>}

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
                    <Link to={`/paper/${paper.id}?q=${encodeURIComponent(paper.searchQuery || "")}`} className="read-btn">
                        View Paper <span aria-hidden="true">↗</span>
                    </Link>
                    <button className="save-btn" type="button" onClick={handleSave}>
                        {saved ? "★ Saved" : "☆ Save"}
                    </button>
                </div>
            </article>
        </div>
    );
}

export default PaperCard;
