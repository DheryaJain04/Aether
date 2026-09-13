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

function getBenchStorageKey() {
    try {
        const raw = typeof localStorage !== "undefined" ? localStorage.getItem("aether_current_user") : null;
        if (raw) {
            const user = JSON.parse(raw);
            if (user?.id) return `aether_lab_bench_${user.id}`;
        }
    } catch {}
    return "aether_lab_bench";
}

const RESULTS_STORAGE_KEY = "aether_lab_tool_results";

function loadBenchFromStorage() {
    try {
        const key = getBenchStorageKey();
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function loadResultsFromStorage() {
    try {
        const raw = sessionStorage.getItem(RESULTS_STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

const LabContext = createContext(null);

export function LabProvider({ children }) {
    const [bench, setBench] = useState(loadBenchFromStorage);
    const [toolResults, setToolResults] = useState(loadResultsFromStorage);

    // Reload bench when active user changes (login / logout)
    useEffect(() => {
        function handleUserChange() {
            setBench(loadBenchFromStorage());
        }
        window.addEventListener("aether-user-changed", handleUserChange);
        return () => window.removeEventListener("aether-user-changed", handleUserChange);
    }, []);

    // Persist bench to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(getBenchStorageKey(), JSON.stringify(bench));
        } catch {
            // Storage quota exceeded — fail silently
        }
    }, [bench]);

    // Persist toolResults to sessionStorage whenever they change
    useEffect(() => {
        try {
            sessionStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(toolResults));
        } catch {
            // Storage quota exceeded — fail silently
        }
    }, [toolResults]);

    const addToBench = useCallback((paper) => {
        setBench(current => {
            if (current.length >= BENCH_CAP) return current;
            if (current.some(p => p.id === paper.id)) return current;
            return [...current, paper];
        });
    }, []);

    const reorderBench = useCallback((newBench) => {
        if (Array.isArray(newBench)) {
            setBench(newBench.slice(0, BENCH_CAP));
        }
    }, []);

    const removeFromBench = useCallback((paperId) => {
        setBench(current => current.filter(p => p.id !== paperId));
    }, []);

    const clearBench = useCallback(() => {
        setBench([]);
        setToolResults({});
        try {
            sessionStorage.removeItem(RESULTS_STORAGE_KEY);
        } catch {}
    }, []);

    const isOnBench = useCallback((paperId) => {
        return bench.some(p => p.id === paperId);
    }, [bench]);

    const getToolResult = useCallback((toolId) => {
        const entry = toolResults[toolId];
        if (!entry) return null;
        // Support both { data, paperIds } object and raw data
        return entry.data !== undefined ? entry.data : entry;
    }, [toolResults]);

    const setToolResult = useCallback((toolId, data, paperIds = []) => {
        setToolResults(prev => ({
            ...prev,
            [toolId]: {
                data,
                paperIds: Array.isArray(paperIds) ? paperIds.map(String) : []
            }
        }));
    }, []);

    const isToolStale = useCallback((toolId) => {
        const entry = toolResults[toolId];
        if (!entry || !entry.data || !Array.isArray(entry.paperIds) || entry.paperIds.length === 0) {
            return false;
        }
        const currentBenchIds = bench.map(p => String(p.id));
        const evaluatedIds = entry.paperIds.map(String);
        if (currentBenchIds.length !== evaluatedIds.length) return true;
        return !currentBenchIds.every(id => evaluatedIds.includes(id));
    }, [toolResults, bench]);

    const clearToolResults = useCallback(() => {
        setToolResults({});
        try {
            sessionStorage.removeItem(RESULTS_STORAGE_KEY);
        } catch {}
    }, []);

    return (
        <LabContext.Provider value={{
            bench,
            addToBench,
            reorderBench,
            removeFromBench,
            clearBench,
            isOnBench,
            BENCH_CAP,
            TOOL_LIMITS,
            toolResults,
            getToolResult,
            setToolResult,
            isToolStale,
            clearToolResults
        }}>
            {children}
        </LabContext.Provider>
    );
}

export function useLab() {
    const ctx = useContext(LabContext);
    if (!ctx) throw new Error("useLab must be used inside <LabProvider>");
    return ctx;
}
