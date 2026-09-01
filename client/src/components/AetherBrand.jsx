import { Link } from "react-router-dom";
import "./AetherBrand.css";

export default function AetherBrand({
    size = "md",
    to = "/",
    theme = "auto", // "auto", "light", "dark"
    className = ""
}){
    const content = (
        <span className={`aether-stylized-wordmark size-${size} theme-${theme} ${className}`}>
            <span className="aether-word-text">AETHER</span>
        </span>
    );

    if (to) {
        return (
            <Link to={to} className="aether-wordmark-link" aria-label="Aether">
                {content}
            </Link>
        );
    }

    return content;
}
