import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AetherBrand from "./AetherBrand";
import SavedPapersLink from "./SavedPapersLink";
import UserMenu from "./UserMenu";
import "./Navbar.css";

export default function Navbar({
    className = "",
    leftContent = null,
    centerContent = null,
    showSaved = true,
    brandSize = "sm",
    variant = "default"
}) {
    const { isAuthenticated } = useAuth();

    return (
        <header className={`aether-header header-${variant} ${className}`}>
            <div className="header-left">
                {leftContent || <AetherBrand size={brandSize} />}
            </div>

            {centerContent && (
                <div className="header-center">
                    {centerContent}
                </div>
            )}

            <div className="header-right">
                {isAuthenticated && showSaved && <SavedPapersLink />}
                {isAuthenticated && showSaved && <div className="header-nav-divider" aria-hidden="true" />}
                <UserMenu />
            </div>
        </header>
    );
}
