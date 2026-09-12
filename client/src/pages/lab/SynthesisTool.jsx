import { useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { useLab } from "../../context/LabContext";
import { runSynthesis } from "../../services/api";
import LabPipelineProgress from "../../components/LabPipelineProgress";
import "./SynthesisTool.css";

const TOOL_LIMIT = 5;

export default function SynthesisTool() {
    const { bench, getToolResult, setToolResult, isToolStale } = useLab();
    const { setShowAddModal } = useOutletContext();
    const [loading, setLoading] = useState(false);
    const [activeStep, setActiveStep] = useState(1);
    const [error, setError] = useState("");
    const result = getToolResult("synthesis");
    const stale = isToolStale("synthesis");

    const hasPapers = bench.length > 0;
    const canRun = bench.length >= 2;

    async function handleRunSynthesis() {
        if (!canRun) return;
        setError("");
        setLoading(true);
        setActiveStep(1);

        const t1 = setTimeout(() => setActiveStep(2), 1200);
        const t2 = setTimeout(() => setActiveStep(3), 3200);
        const t3 = setTimeout(() => setActiveStep(4), 5800);
        const t4 = setTimeout(() => setActiveStep(5), 7800);

        try {
            const stagedPapers = bench.slice(0, TOOL_LIMIT);
            const data = await runSynthesis(stagedPapers);
            setToolResult("synthesis", { ...data.data, evaluatedPapers: stagedPapers }, stagedPapers.map(p => p.id));
        } catch (err) {
            setError(err.message || "Failed to complete literature synthesis.");
        } finally {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
            setLoading(false);
            setActiveStep(1);
        }
    }

    // Helper to find title of paper by ID
    function getPaperTitle(paperId) {
        const found = bench.find(p => String(p.id) === String(paperId));
        return found ? found.title : paperId;
    }

    const evaluatedPapers = result?.evaluatedPapers || bench.slice(0, TOOL_LIMIT);

    return (
        <div className="lab-tool-shell">
            {/* Standardized Tool Header with Top-Right Aligned Action Button */}
            <div className="lab-tool-header">
                <div className="lab-tool-header-left">
                    <div className="lab-tool-eyebrow">Scholar Lab · Multi-Agent Cognitive Tool 01</div>
                    <h1 className="lab-tool-title">✦ Literature Synthesis</h1>
                    <p className="lab-tool-desc">
                        A 5-agent sequential cognitive pipeline evaluates your staged papers to extract shared findings,
                        methodology convergence, points of contradiction, and overarching field trajectories.
                    </p>
                </div>
                {hasPapers && (
                    <div className="lab-tool-header-action">
                        {stale && (
                            <div className="lab-bench-stale-pill" title="Bench papers changed since this synthesis was generated">
                                <span className="stale-dot"></span>
                                Bench modified
                            </div>
                        )}
                        <button
                            className={`lab-run-btn${stale ? " stale-highlight" : ""}`}
                            disabled={!canRun || loading}
                            onClick={handleRunSynthesis}
                            title={!canRun ? "Add at least 2 papers to synthesize" : stale ? "Re-run synthesis with updated bench papers" : "Run Multi-Agent Synthesis"}
                        >
                            <span className="lab-run-btn-icon">{loading ? "◌" : stale ? "↻" : "✦"}</span>
                            {loading ? "Synthesizing..." : stale ? "Re-run Synthesis" : (result ? "Re-run Synthesis" : "Run Synthesis")}
                        </button>
                    </div>
                )}
            </div>

            {/* Error Banner */}
            {error && (
                <div className="lab-tool-error-banner">
                    <span className="error-icon">⚠️</span> {error}
                </div>
            )}

            {/* Bench requirement notice */}
            {!hasPapers ? (
                <div className="lab-needs-bench">
                    <div className="lab-needs-bench-icon">✦</div>
                    <div className="lab-needs-bench-title">No papers on bench</div>
                    <div className="lab-needs-bench-text">
                        Add at least 2 papers to your bench to run a multi-agent literature synthesis.
                    </div>
                    <button className="lab-run-btn" onClick={() => setShowAddModal(true)}>
                        <span className="lab-run-btn-icon">+</span> Add Papers to Bench
                    </button>
                </div>
            ) : loading ? (
                /* Dynamic Lighting Flowchart Progress */
                <LabPipelineProgress
                    toolName="Literature Synthesis"
                    paperCount={Math.min(bench.length, TOOL_LIMIT)}
                    activeStep={activeStep}
                />
            ) : !result ? (
                /* Output Area Placeholder */
                <div className="lab-tool-output-placeholder">
                    <div className="lab-tool-output-placeholder-icon">✦</div>
                    <div className="lab-tool-output-placeholder-title">Ready to Synthesize {bench.length} Papers</div>
                    <div className="lab-tool-output-placeholder-text">
                        Click "Run Synthesis" above. Aether's 5-agent pipeline will extract Intermediate Representations,
                        identify empirical convergences, detect methodological disputes, and synthesize future trajectories.
                    </div>
                </div>
            ) : (
                /* Rich Agentic Synthesis Output */
                <div className="synthesis-results-container">
                    <div className="synthesis-header-block">
                        <div className="synthesis-eyebrow">Aether Multi-Agent Meta-Analysis</div>
                        <h2 className="synthesis-main-title">{result.title || "Cross-Paper Literature Synthesis"}</h2>
                        <div className="synthesis-papers-pills">
                            <span className="pills-label">Corpus Analyzed:</span>
                            {evaluatedPapers.map(p => (
                                <span key={p.id} className="corpus-paper-pill" title={p.title}>
                                    {p.title} ({p.year || "N/A"})
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Executive Summary */}
                    <div className="synthesis-section">
                        <h3 className="synthesis-section-title">
                            Executive Summary
                        </h3>
                        <div className="synthesis-executive-text">
                            {result.executiveSummary}
                        </div>
                    </div>

                    {/* Key Themes & Paradigms */}
                    {result.keyThemes && result.keyThemes.length > 0 && (
                        <div className="synthesis-section">
                            <h3 className="synthesis-section-title">
                                Key Themes & Methodological Paradigms
                            </h3>
                            <div className="synthesis-themes-grid">
                                {result.keyThemes.map((theme, idx) => (
                                    <div key={idx} className="synthesis-theme-card">
                                        <div className="theme-card-header">
                                            <span className="theme-number">Theme 0{idx + 1}</span>
                                            <h4 className="theme-title">{theme.theme}</h4>
                                        </div>
                                        <p className="theme-desc">{theme.description}</p>
                                        <div className="theme-methodology">
                                            <strong>Approach:</strong> {theme.methodologicalApproach}
                                        </div>
                                        {theme.papersSupported && theme.papersSupported.length > 0 && (
                                            <div className="theme-papers-row">
                                                <span className="theme-papers-label">Supported by:</span>
                                                {theme.papersSupported.map(pid => (
                                                    <span key={pid} className="citation-pill" title={getPaperTitle(pid)}>
                                                        {getPaperTitle(pid)}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Points of Convergence */}
                    {result.pointsOfConvergence && result.pointsOfConvergence.length > 0 && (
                        <div className="synthesis-section">
                            <h3 className="synthesis-section-title">
                                Points of Convergence (Consensus)
                            </h3>
                            <div className="synthesis-convergence-list">
                                {result.pointsOfConvergence.map((item, idx) => (
                                    <div key={idx} className="convergence-card">
                                        <div className="convergence-title">✓ {item.finding}</div>
                                        <p className="convergence-evidence">{item.evidence}</p>
                                        <div className="convergence-papers">
                                            <span className="papers-label">Consensus across:</span>
                                            {item.papers?.map(pid => (
                                                <span key={pid} className="citation-pill" title={getPaperTitle(pid)}>
                                                    {getPaperTitle(pid)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Points of Contradiction / Methodological Divergence */}
                    {result.pointsOfContradiction && result.pointsOfContradiction.length > 0 && (
                        <div className="synthesis-section">
                            <h3 className="synthesis-section-title">
                                Contradictions & Methodological Divergence
                            </h3>
                            <div className="synthesis-contradictions-list">
                                {result.pointsOfContradiction.map((item, idx) => (
                                    <div key={idx} className="contradiction-card">
                                        <div className="contradiction-dispute">{item.dispute}</div>
                                        <div className="contradiction-viewpoints-grid">
                                            <div className="viewpoint-box viewpoint-a">
                                                <div className="viewpoint-tag">Perspective A</div>
                                                <div className="viewpoint-paper">{getPaperTitle(item.viewpointA?.paperId)}</div>
                                                <p className="viewpoint-stance">"{item.viewpointA?.stance}"</p>
                                            </div>
                                            <div className="viewpoint-box viewpoint-b">
                                                <div className="viewpoint-tag">Perspective B</div>
                                                <div className="viewpoint-paper">{getPaperTitle(item.viewpointB?.paperId)}</div>
                                                <p className="viewpoint-stance">"{item.viewpointB?.stance}"</p>
                                            </div>
                                        </div>
                                        {item.underlyingReason && (
                                            <div className="contradiction-reason">
                                                <strong>Underlying Driver of Divergence:</strong> {item.underlyingReason}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Future Research Trajectory */}
                    {result.futureTrajectory && (
                        <div className="synthesis-section trajectory-section">
                            <h3 className="synthesis-section-title">
                                Future Research Trajectory & Open Horizons
                            </h3>
                            <div className="trajectory-content">
                                {result.futureTrajectory}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
