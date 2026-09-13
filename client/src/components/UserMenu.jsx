import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSavedPapers } from "../services/savedPapers";
import AccountSettingsModal from "./AccountSettingsModal";
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
    const [showSettings, setShowSettings] = useState(false);
    const [savedCount, setSavedCount] = useState(() => getSavedPapers().length);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    // Sync saved papers count for dropdown badge
    useEffect(() => {
        function updateCount() {
            setSavedCount(getSavedPapers().length);
        }
        window.addEventListener("aether-saved-updated", updateCount);
        window.addEventListener("storage", updateCount);
        return () => {
            window.removeEventListener("aether-saved-updated", updateCount);
            window.removeEventListener("storage", updateCount);
        };
    }, []);

    // Close dropdown on outside click or Escape key
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        function handleKeyDown(event) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
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
                aria-haspopup="menu"
                aria-label="User profile menu"
            >
                {/* Circular User Avatar with 2 Initials */}
                <div className="user-avatar-circle" title={user?.name || user?.email}>
                    <span>{initials}</span>
                </div>
                <span className="user-trigger-name">{displayName}</span>
                <span className={`user-trigger-chevron ${open ? "open" : ""}`} aria-hidden="true">
                    ▾
                </span>
            </button>

            {/* Dropdown Menu */}
            {open && (
                <div className="user-dropdown-card" role="menu" aria-label="User options">
                    <div className="user-dropdown-header">
                        <div className="dropdown-avatar-large">
                            {initials}
                        </div>
                        <div className="dropdown-user-details">
                            <span className="dropdown-user-name">{user?.name || "Scholar"}</span>
                            <span className="dropdown-user-email">{user?.email || ""}</span>
                            <div className="dropdown-account-badge">
                                <span className="account-badge-sparkle">✦</span>
                                <span>Scholar Account</span>
                            </div>
                        </div>
                    </div>

                    <div className="user-dropdown-divider"></div>

                    <div className="user-dropdown-links">
                        <Link
                            to="/saved"
                            className="dropdown-item"
                            role="menuitem"
                            onClick={() => setOpen(false)}
                        >
                            <span className="dropdown-item-icon" aria-hidden="true">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                </svg>
                            </span>
                            <span className="dropdown-item-text">Scholar Library</span>
                            {savedCount > 0 && (
                                <span className="dropdown-item-badge">
                                    {savedCount > 99 ? "99+" : savedCount}
                                </span>
                            )}
                        </Link>
                        <Link
                            to="/lab"
                            className="dropdown-item"
                            role="menuitem"
                            onClick={() => setOpen(false)}
                        >
                            <span className="dropdown-item-icon" aria-hidden="true">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18" />
                                </svg>
                            </span>
                            <span className="dropdown-item-text">Scholar Lab</span>
                            <span className="dropdown-item-new-badge">NEW</span>
                        </Link>
                        <Link
                            to="/"
                            className="dropdown-item"
                            role="menuitem"
                            onClick={() => setOpen(false)}
                        >
                            <span className="dropdown-item-icon" aria-hidden="true">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </span>
                            <span className="dropdown-item-text">New Search</span>
                        </Link>
                        <button
                            type="button"
                            className="dropdown-item"
                            role="menuitem"
                            style={{ width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer", font: "inherit", color: "inherit" }}
                            onClick={() => {
                                setOpen(false);
                                setShowSettings(true);
                            }}
                        >
                            <span className="dropdown-item-icon" aria-hidden="true">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                </svg>
                            </span>
                            <span className="dropdown-item-text">Account Settings</span>
                        </button>
                    </div>

                    <div className="user-dropdown-divider"></div>

                    <div className="user-dropdown-footer">
                        <button
                            type="button"
                            className="dropdown-logout-btn"
                            role="menuitem"
                            onClick={handleLogout}
                        >
                            <span className="dropdown-item-icon" aria-hidden="true">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                            </span>
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            )}

            <AccountSettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />
        </div>
    );
}
