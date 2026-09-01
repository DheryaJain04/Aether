import { useState } from "react";
import { Link } from "react-router-dom";
import PaperCard from "../components/PaperCard";
import { getSavedPapers } from "../services/savedPapers";
import AetherBrand from "../components/AetherBrand";
import UserMenu from "../components/UserMenu";
import "./SavedPapers.css";

function SavedPapers(){
    const [papers, setPapers] = useState(getSavedPapers);

    return (
        <main className="saved-page">
            <header className="saved-header">
                <Link to="/" className="back-search-btn">← Back to Search</Link>
                <AetherBrand size="md" />
                <div style={{ display: "flex", alignItems: "center", justifySelf: "end" }}>
                    <UserMenu />
                </div>
            </header>
            <section className="saved-intro">
                <p className="eyebrow">YOUR LIBRARY</p>
                <h1>Saved Papers</h1>
                <p>Keep a short list of research you want to return to. Saved papers stay in this browser.</p>
            </section>
            <hr />
            {papers.length ? papers.map(paper => <PaperCard key={paper.id} paper={paper} onSavedChange={() => setPapers(getSavedPapers())} />) : (
                <div className="saved-empty"><h2>Your library is empty</h2><p>Save any useful result to find it here later.</p><Link to="/">Start searching</Link></div>
            )}
        </main>
    );
}

export default SavedPapers;
