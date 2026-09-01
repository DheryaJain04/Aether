import { useState, useRef, useEffect } from "react";
import { getCustomPlaylists, createPlaylist, togglePaperPlaylist } from "../services/playlistService";
import "./PlaylistMenu.css";

export default function PlaylistMenu({ paper, onPlaylistChange }) {
    const [open, setOpen] = useState(false);
    const [playlists, setPlaylists] = useState(getCustomPlaylists);
    const [newTitle, setNewTitle] = useState("");
    const [creating, setCreating] = useState(false);
    const menuRef = useRef(null);

    const assignedLists = Array.isArray(paper.playlists) ? paper.playlists : [];

    useEffect(() => {
        function handleOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
                setCreating(false);
            }
        }
        if (open) {
            setPlaylists(getCustomPlaylists());
            document.addEventListener("mousedown", handleOutside);
        }
        return () => document.removeEventListener("mousedown", handleOutside);
    }, [open]);

    function handleToggle(playlistId) {
        togglePaperPlaylist(paper.id, playlistId);
        onPlaylistChange?.();
    }

    function handleCreate(e) {
        e.preventDefault();
        if (!newTitle.trim()) return;
        const created = createPlaylist(newTitle.trim());
        if (created) {
            togglePaperPlaylist(paper.id, created.id);
            setPlaylists(getCustomPlaylists());
            setNewTitle("");
            setCreating(false);
            onPlaylistChange?.();
        }
    }

    return (
        <div className="playlist-menu-wrapper" ref={menuRef}>
            <button
                type="button"
                className={`playlist-trigger-btn ${assignedLists.length ? "has-playlists" : ""}`}
                onClick={() => setOpen(prev => !prev)}
                aria-haspopup="true"
                aria-expanded={open}
                title="Manage playlists for this paper"
            >
                <span>📁</span>
                <span>{assignedLists.length ? `${assignedLists.length} List${assignedLists.length > 1 ? "s" : ""}` : "Add to Playlist"}</span>
                <span className="caret">▾</span>
            </button>

            {open && (
                <div className="playlist-popover">
                    <div className="popover-header">
                        <span>Save to Research Playlist</span>
                    </div>

                    <div className="popover-list">
                        {playlists.length === 0 ? (
                            <p className="no-playlists-hint">No playlists yet. Create one below!</p>
                        ) : (
                            playlists.map(pl => {
                                const isChecked = assignedLists.includes(pl.id);
                                return (
                                    <label key={pl.id} className="playlist-check-item">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => handleToggle(pl.id)}
                                        />
                                        <span className="check-icon">{pl.icon || "📁"}</span>
                                        <span className="check-title">{pl.name}</span>
                                    </label>
                                );
                            })
                        )}
                    </div>

                    <div className="popover-footer">
                        {creating ? (
                            <form className="quick-create-form" onSubmit={handleCreate}>
                                <input
                                    type="text"
                                    placeholder="Playlist name..."
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    autoFocus
                                />
                                <button type="submit" className="save-pl-btn">Create</button>
                                <button
                                    type="button"
                                    className="cancel-pl-btn"
                                    onClick={() => setCreating(false)}
                                >
                                    ✕
                                </button>
                            </form>
                        ) : (
                            <button
                                type="button"
                                className="start-create-btn"
                                onClick={() => setCreating(true)}
                            >
                                + New Playlist
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
