import { useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { useLab } from "../../context/LabContext";
import { runCompare } from "../../services/api";
import LabPipelineProgress from "../../components/LabPipelineProgress";
import "./CompareTool.css";

const TOOL_LIMIT = 4;

const DIMENSIONS = [
    { key: "problemStatement", label: "Problem Statement", icon: "🎯" },
    { key: "methodology", label: "Core Methodology / Architecture", icon: "⚙️" },
    { key: "dataset", label: "Dataset & Experimental Setup", icon: "📊" },
    { key: "results", label: "Key Results & Metrics", icon: "📈" },
    { key: "limitations", label: "Limitations & Constraints", icon: "⚠️" },
    { key: "tradeOffs", label: "Trade-offs", icon: "⚖️" }
];

export default function CompareTool() {
    const { bench } = useLab();
    const { setShowAddModal } = useOutletContext();
    const [loading, setLoading] = useState(false);
    const [activeStep, setActiveStep] = useState(1);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);
    const [activeDimension, setActiveDimension] = useState("all"); // "all" or specific key
    const [viewMode, setViewMode] = useState("matrix"); // "matrix" (table) | "cards"
    const [copied, setCopied] = useState(false);

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

    function generateMarkdownReport() {
        if (!result || !result.paperProfiles) return "";

        let md = `# Aether Scholar Lab · Cross-Paper Dimensional Comparison\n\n`;
        md += `*Generated: ${new Date().toLocaleDateString()} | Total Papers Compared: ${result.paperProfiles.length}*\n\n`;
        
        md += `## 1. Staged Papers Overview\n\n`;
        result.paperProfiles.forEach((p, idx) => {
            md += `### [Paper ${idx + 1}] ${p.title}\n`;
            md += `- **Authors / Year**: ${[p.authors, p.year].filter(Boolean).join(" · ")}\n`;
            if (p.keyAdvantage) md += `- **Standout Advantage**: ${p.keyAdvantage}\n`;
            if (p.primaryContribution) md += `- **Primary Contribution**: ${p.primaryContribution}\n`;
            md += `\n`;
        });

        md += `## 2. Side-by-Side Dimensional Matrix\n\n`;
        const headers = ["Dimension", ...result.paperProfiles.map((p, idx) => `Paper ${idx + 1}: ${p.title.slice(0, 30)}...`)];
        md += `| ${headers.join(" | ")} |\n`;
        md += `| ${headers.map(() => "---").join(" | ")} |\n`;

        DIMENSIONS.forEach(dim => {
            const rowVals = result.paperProfiles.map(p => {
                const val = p.values?.[dim.key] || "—";
                return val.replace(/\|/g, "\\|").replace(/\n/g, " ");
            });
            md += `| **${dim.label}** | ${rowVals.join(" | ")} |\n`;
        });

        if (result.comparativeSummary) {
            md += `\n## 3. Comparative Synthesis\n\n${result.comparativeSummary}\n\n`;
        }

        if (result.tradeOffAnalysis) {
            md += `## 4. Cross-Paper Trade-Off Analysis\n\n${result.tradeOffAnalysis}\n\n`;
        }

        md += `---\n*Report compiled via Aether 5-Layer Multi-Agent Cognitive Engine*\n`;
        return md;
    }

    function handleCopyReport() {
        const md = generateMarkdownReport();
        if (!md) return;
        navigator.clipboard.writeText(md).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2400);
        });
    }

    function handleDownloadMarkdown() {
        const md = generateMarkdownReport();
        if (!md) return;
        const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `aether-comparison-${Date.now()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    return (
        <div className="lab-tool-shell">
            <div className="lab-tool-header">
                <div className="lab-tool-header-left">
                    <div className="lab-tool-eyebrow">Scholar Lab · Multi-Agent Cognitive Tool 02</div>
                    <h1 className="lab-tool-title">⊞ Paper Comparison</h1>
                    <p className="lab-tool-desc">
                        A structured side-by-side dimensional evaluation across 2–4 papers analyzing problem formulations,
                        core architectures, benchmark datasets, quantitative metrics, limitations, and operational trade-offs.
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
                    {/* Controls & Export Toolbar */}
                    <div className="compare-action-toolbar">
                        {/* View Mode Toggle */}
                        <div className="compare-view-toggle">
                            <button
                                className={`view-toggle-btn ${viewMode === "matrix" ? "active" : ""}`}
                                onClick={() => setViewMode("matrix")}
                                title="Table Matrix View"
                            >
                                <span>▦</span> Matrix Table
                            </button>
                            <button
                                className={`view-toggle-btn ${viewMode === "cards" ? "active" : ""}`}
                                onClick={() => setViewMode("cards")}
                                title="Side-by-Side Cards View"
                            >
                                <span>🗂️</span> Profile Cards
                            </button>
                        </div>

                        {/* Export & Actions */}
                        <div className="compare-export-actions">
                            <button
                                className="compare-export-btn"
                                onClick={handleCopyReport}
                                title="Copy comparison markdown to clipboard"
                            >
                                <span>{copied ? "✓" : "📋"}</span>
                                {copied ? "Copied!" : "Copy Report"}
                            </button>
                            <button
                                className="compare-export-btn primary"
                                onClick={handleDownloadMarkdown}
                                title="Download complete markdown report"
                            >
                                <span>📥</span>
                                Export Markdown
                            </button>
                        </div>
                    </div>

                    {/* Dimension Filter Tabs */}
                    <div className="compare-filter-bar">
                        <span className="filter-label">Filter Dimension:</span>
                        <button
                            className={`dim-filter-btn${activeDimension === "all" ? " active" : ""}`}
                            onClick={() => setActiveDimension("all")}
                        >
                            <span>🌐</span> All Dimensions
                        </button>
                        {DIMENSIONS.map(dim => (
                            <button
                                key={dim.key}
                                className={`dim-filter-btn${activeDimension === dim.key ? " active" : ""}`}
                                onClick={() => setActiveDimension(dim.key)}
                            >
                                <span>{dim.icon}</span> {dim.label}
                            </button>
                        ))}
                    </div>

                    {/* VIEW MODE 1: Table Matrix View */}
                    {viewMode === "matrix" && (
                        <div className="compare-grid-wrapper">
                            <table className="compare-table">
                                <thead>
                                    <tr>
                                        <th className="dim-col-header">Dimension</th>
                                        {result.paperProfiles?.map((p, idx) => (
                                            <th key={p.paperId || idx} className="paper-col-header">
                                                <div className="paper-header-badge-row">
                                                    <span className="paper-header-badge">Paper 0{idx + 1}</span>
                                                    {p.paperId && !p.paperId.startsWith("custom_") && (
                                                        <Link to={`/paper/${encodeURIComponent(p.paperId)}`} className="paper-link-pill" target="_blank" rel="noreferrer">
                                                            View Paper ↗
                                                        </Link>
                                                    )}
                                                </div>
                                                <div className="paper-header-title">{p.title}</div>
                                                <div className="paper-header-meta">
                                                    {[p.authors, p.year].filter(Boolean).join(" · ")}
                                                </div>
                                                {p.keyAdvantage && (
                                                    <div className="paper-advantage-badge" title="Key Standout Advantage">
                                                        <span className="adv-icon">⚡</span>
                                                        <span className="adv-text">{p.keyAdvantage}</span>
                                                    </div>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {DIMENSIONS.filter(d => activeDimension === "all" || activeDimension === d.key).map(dim => (
                                        <tr key={dim.key} className="compare-row">
                                            <td className="dim-cell">
                                                <div className="dim-cell-content">
                                                    <span className="dim-icon">{dim.icon}</span>
                                                    <span className="dim-name">{dim.label}</span>
                                                </div>
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
                    )}

                    {/* VIEW MODE 2: Side-by-Side Cards View */}
                    {viewMode === "cards" && (
                        <div className="compare-cards-grid">
                            {result.paperProfiles?.map((p, idx) => (
                                <div key={p.paperId || idx} className="compare-paper-card">
                                    <div className="compare-card-header">
                                        <div className="card-badge-row">
                                            <span className="paper-card-badge">Paper 0{idx + 1}</span>
                                            {p.paperId && !p.paperId.startsWith("custom_") && (
                                                <Link to={`/paper/${encodeURIComponent(p.paperId)}`} className="paper-link-pill" target="_blank" rel="noreferrer">
                                                    Inspect ↗
                                                </Link>
                                            )}
                                        </div>
                                        <h3 className="compare-card-title">{p.title}</h3>
                                        <div className="compare-card-meta">
                                            {[p.authors, p.year].filter(Boolean).join(" · ")}
                                        </div>
                                    </div>

                                    {p.keyAdvantage && (
                                        <div className="card-advantage-box">
                                            <span className="adv-title">⚡ Standout Advantage</span>
                                            <p className="adv-desc">{p.keyAdvantage}</p>
                                        </div>
                                    )}

                                    <div className="card-dimensions-list">
                                        {DIMENSIONS.filter(d => activeDimension === "all" || activeDimension === d.key).map(dim => (
                                            <div key={dim.key} className="card-dimension-item">
                                                <div className="card-dim-label">
                                                    <span className="dim-icon">{dim.icon}</span>
                                                    <span>{dim.label}</span>
                                                </div>
                                                <div className="card-dim-value">
                                                    {p.values?.[dim.key] || "—"}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Meta Synthesis & Trade-Off Cards */}
                    <div className="compare-meta-sections">
                        {result.comparativeSummary && (
                            <div className="synthesis-section">
                                <div className="synthesis-section-header">
                                    <span className="section-badge-icon">🧠</span>
                                    <h3 className="synthesis-section-title">
                                        Cross-Paper Comparative Synthesis
                                    </h3>
                                </div>
                                <div className="synthesis-executive-text">
                                    {result.comparativeSummary}
                                </div>
                            </div>
                        )}

                        {result.tradeOffAnalysis && (
                            <div className="synthesis-section trajectory-section">
                                <div className="synthesis-section-header">
                                    <span className="section-badge-icon">⚖️</span>
                                    <h3 className="synthesis-section-title">
                                        Dimensional Trade-Off & Practical Feasibility Analysis
                                    </h3>
                                </div>
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

