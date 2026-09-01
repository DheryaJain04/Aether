import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, loginUser, logoutUser, signupUser } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function verifySession() {
            try {
                const data = await getCurrentUser();
                if (active && data.user) {
                    setUser(data.user);
                }
            } catch {
                if (active) {
                    setUser(null);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        verifySession();

        return () => {
            active = false;
        };
    }, []);

    async function login(email, password) {
        const data = await loginUser({ email, password });
        if (data.user) {
            setUser(data.user);
        }
        return data.user;
    }

    async function signup(name, email, password) {
        const data = await signupUser({ name, email, password });
        if (data.user) {
            setUser(data.user);
        }
        return data.user;
    }

    async function logout() {
        try {
            await logoutUser();
        } finally {
            setUser(null);
        }
    }

    const value = {
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        signup,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
