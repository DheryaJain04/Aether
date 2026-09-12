import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useLab } from "../../context/LabContext";
import { runMatrix } from "../../services/api";
import LabPipelineProgress from "../../components/LabPipelineProgress";
import "./MatrixTool.css";

const TOOL_LIMIT = 5;

const STANCE_CONFIG = {
    supports: { label: "Supports", icon: "✓", badgeClass: "stance-supports" },
    contradicts: { label: "Contradicts", icon: "✕", badgeClass: "stance-contradicts" },
    partial: { label: "Partial / Mixed", icon: "◐", badgeClass: "stance-partial" },
    silent: { label: "Silent / Not Addressed", icon: "—", badgeClass: "stance-silent" }
};

export default function MatrixTool() {
    const { bench, getToolResult, setToolResult } = useLab();
    const { setShowAddModal } = useOutletContext();
    const [loading, setLoading] = useState(false);
    const [activeStep, setActiveStep] = useState(1);
    const [error, setError] = useState("");
    const result = getToolResult("matrix");
    const [selectedStance, setSelectedStance] = useState(null); // { claim, paper, stanceObj }

    const hasPapers = bench.length > 0;
    const canRun = bench.length >= 2;

    async function handleRunMatrix() {
        if (!canRun) return;
        setError("");
        setLoading(true);
        setActiveStep(1);

        const t1 = setTimeout(() => setActiveStep(2), 1200);
        const t2 = setTimeout(() => setActiveStep(3), 3200);
        const t3 = setTimeout(() => setActiveStep(4), 5800);
        const t4 = setTimeout(() => setActiveStep(5), 7800);

        try {
            const data = await runMatrix(bench.slice(0, TOOL_LIMIT));
            setToolResult("matrix", data.data);
        } catch (err) {
            setError(err.message || "Failed to generate evidence matrix.");
        } finally {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
            setLoading(false);
            setActiveStep(1);
        }
    }

    function getPaper(paperId) {
        return bench.find(p => String(p.id) === String(paperId)) || { id: paperId, title: paperId };
    }

    return (
        <div className="lab-tool-shell">
            <div className="lab-tool-header">
                <div className="lab-tool-header-left">
                    <div className="lab-tool-eyebrow">Scholar Lab · Multi-Agent Cognitive Tool 03</div>
                    <h1 className="lab-tool-title">≡ Evidence Matrix</h1>
                    <p className="lab-tool-desc">
                        An interactive Claims × Papers empirical evidence grid. Evaluates whether each paper
                        supports, contradicts, or remains silent on central scientific propositions.
                    </p>
                </div>
                {hasPapers && (
                    <div className="lab-tool-header-action">
                        <button
                            className="lab-run-btn"
                            disabled={!canRun || loading}
                            onClick={handleRunMatrix}
                            title={!canRun ? "Add at least 2 papers" : "Build Evidence Matrix"}
                        >
                            <span className="lab-run-btn-icon">{loading ? "◌" : "≡"}</span>
                            {loading ? "Evaluating..." : "Build Matrix"}
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
                    <div className="lab-needs-bench-icon">≡</div>
                    <div className="lab-needs-bench-title">No papers on bench</div>
                    <div className="lab-needs-bench-text">
                        Add at least 2 papers to your bench to build an empirical claims matrix.
                    </div>
                    <button className="lab-run-btn" onClick={() => setShowAddModal(true)}>
                        <span className="lab-run-btn-icon">+</span> Add Papers to Bench
                    </button>
                </div>
            ) : loading ? (
                <LabPipelineProgress
                    toolName="Evidence Matrix"
                    paperCount={Math.min(bench.length, TOOL_LIMIT)}
                    activeStep={activeStep}
                />
            ) : !result ? (
                <div className="lab-tool-output-placeholder">
                    <div className="lab-tool-output-placeholder-icon">≡</div>
                    <div className="lab-tool-output-placeholder-title">Ready to Map Claims Across {bench.length} Papers</div>
                    <div className="lab-tool-output-placeholder-text">
                        Click "Build Matrix" above. Aether will extract central empirical hypotheses and assess
                        each paper's stance with citation excerpts.
                    </div>
                </div>
            ) : (
                <div className="matrix-results-container">
                    {/* Consensus Score Banner */}
                    <div className="matrix-score-banner">
                        <div className="score-badge-circle">
                            <span className="score-val">{result.consensusScore ?? 75}%</span>
                            <span className="score-lbl">Consensus</span>
                        </div>
                        <div className="score-meta-info">
                            <h3 className="score-meta-title">Corpus Consensus Alignment</h3>
                            <p className="score-meta-desc">
                                {result.matrixSummary || "Multi-agent evaluation of claim validity and empirical convergence across selected research papers."}
                            </p>
                        </div>
                        {/* Stance Legend */}
                        <div className="matrix-legend">
                            <span className="legend-item"><span className="legend-dot supports"></span> Supports</span>
                            <span className="legend-item"><span className="legend-dot contradicts"></span> Contradicts</span>
                            <span className="legend-item"><span className="legend-dot partial"></span> Partial</span>
                            <span className="legend-item"><span className="legend-dot silent"></span> Silent</span>
                        </div>
                    </div>

                    {/* Claims × Papers Table */}
                    <div className="matrix-table-container">
                        <table className="matrix-table">
                            <thead>
                                <tr>
                                    <th className="claim-col-header">Central Empirical Claims</th>
                                    {bench.slice(0, TOOL_LIMIT).map((p, idx) => (
                                        <th key={p.id} className="matrix-paper-header" title={p.title}>
                                            <div className="p-header-badge">Paper 0{idx + 1}</div>
                                            <div className="p-header-title">{p.title}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {result.claims?.map((claim, cIdx) => (
                                    <tr key={claim.id || cIdx} className="matrix-claim-row">
                                        <td className="claim-info-cell">
                                            <span className="claim-domain-badge">{claim.domain || "Hypothesis"}</span>
                                            <div className="claim-text">{claim.claimText}</div>
                                        </td>
                                        {bench.slice(0, TOOL_LIMIT).map(p => {
                                            const stanceItem = claim.stances?.find(s => String(s.paperId) === String(p.id)) || {
                                                stance: "silent",
                                                confidence: "low",
                                                quoteExcerpt: "Not addressed in text."
                                            };
                                            const cfg = STANCE_CONFIG[stanceItem.stance] || STANCE_CONFIG.silent;

                                            return (
                                                <td
                                                    key={p.id}
                                                    className="stance-cell"
                                                    onClick={() => setSelectedStance({ claim, paper: p, stanceItem })}
                                                    title="Click to view evidence excerpt"
                                                >
                                                    <div className={`stance-badge ${cfg.badgeClass}`}>
                                                        <span className="stance-icon">{cfg.icon}</span>
                                                        <span className="stance-label">{cfg.label}</span>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Evidence Excerpt Detail Drawer / Modal */}
                    {selectedStance && (
                        <div className="evidence-modal-overlay" onClick={() => setSelectedStance(null)}>
                            <div className="evidence-modal-card" onClick={e => e.stopPropagation()}>
                                <div className="evidence-modal-header">
                                    <div className="evidence-modal-title">
                                        Evidence Excerpt & Grounding
                                    </div>
                                    <button className="evidence-modal-close" onClick={() => setSelectedStance(null)}>✕</button>
                                </div>
                                <div className="evidence-modal-body">
                                    <div className="evidence-claim-block">
                                        <strong>Claim:</strong> "{selectedStance.claim.claimText}"
                                    </div>
                                    <div className="evidence-paper-block">
                                        <strong>Paper:</strong> {selectedStance.paper.title} ({selectedStance.paper.year || "N/A"})
                                    </div>
                                    <div className="evidence-stance-row">
                                        <strong>Stance:</strong>
                                        <span className={`stance-badge ${STANCE_CONFIG[selectedStance.stanceItem.stance]?.badgeClass || "stance-silent"}`}>
                                            {STANCE_CONFIG[selectedStance.stanceItem.stance]?.icon} {STANCE_CONFIG[selectedStance.stanceItem.stance]?.label}
                                        </span>
                                        <span className="confidence-tag">
                                            Confidence: {selectedStance.stanceItem.confidence || "medium"}
                                        </span>
                                    </div>
                                    <div className="evidence-quote-box">
                                        <div className="quote-label">Arbiter Evidence Analysis:</div>
                                        <p className="quote-text">"{selectedStance.stanceItem.quoteExcerpt}"</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
