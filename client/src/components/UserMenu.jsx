import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./UserMenu.css";

function getInitials(name, email) {
    if (name && typeof name === "string") {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        if (parts.length === 1 && parts[0].length >= 2) {
            return parts[0].slice(0, 2).toUpperCase();
        }
        if (parts.length === 1 && parts[0].length === 1) {
            return parts[0].toUpperCase();
        }
    }
    if (email && typeof email === "string") {
        const local = email.split("@")[0];
        return local.slice(0, 2).toUpperCase();
    }
    return "US";
}

export default function UserMenu({ className = "" }) {
    const { user, isAuthenticated, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    if (!isAuthenticated) {
        return (
            <div className={`user-menu-guest ${className}`}>
                <Link to="/login" className="user-menu-login-btn">
                    Sign In
                </Link>
                <Link to="/signup" className="user-menu-signup-btn">
                    Sign Up
                </Link>
            </div>
        );
    }

    const initials = getInitials(user?.name, user?.email);
    const displayName = user?.name ? user.name.split(" ")[0] : "Scholar";

    function handleLogout() {
        setOpen(false);
        logout();
        navigate("/");
    }

    return (
        <div className={`user-menu-wrapper ${className}`} ref={menuRef}>
            <button
                type="button"
                className={`user-menu-trigger ${open ? "is-open" : ""}`}
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                aria-label="User profile menu"
            >
                {/* Circular User Avatar with 2 Initials */}
                <div className="user-avatar-circle" title={user?.name || user?.email}>
                    <span>{initials}</span>
                </div>
                <span className="user-trigger-name">{displayName}</span>
                <span className={`user-trigger-chevron ${open ? "open" : ""}`}>▾</span>
            </button>

            {/* Dropdown Menu */}
            {open && (
                <div className="user-dropdown-card">
                    <div className="user-dropdown-header">
                        <div className="dropdown-avatar-large">
                            {initials}
                        </div>
                        <div className="dropdown-user-details">
                            <span className="dropdown-user-name">{user?.name || "Scholar"}</span>
                            <span className="dropdown-user-email">{user?.email || ""}</span>
                        </div>
                    </div>

                    <div className="user-dropdown-divider"></div>

                    <div className="user-dropdown-links">
                        <Link
                            to="/saved"
                            className="dropdown-item"
                            onClick={() => setOpen(false)}
                        >
                            <span className="dropdown-item-icon">★</span>
                            <span>Saved Papers</span>
                        </Link>
                        <Link
                            to="/"
                            className="dropdown-item"
                            onClick={() => setOpen(false)}
                        >
                            <span className="dropdown-item-icon">🔍</span>
                            <span>New Search</span>
                        </Link>
                    </div>

                    <div className="user-dropdown-divider"></div>

                    <div className="user-dropdown-footer">
                        <button
                            type="button"
                            className="dropdown-logout-btn"
                            onClick={handleLogout}
                        >
                            <span className="dropdown-item-icon">⎋</span>
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
