import { createContext, useCallback, useContext, useEffect, useState } from "react";

// Per-tool operational limits (how many papers each tool will actually process)
export const TOOL_LIMITS = {
    synthesis: 5,
    compare:   5,
    matrix:    5,
    gaps:      5
};

// Bench hard cap — max papers a user can hold on the workbench at once
export const BENCH_CAP = 5;

const STORAGE_KEY = "aether_lab_bench";

function loadBenchFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

const LabContext = createContext(null);

export function LabProvider({ children }) {
    const [bench, setBench] = useState(loadBenchFromStorage);

    // Persist bench to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(bench));
        } catch {
            // Storage quota exceeded — fail silently
        }
    }, [bench]);

    const addToBench = useCallback((paper) => {
        setBench(current => {
            if (current.length >= BENCH_CAP) return current;
            if (current.some(p => p.id === paper.id)) return current;
            return [...current, paper];
        });
    }, []);

    const removeFromBench = useCallback((paperId) => {
        setBench(current => current.filter(p => p.id !== paperId));
    }, []);

    const clearBench = useCallback(() => {
        setBench([]);
    }, []);

    const isOnBench = useCallback((paperId) => {
        return bench.some(p => p.id === paperId);
    }, [bench]);

    return (
        <LabContext.Provider value={{ bench, addToBench, removeFromBench, clearBench, isOnBench, BENCH_CAP, TOOL_LIMITS }}>
            {children}
        </LabContext.Provider>
    );
}

export function useLab() {
    const ctx = useContext(LabContext);
    if (!ctx) throw new Error("useLab must be used inside <LabProvider>");
    return ctx;
}
