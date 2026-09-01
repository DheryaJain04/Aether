import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { askPaper, getKeywords, getPaper, getSummary } from "../services/api";
import { isPaperSaved, toggleSavedPaper } from "../services/savedPapers";
import AetherBrand from "../components/AetherBrand";
import UserMenu from "../components/UserMenu";
import "./PaperDetail.css";

const welcomeMessage = "Ask me anything about this research paper. I can help explain concepts, methodology, findings, and more.";
const suggestedQuestions = [
    "What is the main contribution of this paper?",
    "What methodology does this paper use?",
    "What are the key findings of this paper?"
];

function PaperDetail() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const [paper, setPaper] = useState(null);
    const [summary, setSummary] = useState("Generating Aether Summary...");
    const [keywords, setKeywords] = useState(["Generating keywords..."]);
    const [error, setError] = useState("");
    const [messages, setMessages] = useState([{ role: "assistant", text: welcomeMessage }]);
    const [question, setQuestion] = useState("");
    const [asking, setAsking] = useState(false);
    const [saved, setSaved] = useState(false);
    const [copiedCitation, setCopiedCitation] = useState("");
    const messagesRef = useRef(null);

    useEffect(() => {
        let active = true;
        setPaper(null);
        setSummary("Generating Aether Summary...");
        setKeywords(["Generating keywords..."]);
        setError("");
        setMessages([{ role: "assistant", text: welcomeMessage }]);

        getPaper(id)
            .then(data => {
                if (!active) return;
                setPaper(data.paper);
                setSaved(isPaperSaved(data.paper.id));
                return Promise.allSettled([getSummary(id), getKeywords(id)]);
            })
            .then(results => {
                if (!active || !results) return;
                const [summaryResult, keywordsResult] = results;
                setSummary(summaryResult.status === "fulfilled" ? summaryResult.value.summary : "Unable to generate summary.");
                setKeywords(keywordsResult.status === "fulfilled" && keywordsResult.value.keywords?.length
                    ? keywordsResult.value.keywords
                    : ["Unavailable"]);
            })
            .catch(requestError => active && setError(requestError.message));

        return () => { active = false; };
    }, [id]);

    useEffect(() => {
        if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    }, [messages, asking]);

    async function sendQuestion(nextQuestion) {
        const trimmedQuestion = nextQuestion.trim();
        if (!trimmedQuestion || asking) return;

        setQuestion("");
        setMessages(current => [...current, { role: "user", text: trimmedQuestion }]);
        setAsking(true);
        try {
            const data = await askPaper(id, trimmedQuestion);
            setMessages(current => [...current, { role: "assistant", text: data.answer }]);
        } catch (requestError) {
            setMessages(current => [...current, { role: "assistant", text: requestError.message || "Aether was unable to process this paper. Please try again." }]);
        } finally {
            setAsking(false);
        }
    }

    async function copyCitation(type) {
        if (!paper?.citations?.[type]) return;
        try {
            await navigator.clipboard.writeText(paper.citations[type]);
            setCopiedCitation(type);
            window.setTimeout(() => setCopiedCitation(""), 1500);
        } catch {
            setCopiedCitation("");
        }
    }

    function toggleSave() {
        if (!paper) return;
        setSaved(toggleSavedPaper(paper));
    }

    if (error) {
        return <main className="paper-status"><Link to="/search">← Back to search</Link><h1>Unable to load paper</h1><p>{error}</p></main>;
    }

    if (!paper) {
        return <main className="paper-status"><p>Loading paper…</p></main>;
    }

    const searchQueryParam = searchParams.get("q");
    if (searchQueryParam) {
        sessionStorage.setItem("aether_last_search_query", searchQueryParam);
    }
    const effectiveQuery = searchQueryParam || sessionStorage.getItem("aether_last_search_query") || "";
    const citations = paper.citations || {};

    return (
        <>
            <div className="background-effects" aria-hidden="true">
                <div className="wave wave-one"></div><div className="wave wave-two"></div><div className="wave wave-three"></div>
            </div>

            <header className="top-bar">
                <div className="top-bar-left">
                    <AetherBrand size="md" variant="horizontal" />
                    <nav className="breadcrumb" aria-label="Breadcrumb">
                        <Link to="/">Home</Link><span>/</span>
                        <Link to={effectiveQuery ? `/search?q=${encodeURIComponent(effectiveQuery)}` : "/search"}>Search Results</Link><span>/</span><span className="current">Paper</span>
                    </nav>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "22px" }}>
                    <Link to="/saved" style={{ color: "#4B5563", fontWeight: 600, fontSize: "14.5px", textDecoration: "none" }}>Saved</Link>
                    <UserMenu />
                </div>
            </header>

            <main>
                <section className="paper-hero">
                    <div className="hero-glow"></div>
                    <div className="hero-content">
                        <div className="paper-badges">
                            {paper.openAccess && <span className="open-access"><span className="status-dot"></span>OPEN ACCESS</span>}
                            {paper.year && <span className="year-badge">{paper.year}</span>}
                            <button type="button" className={`paper-save-button ${saved ? "saved" : ""}`} onClick={toggleSave}>{saved ? "★ Saved" : "☆ Save paper"}</button>
                        </div>
                        <h1 className="paper-title">{paper.title}</h1>
                        <p className="paper-authors">{paper.authors}</p>
                        <div className="paper-meta">
                            <div className="meta-item"><span className="meta-label">PUBLISHED IN</span><strong>{paper.journal}</strong></div>
                            <div className="meta-divider"></div>
                            <div className="meta-item"><span className="meta-label">YEAR</span><strong>{paper.year}</strong></div>
                        </div>
                        {paper.doi && <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noreferrer" className="doi-badge"><strong>DOI</strong><span>{paper.doi}</span><span className="external-arrow">↗</span></a>}
                    </div>
                </section>

                <section className="ai-workspace">
                    <div className="workspace-glow"></div>
                    <div className="ai-grid">
                        <section className="summary-section">
                            <div className="section-heading-row"><div><span className="ai-label">✦ AI GENERATED</span><h2>Aether Summary</h2></div><span className="aether-ai-badge">Aether AI</span></div>
                            <div className="summary-card"><div className="summary-shine"></div><p>{summary}</p></div>
                        </section>

                        <aside className="chat-panel">
                            <div className="chat-glow"></div>
                            <div className="chat-header"><div className="chat-brand"><div className="ai-icon">✦</div><div><h3>Ask Aether</h3><p>Chat with this paper</p></div></div><span className="ai-status"><span></span>AI</span></div>
                            <div className="grounded-notice"><span>◌</span>Answers are grounded in the full text of this research paper.</div>
                            <div className="chat-messages" ref={messagesRef}>
                                {messages.map((message, index) => message.role === "user" ? (
                                    <div className="message-row user-row" key={`${message.text}-${index}`}><div className="message-content"><span className="message-name user-name">YOU</span><div className="user-message">{message.text}</div></div></div>
                                ) : (
                                    <div className="message-row aether-row" key={`${message.text}-${index}`}><div className="message-avatar">✦</div><div className="message-content"><span className="message-name">AETHER</span><div className="aether-message">{message.text}</div></div></div>
                                ))}
                                {asking && <div className="message-row aether-row"><div className="message-avatar">✦</div><div className="message-content"><span className="message-name">AETHER</span><div className="aether-message loading-answer">Aether is reading the paper…</div></div></div>}
                            </div>
                            <div className="suggested-questions">{suggestedQuestions.map(item => <button type="button" key={item} disabled={asking} onClick={() => sendQuestion(item)}>{item.replace("What is the ", "").replace("What ", "")}</button>)}</div>
                            <form className="chat-form" onSubmit={event => { event.preventDefault(); sendQuestion(question); }}><input value={question} onChange={event => setQuestion(event.target.value)} placeholder="Ask about this paper..." autoComplete="off" disabled={asking} required /><button type="submit" className="send-btn" aria-label="Send question" disabled={asking}>↑</button></form>
                            <p className="chat-footer">Aether answers using retrieved context from the paper.</p>
                        </aside>
                    </div>
                </section>

                <section className="paper-content">
                    <section className="content-section abstract-section"><div className="content-heading"><span className="section-number">01</span><h2>Abstract</h2></div><p className="abstract-text">{paper.abstract}</p></section>
                    <section className="content-section keywords-section"><div className="content-heading"><span className="section-number">02</span><h2>Keywords</h2></div><div className="keyword-list">{keywords.map(keyword => <span className="keyword" key={keyword}>{keyword}</span>)}</div></section>
                    <section className="content-section citations-section"><div className="content-heading"><span className="section-number">03</span><h2>Citations</h2></div><p className="section-description">Ready-to-use citations for this research paper.</p><div className="citations-grid">{["apa", "ieee"].map(type => <div className="citation-card" key={type}><div className="citation-top"><span className="citation-type">{type.toUpperCase()}</span><button type="button" className="copy-btn" onClick={() => copyCitation(type)}>{copiedCitation === type ? "Copied" : "Copy"}</button></div><p>{citations[type] || "Citation unavailable."}</p></div>)}</div></section>
                </section>
            </main>
        </>
    );
}

export default PaperDetail;
