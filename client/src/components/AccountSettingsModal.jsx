import { useState } from "react";
import { createPortal } from "react-dom";
import { changePassword, deleteAccount } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./AccountSettingsModal.css";

export default function AccountSettingsModal({ isOpen, onClose }) {
    const { user, logout } = useAuth();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [deletePass, setDeletePass] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    async function handlePasswordChange(e) {
        e.preventDefault();
        setStatusMsg({ type: "", text: "" });

        if (newPassword !== confirmPassword) {
            setStatusMsg({ type: "error", text: "New passwords do not match." });
            return;
        }

        if (newPassword.length < 8) {
            setStatusMsg({ type: "error", text: "Password must be at least 8 characters long." });
            return;
        }

        setLoading(true);
        try {
            const res = await changePassword(currentPassword, newPassword);
            setStatusMsg({ type: "success", text: res.message || "Password changed successfully!" });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setStatusMsg({ type: "error", text: err.message || "Failed to change password." });
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteAccount(e) {
        e.preventDefault();
        setStatusMsg({ type: "", text: "" });
        setLoading(true);
        try {
            await deleteAccount(deletePass);
            logout();
            onClose();
        } catch (err) {
            setStatusMsg({ type: "error", text: err.message || "Failed to delete account." });
            setLoading(false);
        }
    }

    const modalContent = (
        <div className="settings-modal-overlay" onClick={onClose} aria-modal="true" role="dialog">
            <div className="settings-modal-card" onClick={e => e.stopPropagation()} aria-labelledby="settings-title">
                <div className="settings-modal-header">
                    <h2 id="settings-title">Account Settings</h2>
                    <button type="button" className="settings-close-btn" onClick={onClose} aria-label="Close settings">✕</button>
                </div>

                <div className="settings-user-info">
                    <div className="settings-avatar-badge">{user?.name ? user.name[0].toUpperCase() : "S"}</div>
                    <div>
                        <strong>{user?.name || "Scholar"}</strong>
                        <p>{user?.email}</p>
                    </div>
                </div>

                {statusMsg.text && (
                    <div className={`settings-status-alert ${statusMsg.type}`}>
                        {statusMsg.text}
                    </div>
                )}

                <div className="settings-section">
                    <h3>Change Password</h3>
                    <form onSubmit={handlePasswordChange} className="settings-form">
                        <div className="settings-field">
                            <label htmlFor="curr-pass">Current Password</label>
                            <input
                                id="curr-pass"
                                type="password"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div className="settings-field">
                            <label htmlFor="new-pass">New Password</label>
                            <input
                                id="new-pass"
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="Min 8 chars, 1 uppercase, 1 digit, 1 symbol"
                                required
                            />
                        </div>
                        <div className="settings-field">
                            <label htmlFor="confirm-pass">Confirm New Password</label>
                            <input
                                id="confirm-pass"
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button type="submit" className="settings-submit-btn" disabled={loading}>
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                </div>

                <div className="settings-danger-section">
                    <h3>Danger Zone</h3>
                    {!showDeleteConfirm ? (
                        <button
                            type="button"
                            className="settings-delete-trigger-btn"
                            onClick={() => setShowDeleteConfirm(true)}
                        >
                            Delete Account & Associated Data
                        </button>
                    ) : (
                        <form onSubmit={handleDeleteAccount} className="settings-delete-confirm-form">
                            <p className="delete-warning">
                                ⚠️ This action cannot be undone. All your saved papers, playlists, and history will be permanently erased.
                            </p>
                            <div className="settings-field">
                                <label htmlFor="del-pass">Confirm with Password</label>
                                <input
                                    id="del-pass"
                                    type="password"
                                    value={deletePass}
                                    onChange={e => setDeletePass(e.target.value)}
                                    placeholder="Enter current password"
                                    required
                                />
                            </div>
                            <div className="delete-actions-row">
                                <button type="submit" className="settings-confirm-delete-btn" disabled={loading}>
                                    {loading ? "Deleting..." : "Permanently Delete"}
                                </button>
                                <button
                                    type="button"
                                    className="settings-cancel-btn"
                                    onClick={() => setShowDeleteConfirm(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
