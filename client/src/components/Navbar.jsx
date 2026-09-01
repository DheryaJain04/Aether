import { Link } from "react-router-dom";
import AetherBrand from "./AetherBrand";
import UserMenu from "./UserMenu";
import "./Navbar.css";

export default function Navbar() {
    return (
        <header className="aether-navbar">
            <AetherBrand size="sm" />

            <div className="navbar-actions">
                <Link to="/saved" className="navbar-saved-link">
                    Saved Papers
                </Link>
                <UserMenu />
            </div>
        </header>
    );
}
