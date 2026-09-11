import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useLab } from "../../context/LabContext";
import { runCompare } from "../../services/api";
import LabPipelineProgress from "../../components/LabPipelineProgress";
import "./CompareTool.css";

const TOOL_LIMIT = 4;

const DIMENSIONS = [
    { key: "problemStatement", label: "Problem Statement" },
    { key: "methodology", label: "Core Methodology / Architecture" },
    { key: "dataset", label: "Dataset & Experimental Setup" },
    { key: "results", label: "Key Results & Metrics" },
    { key: "limitations", label: "Limitations & Constraints" },
    { key: "tradeOffs", label: "Trade-offs" }
];

export default function CompareTool() {
    const { bench } = useLab();
    const { setShowAddModal } = useOutletContext();
    const [loading, setLoading] = useState(false);
    const [activeStep, setActiveStep] = useState(1);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);
    const [activeDimension, setActiveDimension] = useState("all"); // "all" or specific key

    const hasPapers = bench.length > 0;
    const canRun = bench.length >= 2;

    async function handleRunCompare() {
        if (!canRun) return;
        setError("");
        setLoading(true);
        setActiveStep(1);

        const t1 = setTimeout(() => setActiveStep(2), 1200);
        const t2 = setTimeout(() => setActiveStep(3), 3200);
        const t3 = setTimeout(() => setActiveStep(4), 5800);
        const t4 = setTimeout(() => setActiveStep(5), 7800);

        try {
            const data = await runCompare(bench.slice(0, TOOL_LIMIT));
            setResult(data.data);
        } catch (err) {
            setError(err.message || "Failed to execute paper comparison.");
        } finally {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
            setLoading(false);
            setActiveStep(1);
        }
    }

    return (
        <div className="lab-tool-shell">
            <div className="lab-tool-header">
                <div className="lab-tool-header-left">
                    <div className="lab-tool-eyebrow">Scholar Lab · Multi-Agent Cognitive Tool 02</div>
                    <h1 className="lab-tool-title">⊞ Paper Comparison</h1>
                    <p className="lab-tool-desc">
                        A side-by-side dimensional evaluation across 2–4 papers analyzing problem statements,
                        core methodologies, benchmark datasets, quantitative results, and trade-offs.
                    </p>
                </div>
                {hasPapers && (
                    <div className="lab-tool-header-action">
                        <button
                            className="lab-run-btn"
                            disabled={!canRun || loading}
                            onClick={handleRunCompare}
                            title={!canRun ? "Add at least 2 papers" : "Run Side-by-Side Comparison"}
                        >
                            <span className="lab-run-btn-icon">{loading ? "◌" : "⊞"}</span>
                            {loading ? "Comparing..." : "Run Comparison"}
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="lab-tool-error-banner">
                    <span className="error-icon">⚠️</span> {error}
                </div>
            )}

            {!hasPapers ? (
                <div className="lab-needs-bench">
                    <div className="lab-needs-bench-icon">⊞</div>
                    <div className="lab-needs-bench-title">No papers on bench</div>
                    <div className="lab-needs-bench-text">
                        Add at least 2 papers to your bench to generate a structured side-by-side comparison.
                    </div>
                    <button className="lab-run-btn" onClick={() => setShowAddModal(true)}>
                        <span className="lab-run-btn-icon">+</span> Add Papers to Bench
                    </button>
                </div>
            ) : loading ? (
                <LabPipelineProgress
                    toolName="Paper Comparison"
                    paperCount={Math.min(bench.length, TOOL_LIMIT)}
                    activeStep={activeStep}
                />
            ) : !result ? (
                <div className="lab-tool-output-placeholder">
                    <div className="lab-tool-output-placeholder-icon">⊞</div>
                    <div className="lab-tool-output-placeholder-title">Ready to Compare {bench.length} Papers</div>
                    <div className="lab-tool-output-placeholder-text">
                        Click "Run Comparison" above to build a multi-column side-by-side evaluation matrix across all staged papers.
                    </div>
                </div>
            ) : (
                <div className="compare-results-container">
                    {/* Dimension Filter Tabs */}
                    <div className="compare-filter-bar">
                        <span className="filter-label">Filter Dimension:</span>
                        <button
                            className={`dim-filter-btn${activeDimension === "all" ? " active" : ""}`}
                            onClick={() => setActiveDimension("all")}
                        >
                            All Dimensions
                        </button>
                        {DIMENSIONS.map(dim => (
                            <button
                                key={dim.key}
                                className={`dim-filter-btn${activeDimension === dim.key ? " active" : ""}`}
                                onClick={() => setActiveDimension(dim.key)}
                            >
                                {dim.label}
                            </button>
                        ))}
                    </div>

                    {/* Side-by-Side Grid */}
                    <div className="compare-grid-wrapper">
                        <table className="compare-table">
                            <thead>
                                <tr>
                                    <th className="dim-col-header">Dimension</th>
                                    {result.paperProfiles?.map((p, idx) => (
                                        <th key={p.paperId || idx} className="paper-col-header">
                                            <div className="paper-header-badge">Paper 0{idx + 1}</div>
                                            <div className="paper-header-title">{p.title}</div>
                                            <div className="paper-header-meta">
                                                {[p.authors, p.year].filter(Boolean).join(" · ")}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {DIMENSIONS.filter(d => activeDimension === "all" || activeDimension === d.key).map(dim => (
                                    <tr key={dim.key} className="compare-row">
                                        <td className="dim-cell">
                                            <span className="dim-name">{dim.label}</span>
                                        </td>
                                        {result.paperProfiles?.map((p, pIdx) => (
                                            <td key={p.paperId || pIdx} className="content-cell">
                                                <div className="cell-content">
                                                    {p.values?.[dim.key] || "—"}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Synthesis & Trade-Off Cards */}
                    <div className="compare-meta-sections">
                        {result.comparativeSummary && (
                            <div className="synthesis-section">
                                <h3 className="synthesis-section-title">
                                    Comparative Synthesis
                                </h3>
                                <div className="synthesis-executive-text">
                                    {result.comparativeSummary}
                                </div>
                            </div>
                        )}

                        {result.tradeOffAnalysis && (
                            <div className="synthesis-section trajectory-section">
                                <h3 className="synthesis-section-title">
                                    Cross-Paper Trade-Off Analysis
                                </h3>
                                <div className="trajectory-content">
                                    {result.tradeOffAnalysis}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
