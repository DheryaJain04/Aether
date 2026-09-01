import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AetherBrand from "../components/AetherBrand";
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
    const [query, setQuery] = useState("");
    const navigate = useNavigate();
    const [placeholder, setPlaceholder] = useState('Search "Large Language Models"...');

    useEffect(() => {
        let currentTopic = 0;
        const interval = window.setInterval(() => {
            currentTopic = (currentTopic + 1) % POPULAR_TOPICS.length;
            setPlaceholder(`Search "${POPULAR_TOPICS[currentTopic]}"...`);
        }, 2500);

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
                <div style={{ display: "flex", alignItems: "center", gap: "22px" }}>
                    <Link to="/saved" className="nav-saved-link">Saved Papers</Link>
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
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={placeholder}
                        required
                    />
                    <button type="submit">
                        Search Papers
                    </button>
                </form>

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
