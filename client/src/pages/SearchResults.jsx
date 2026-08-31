import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PaperCard from "../components/PaperCard";
import { searchPapers } from "../services/api";
import "./SearchResults.css";

function SearchResults(){
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = (searchParams.get("q") || "").trim();
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(Boolean(query));
    const [error, setError] = useState("");
    const [newQuery, setNewQuery] = useState(query);
    const [stepIndex, setStepIndex] = useState(0);

    const LOADING_STEPS = [
        "Connecting to scholarly knowledge graph...",
        "Retrieving candidate research papers...",
        "Analyzing citation momentum & freshness...",
        "Computing Aether Relevance & impact scores...",
        "Finalizing smart academic ranking..."
    ];

    useEffect(() => {
        if (!loading) {
            setStepIndex(0);
            return;
        }
        const interval = setInterval(() => {
            setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
        }, 1600);
        return () => clearInterval(interval);
    }, [loading]);

    useEffect(() => {
        setNewQuery(query);
        if(!query){
            setPapers([]);
            setLoading(false);
            return;
        }

        let active = true;
        setLoading(true);
        setError("");
        searchPapers(query)
            .then(data => {
                if(active) setPapers(data.papers.map(paper => ({ ...paper, searchQuery: query })));
            })
            .catch(err => active && setError(err.message))
            .finally(() => active && setLoading(false));

        return () => { active = false; };
    }, [query]);

    function submitSearch(event){
        event.preventDefault();
        const nextQuery = newQuery.trim();
        if(nextQuery) navigate(`/search?q=${encodeURIComponent(nextQuery)}`);
    }

    return (
        <main className="results-container react-results-container">
            <header className="search-top-bar">
                <Link to="/">← Back to Search</Link>
                <Link className="search-logo" to="/">Aether</Link>
                <Link className="saved-link" to="/saved">Saved</Link>
            </header>

            <form className="results-search" onSubmit={submitSearch}>
                <input value={newQuery} onChange={event => setNewQuery(event.target.value)} placeholder="Search research papers..." aria-label="Search research papers" />
                <button type="submit">Search</button>
            </form>

            <section className="results-header">
                <h1>{query ? <>Showing results for “{query}”</> : "Search research papers"}</h1>
                <p>{loading ? "Evaluating scholarly sources with Aether AI..." : `${papers.length} Research Papers`}<br />{query && <>Ranked using <strong>Aether Relevance Metric</strong></>}</p>
            </section>
            <hr />

            {loading && (
                <div className="search-loading-container">
                    <div className="loading-radar-card">
                        <div className="aether-spinner-wrapper">
                            <div className="aether-spinner-ring"></div>
                            <div className="aether-spinner-orbit"></div>
                            <div className="aether-spinner-core">✦</div>
                        </div>
                        <h2 className="loading-title">Finding & Ranking Best Papers</h2>
                        <div className="loading-step-pill">
                            <span className="loading-pulse-dot"></span>
                            <span key={stepIndex} className="loading-step-text">
                                {LOADING_STEPS[stepIndex]}
                            </span>
                        </div>
                    </div>

                    <div className="skeleton-cards-container" aria-hidden="true">
                        {[1, 2, 3].map((cardId) => (
                            <div key={cardId} className="skeleton-card">
                                <div className="skeleton-top-row">
                                    <div className="skeleton-line skeleton-title"></div>
                                    <div className="skeleton-score-circle"></div>
                                </div>
                                <div className="skeleton-line skeleton-authors"></div>
                                <div className="skeleton-badge-row">
                                    <div className="skeleton-pill"></div>
                                    <div className="skeleton-pill short"></div>
                                </div>
                                <div className="skeleton-line skeleton-abstract"></div>
                                <div className="skeleton-line skeleton-abstract short"></div>
                                <div className="skeleton-actions-row">
                                    <div className="skeleton-btn main"></div>
                                    <div className="skeleton-btn save"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {error && <div className="empty-state error-state"><h2>Search unavailable</h2><p>{error}</p></div>}
            {!loading && !error && !query && <div className="empty-state"><h2>Start with a topic</h2><p>Search by subject, paper title, or author.</p></div>}
            {!loading && !error && query && papers.length === 0 && <div className="empty-state"><h2>No research papers found.</h2><p>Try searching with broader keywords.</p></div>}
            {!loading && !error && papers.map(paper => <PaperCard key={paper.id} paper={paper} onSavedChange={() => setSaveVersion(version => version + 1)} />)}
        </main>
    );
}

export default SearchResults;
