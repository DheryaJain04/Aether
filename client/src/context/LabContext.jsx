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
const RESULTS_STORAGE_KEY = "aether_lab_tool_results";

function loadBenchFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
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

    // Persist bench to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(bench));
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
        return toolResults[toolId] || null;
    }, [toolResults]);

    const setToolResult = useCallback((toolId, data) => {
        setToolResults(prev => ({
            ...prev,
            [toolId]: data
        }));
    }, []);

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
            removeFromBench,
            clearBench,
            isOnBench,
            BENCH_CAP,
            TOOL_LIMITS,
            toolResults,
            getToolResult,
            setToolResult,
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
