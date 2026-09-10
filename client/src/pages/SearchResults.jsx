import { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PaperCard from "../components/PaperCard";
import RankingToolbar from "../components/RankingToolbar";
import { searchPapers, uploadPaper } from "../services/api";
import { RANKING_MODES, rankPapersByWeights } from "../utils/scoring";
import AetherBrand from "../components/AetherBrand";
import SavedPapersLink from "../components/SavedPapersLink";
import UserMenu from "../components/UserMenu";
import "./SearchResults.css";

// In-memory cache so navigating back from a paper never reloads or reranks
const searchCache = new Map();

function SearchResults() {
    const { isAuthenticated } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = (searchParams.get("q") || "").trim();

    // Initialize papers from cache if returning from paper page
    const cachedInitial = searchCache.get(query);
    const [papers, setPapers] = useState(cachedInitial || []);
    const [loading, setLoading] = useState(!cachedInitial && Boolean(query));
    const [error, setError] = useState("");
    const [newQuery, setNewQuery] = useState(query);
    const [stepIndex, setStepIndex] = useState(0);
    const [, setSaveVersion] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const fileInputRef = useRef(null);

    async function handleFileUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            setUploadError("Please upload a valid PDF document.");
            return;
        }

        setUploadError("");
        setUploading(true);

        try {
            const res = await uploadPaper(file);
            if (res.paperId) {
                navigate(`/paper/${res.paperId}`);
            }
        } catch (err) {
            setUploadError(err.message || "Failed to process PDF.");
            setUploading(false);
        }
    }

    // Multi-factor ranking mode & custom weights state
    const [activeMode, setActiveMode] = useState("balanced");
    const [weights, setWeights] = useState(RANKING_MODES.balanced.weights);

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
        if (!query) {
            setPapers([]);
            setLoading(false);
            return;
        }

        // Persist query so breadcrumbs on paper pages can navigate back to exact search
        sessionStorage.setItem("aether_last_search_query", query);

        // Fast Cache Hit: Don't reload or rerank if user came back from a paper!
        const cached = searchCache.get(query);
        if (cached && Array.isArray(cached) && cached.length > 0) {
            setPapers(cached);
            setLoading(false);
            setError("");
            return;
        }

        try {
            const sessionData = sessionStorage.getItem(`aether_search_${query}`);
            if (sessionData) {
                const parsed = JSON.parse(sessionData);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    searchCache.set(query, parsed);
                    setPapers(parsed);
                    setLoading(false);
                    setError("");
                    return;
                }
            }
        } catch (e) {
            // Ignore session storage errors
        }

        let isMounted = true;
        setLoading(true);
        setError("");

        searchPapers(query)
            .then((data) => {
                if (!isMounted) return;
                const results = Array.isArray(data) ? data : (data.papers || []);
                searchCache.set(query, results);
                try {
                    sessionStorage.setItem(`aether_search_${query}`, JSON.stringify(results));
                } catch (e) {}
                setPapers(results);
                setLoading(false);
            })
            .catch((err) => {
                if (!isMounted) return;
                setError(err.message || "Failed to fetch research papers.");
                setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [query]);

    // DYNAMIC MULTI-FACTOR RE-RANKING (0ms client calculation)
    const displayedPapers = useMemo(() => {
        return rankPapersByWeights(papers, weights);
    }, [papers, weights]);

    function submitSearch(e) {
        e.preventDefault();
        const nextQuery = newQuery.trim();
        if (nextQuery) navigate(`/search?q=${encodeURIComponent(nextQuery)}`);
    }

    return (
        <main className="results-container react-results-container">
            <header className="search-top-bar">
                <div className="search-top-bar-left">
                    <Link to="/" className="back-search-btn">← Back to Search</Link>
                    <AetherBrand size="md" variant="horizontal" />
                </div>
                <div className="search-top-bar-actions">
                    {isAuthenticated && <SavedPapersLink />}
                    {isAuthenticated && <div className="search-top-bar-divider" aria-hidden="true"></div>}
                    <UserMenu />
                </div>
            </header>

            <form className="results-search" onSubmit={submitSearch}>
                <div className="results-search-input-wrapper">
                    <span className="results-search-icon" aria-hidden="true">🔍</span>
                    <input
                        type="text"
                        value={newQuery}
                        onChange={(e) => setNewQuery(e.target.value)}
                        placeholder="Search topics, exact titles in quotes, DOIs (10.1145/...), or arXiv links..."
                        required
                    />
                </div>
                <button type="submit" className="results-search-submit">Search</button>
                <button
                    type="button"
                    className="results-upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    title="Upload your own research paper PDF"
                >
                    {uploading ? "Analyzing..." : "✦ Upload PDF"}
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,application/pdf"
                    style={{ display: "none" }}
                />
            </form>

            {uploadError && (
                <div className="results-upload-error">
                    ⚠️ {uploadError}
                </div>
            )}

            <section className="results-header">
                <h1>Results for "{query}"</h1>
                <p className="results-subheading">
                    Ranked using Aether Relevance Metric
                </p>
                <p className="results-count-text">
                    {loading
                        ? "Discovering and evaluating research papers..."
                        : `${displayedPapers.length} peer-reviewed research papers discovered`}
                </p>
            </section>
            <hr />

            {/* MULTI-FACTOR RANKING TOOLBAR */}
            {!loading && !error && displayedPapers.length > 0 && (
                <RankingToolbar
                    activeMode={activeMode}
                    weights={weights}
                    onModeChange={setActiveMode}
                    onWeightsChange={setWeights}
                />
            )}

            {loading && (
                <div className="search-loading-container" aria-live="polite">
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
            {!loading && !error && query && displayedPapers.length === 0 && <div className="empty-state"><h2>No research papers found.</h2><p>Try searching with broader keywords.</p></div>}
            {!loading && !error && displayedPapers.map(paper => (
                <PaperCard
                    key={paper.id}
                    paper={paper}
                    searchQuery={query}
                    onSavedChange={() => setSaveVersion(v => v + 1)}
                />
            ))}
        </main>
    );
}

export default SearchResults;
