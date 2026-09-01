import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AetherBrand from "../components/AetherBrand";
import "./Signup.css";

export default function Signup() {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const from = location.state?.from?.pathname || "/";

    // Live Password Criteria Checks
    const criteria = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    const isPasswordValid =
        criteria.length &&
        criteria.uppercase &&
        criteria.number &&
        criteria.special;

    const passwordsMatch = password && confirmPassword && password === confirmPassword;

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Please enter your full name.");
            return;
        }

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        if (!isPasswordValid) {
            setError("Please satisfy all password security requirements.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await signup(name.trim(), email.trim(), password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || "Failed to create account. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-viewport">
            <div className="auth-background-mesh">
                <div className="mesh-glow mesh-glow-1"></div>
                <div className="mesh-glow mesh-glow-2"></div>
            </div>

            <div className="auth-container signup-container">
                <header className="auth-header">
                    <AetherBrand size="lg" theme="dark" />
                </header>

                <div className="auth-card">
                    <div className="auth-card-top-bar"></div>

                    <div className="auth-card-header">
                        <h2>Create your account</h2>
                        <p>Join researchers exploring literature with AI-augmented intelligence.</p>
                    </div>

                    {error && (
                        <div className="auth-alert error" role="alert">
                            <span className="alert-icon">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form" noValidate>
                        <div className="auth-field">
                            <label htmlFor="signup-name">Full name</label>
                            <input
                                id="signup-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Dherya Jain"
                                autoFocus
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="signup-email">Email address</label>
                            <input
                                id="signup-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@university.edu"
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="signup-password">Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    id="signup-password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a strong password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? "👁️" : "👁️‍🗨️"}
                                </button>
                            </div>

                            {/* Live Interactive Password Checklist */}
                            <div className="password-checklist">
                                <div className={`checklist-item ${criteria.length ? "met" : ""}`}>
                                    <span className="check-icon">{criteria.length ? "✓" : "○"}</span>
                                    <span>8+ characters</span>
                                </div>
                                <div className={`checklist-item ${criteria.uppercase ? "met" : ""}`}>
                                    <span className="check-icon">{criteria.uppercase ? "✓" : "○"}</span>
                                    <span>Uppercase letter</span>
                                </div>
                                <div className={`checklist-item ${criteria.number ? "met" : ""}`}>
                                    <span className="check-icon">{criteria.number ? "✓" : "○"}</span>
                                    <span>One number</span>
                                </div>
                                <div className={`checklist-item ${criteria.special ? "met" : ""}`}>
                                    <span className="check-icon">{criteria.special ? "✓" : "○"}</span>
                                    <span>Special symbol</span>
                                </div>
                            </div>
                        </div>

                        <div className="auth-field">
                            <label htmlFor="signup-confirm">Confirm password</label>
                            <input
                                id="signup-confirm"
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter your password"
                                required
                            />
                            {confirmPassword && (
                                <span className={`match-hint ${passwordsMatch ? "matched" : "mismatched"}`}>
                                    {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
                                </span>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="btn-loading-content">
                                    <span className="spinner-dot"></span>
                                    Creating account...
                                </span>
                            ) : (
                                "Get Started →"
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <span>Already have an account? </span>
                        <Link to="/login" state={{ from: location.state?.from }}>
                            Sign in
                        </Link>
                    </div>
                </div>

                <div className="auth-back-home">
                    <Link to="/">← Return to Search</Link>
                </div>
            </div>
        </div>
    );
}
