import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import "./HomeEnhancements.css";

function Home(){

    const [query,setQuery]=useState("");

    const navigate=useNavigate();
    const [placeholder, setPlaceholder] = useState('Search "Large Language Models"...');

    useEffect(() => {
        const topics = ["Large Language Models", "Quantum Computing", "Cancer Detection", "Climate Change", "Cybersecurity", "Machine Learning", "Blockchain"];
        let currentTopic = 0;
        const interval = window.setInterval(() => {
            currentTopic = (currentTopic + 1) % topics.length;
            setPlaceholder(`Search "${topics[currentTopic]}"...`);
        }, 2500);

        return () => window.clearInterval(interval);
    }, []);

    function handleSubmit(e){
        e.preventDefault();

        if(!query.trim()){
            return;
        }

        navigate(`/search?q=${encodeURIComponent(query)}`);
    }

    return(
        <main className="hero home-hero">
            <nav className="home-nav" aria-label="Main navigation">
                <span className="home-logo">Aether</span>
                <Link to="/saved">Saved papers</Link>
            </nav>
            <h1>Aether</h1>
            <h2>Your personal AI Research Assistant</h2>
            <p>
                Discover, organize and understand academic research
                from trusted scholarly sources.
            </p>

            <form className="search-box" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={query}
                    onChange={(e)=>setQuery(e.target.value)}
                    placeholder={placeholder}
                    required
                />

                <button type="submit">
                    Search Papers
                </button>
            </form>
        </main>
    );
}

export default Home;
