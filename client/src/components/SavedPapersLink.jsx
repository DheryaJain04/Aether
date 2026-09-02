import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSavedPapers } from "../services/savedPapers";
import "./SavedPapersLink.css";

export default function SavedPapersLink({ className = "" }) {
    const { isAuthenticated } = useAuth();
    const [count, setCount] = useState(() => getSavedPapers().length);

    useEffect(() => {
        function updateCount() {
            setCount(getSavedPapers().length);
        }

        window.addEventListener("aether-saved-updated", updateCount);
        window.addEventListener("storage", updateCount);

        return () => {
            window.removeEventListener("aether-saved-updated", updateCount);
            window.removeEventListener("storage", updateCount);
        };
    }, []);

    // Do NOT show saved papers link if the user is not authenticated
    if (!isAuthenticated) {
        return null;
    }

    return (
        <Link
            to="/saved"
            className={`aether-saved-link-btn ${className}`}
            title={count > 0 ? `${count} saved paper${count === 1 ? "" : "s"} in your library` : "View your saved papers library"}
            aria-label={`Saved papers, ${count} item${count === 1 ? "" : "s"}`}
        >
            <span className="saved-link-icon" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
            </span>
            <span className="saved-link-label">Saved Papers</span>
            {count > 0 && (
                <span className="saved-link-badge">
                    {count > 99 ? "99+" : count}
                </span>
            )}
        </Link>
    );
}
