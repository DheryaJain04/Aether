import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AetherBrand from "../components/AetherBrand";
import "./Login.css";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const from = location.state?.from?.pathname || "/";

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password) {
            setError("Please fill in both email and password.");
            return;
        }

        setLoading(true);
        try {
            await login(email.trim(), password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || "Failed to sign in. Please check your credentials.");
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

            <div className="auth-container">
                <header className="auth-header">
                    <AetherBrand size="lg" theme="dark" />
                </header>

                <div className="auth-card">
                    <div className="auth-card-top-bar"></div>

                    <div className="auth-card-header">
                        <h2>Welcome back</h2>
                        <p>Sign in to access your saved research, custom collections, and history.</p>
                    </div>

                    {error && (
                        <div className="auth-alert error" role="alert">
                            <span className="alert-icon">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form" noValidate>
                        <div className="auth-field">
                            <label htmlFor="login-email">Email address</label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@university.edu"
                                autoFocus
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <div className="field-label-row">
                                <label htmlFor="login-password">Password</label>
                            </div>
                            <div className="password-input-wrapper">
                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
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
                        </div>

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="btn-loading-content">
                                    <span className="spinner-dot"></span>
                                    Authenticating...
                                </span>
                            ) : (
                                "Sign In →"
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <span>New to Aether? </span>
                        <Link to="/signup" state={{ from: location.state?.from }}>
                            Create an account
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
