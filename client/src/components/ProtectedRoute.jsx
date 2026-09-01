import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "70vh",
                gap: "16px",
                color: "#64748B",
                fontFamily: "'Outfit', sans-serif"
            }}>
                <div style={{
                    width: "42px",
                    height: "42px",
                    border: "3px solid #E2E8F0",
                    borderTopColor: "#2563EB",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                }} />
                <p style={{ fontSize: "16px", fontWeight: 500 }}>Verifying credentials...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
