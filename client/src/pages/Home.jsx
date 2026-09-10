import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { uploadPaper } from "../services/api";
import AetherBrand from "../components/AetherBrand";
import SavedPapersLink from "../components/SavedPapersLink";
import UserMenu from "../components/UserMenu";
import "./Home.css";
import "./HomeEnhancements.css";

const POPULAR_TOPICS = [
    "Large Language Models",
    "Quantum Computing",
    "Cancer Detection",
    "Climate Change",
    "Cybersecurity",
    "Machine Learning"
];

function Home() {
    const { isAuthenticated } = useAuth();
    const [query, setQuery] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const [placeholder, setPlaceholder] = useState('Search topic, title, DOI, or arXiv...');

    useEffect(() => {
        let currentTopic = 0;
        const interval = window.setInterval(() => {
            currentTopic = (currentTopic + 1) % POPULAR_TOPICS.length;
            setPlaceholder(`Search "${POPULAR_TOPICS[currentTopic]}", DOI, or title...`);
        }, 2800);

        return () => window.clearInterval(interval);
    }, []);

    function handleSubmit(e) {
        e.preventDefault();
        if (!query.trim()) return;
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }

    function searchTopic(topic) {
        navigate(`/search?q=${encodeURIComponent(topic)}`);
    }

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

    return (
        <main className="hero home-hero">
            {/* Ambient Celestial Backdrop */}
            <div className="home-backdrop-glow" aria-hidden="true">
                <img
                    src="/brand/backdrop.jpg"
                    alt=""
                    className="home-backdrop-img"
                />
                <div className="home-backdrop-overlay"></div>
            </div>

            <nav className="home-nav" aria-label="Main navigation">
                <AetherBrand size="sm" />
                <div className="home-nav-actions">
                    {isAuthenticated && <SavedPapersLink />}
                    {isAuthenticated && <div className="home-nav-divider" aria-hidden="true"></div>}
                    <UserMenu />
                </div>
            </nav>

            <div className="home-hero-center">
                <AetherBrand size="xl" to="" />
                <h2 className="home-hero-subtitle">Your personal AI Research Assistant</h2>
                <p className="home-hero-desc">
                    Discover, analyze, and synthesize peer-reviewed academic research powered by hybrid neural embeddings and deterministic relevance scoring.
                </p>

                <form className="search-box home-search-box-scaled" onSubmit={handleSubmit}>
                    <div className="search-input-wrapper">
                        <span className="search-input-icon" aria-hidden="true">🔍</span>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={placeholder}
                            required
                        />
                    </div>
                    <div className="search-actions-group">
                        <button type="submit" className="home-search-btn">
                            Search Papers
                        </button>
                        <button
                            type="button"
                            className="home-upload-btn"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            title="Upload and analyze your own research paper PDF"
                        >
                            {uploading ? (
                                <>
                                    <span className="upload-spinner">◌</span> Analyzing...
                                </>
                            ) : (
                                <>
                                    <span>✦</span> Upload PDF
                                </>
                            )}
                        </button>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".pdf,application/pdf"
                        style={{ display: "none" }}
                    />
                </form>

                {uploadError && (
                    <div className="home-upload-error">
                        ⚠️ {uploadError}
                    </div>
                )}

                <div className="home-search-helper-text">
                    <span className="helper-pill">Topics</span>
                    <span className="helper-pill">"Exact Titles"</span>
                    <span className="helper-pill">DOI: <code>10.1145/...</code></span>
                    <span className="helper-pill">arXiv: <code>1706.03762</code></span>
                </div>

                <div className="home-quick-topics">
                    <span className="quick-topics-label">POPULAR RESEARCH:</span>
                    <div className="quick-topics-chips">
                        {POPULAR_TOPICS.map((topic) => (
                            <button
                                key={topic}
                                type="button"
                                className="quick-topic-chip"
                                onClick={() => searchTopic(topic)}
                            >
                                {topic}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Home;
