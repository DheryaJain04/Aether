import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useLab } from "../../context/LabContext";
import { runGaps } from "../../services/api";
import LabPipelineProgress from "../../components/LabPipelineProgress";
import "./GapsTool.css";

const TOOL_LIMIT = 5;

export default function GapsTool() {
    const { bench, getToolResult, setToolResult, isToolStale } = useLab();
    const { setShowAddModal } = useOutletContext();
    const [loading, setLoading] = useState(false);
    const [activeStep, setActiveStep] = useState(1);
    const [error, setError] = useState("");
    const result = getToolResult("gaps");
    const stale = isToolStale("gaps");

    const hasPapers = bench.length > 0;
    const canRun = bench.length >= 2;

    async function handleRunGaps() {
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
            const data = await runGaps(stagedPapers);
            setToolResult("gaps", { ...data.data, evaluatedPapers: stagedPapers }, stagedPapers.map(p => p.id));
        } catch (err) {
            setError(err.message || "Failed to detect research gaps.");
        } finally {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
            setLoading(false);
            setActiveStep(1);
        }
    }

    function getPaperTitle(paperId) {
        const found = bench.find(p => String(p.id) === String(paperId));
        return found ? found.title : paperId;
    }

    return (
        <div className="lab-tool-shell">
            <div className="lab-tool-header">
                <div className="lab-tool-header-left">
                    <div className="lab-tool-eyebrow">Scholar Lab · Multi-Agent Cognitive Tool 04</div>
                    <h1 className="lab-tool-title">◎ Research Gap Detector</h1>
                    <p className="lab-tool-desc">
                        A multi-agent gap analysis identifying what remains unexplored across your staged literature —
                        methodological blindspots, evaluation flaws, and novel open questions.
                    </p>
                </div>
                {hasPapers && (
                    <div className="lab-tool-header-action">
                        {stale && (
                            <div className="lab-bench-stale-pill" title="Bench papers changed since these gaps were generated">
                                <span className="stale-dot"></span>
                                Bench modified
                            </div>
                        )}
                        <button
                            className={`lab-run-btn${stale ? " stale-highlight" : ""}`}
                            disabled={!canRun || loading}
                            onClick={handleRunGaps}
                            title={!canRun ? "Add at least 2 papers" : stale ? "Re-run detection with updated bench papers" : "Detect Research Gaps"}
                        >
                            <span className="lab-run-btn-icon">{loading ? "◌" : stale ? "↻" : "◎"}</span>
                            {loading ? "Detecting Gaps..." : stale ? "Re-run Detection" : (result ? "Re-run Detection" : "Detect Gaps")}
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
                    <div className="lab-needs-bench-icon">◎</div>
                    <div className="lab-needs-bench-title">No papers on bench</div>
                    <div className="lab-needs-bench-text">
                        Add at least 2 papers to your bench to detect unexplored research gaps and blindspots.
                    </div>
                    <button className="lab-run-btn" onClick={() => setShowAddModal(true)}>
                        <span className="lab-run-btn-icon">+</span> Add Papers to Bench
                    </button>
                </div>
            ) : loading ? (
                <LabPipelineProgress
                    toolName="Research Gap Detector"
                    paperCount={Math.min(bench.length, TOOL_LIMIT)}
                    activeStep={activeStep}
                />
            ) : !result ? (
                <div className="lab-tool-output-placeholder">
                    <div className="lab-tool-output-placeholder-icon">◎</div>
                    <div className="lab-tool-output-placeholder-title">Ready to Detect Gaps Across {bench.length} Papers</div>
                    <div className="lab-tool-output-placeholder-text">
                        Click "Detect Gaps" above. Aether's 5-agent pipeline will surface methodological vulnerabilities,
                        unaddressed assumptions, and generate actionable future research directions.
                    </div>
                </div>
            ) : (
                <div className="gaps-results-container">
                    {/* Novel Research Questions (Hero Section) */}
                    {result.novelResearchQuestions && result.novelResearchQuestions.length > 0 && (
                        <div className="synthesis-section gaps-hero-section">
                            <div className="gap-section-header">
                                <span className="gap-category-indicator questions"></span>
                                <h3 className="synthesis-section-title questions-title">
                                    High-Impact Novel Research Questions
                                </h3>
                                <span className="gap-count-badge questions-badge">
                                    {result.novelResearchQuestions.length} Inquiries
                                </span>
                            </div>
                            <div className="gaps-questions-grid">
                                {result.novelResearchQuestions.map((q, idx) => (
                                    <div key={idx} className="question-card">
                                        <div className="question-badge">Research Inquiry 0{idx + 1}</div>
                                        <h4 className="question-title">"{q.question}"</h4>
                                        <p className="question-rationale">
                                            <strong>Rationale:</strong> {q.rationale}
                                        </p>
                                        <div className="question-method">
                                            <strong>Suggested Method:</strong> {q.suggestedMethod}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Methodological Gaps */}
                    {result.methodologicalGaps && result.methodologicalGaps.length > 0 && (
                        <div className="synthesis-section gap-category-section methodological-section">
                            <div className="gap-section-header">
                                <span className="gap-category-indicator methodological"></span>
                                <h3 className="synthesis-section-title methodological-title">
                                    Methodological & Architectural Gaps
                                </h3>
                                <span className="gap-count-badge methodological-badge">
                                    {result.methodologicalGaps.length} Gaps
                                </span>
                            </div>
                            <div className="gaps-cards-list">
                                {result.methodologicalGaps.map((gap, idx) => (
                                    <div key={idx} className="gap-detail-card methodological-card">
                                        <h4 className="gap-card-title">{gap.gap}</h4>
                                        <p className="gap-explanation">{gap.explanation}</p>
                                        <div className="gap-proposed-approach">
                                            <strong>Proposed Solution / Approach:</strong> {gap.proposedApproach}
                                        </div>
                                        {gap.affectedPapers && gap.affectedPapers.length > 0 && (
                                            <div className="gap-papers-row">
                                                <span className="gap-papers-label">Present in:</span>
                                                {gap.affectedPapers.map(pid => (
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

                    {/* Data & Evaluation Gaps */}
                    {result.dataEvaluationGaps && result.dataEvaluationGaps.length > 0 && (
                        <div className="synthesis-section gap-category-section data-section">
                            <div className="gap-section-header">
                                <span className="gap-category-indicator data"></span>
                                <h3 className="synthesis-section-title data-title">
                                    Data, Benchmark & Evaluation Blindspots
                                </h3>
                                <span className="gap-count-badge data-badge">
                                    {result.dataEvaluationGaps.length} Gaps
                                </span>
                            </div>
                            <div className="gaps-cards-list">
                                {result.dataEvaluationGaps.map((gap, idx) => (
                                    <div key={idx} className="gap-detail-card data-card">
                                        <h4 className="gap-card-title">{gap.gap}</h4>
                                        <p className="gap-explanation">{gap.explanation}</p>
                                        <div className="gap-proposed-approach">
                                            <strong>Recommended Evaluation Protocol:</strong> {gap.proposedApproach}
                                        </div>
                                        {gap.affectedPapers && gap.affectedPapers.length > 0 && (
                                            <div className="gap-papers-row">
                                                <span className="gap-papers-label">Observed across:</span>
                                                {gap.affectedPapers.map(pid => (
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

                    {/* Theoretical Blindspots */}
                    {result.theoreticalBlindspots && result.theoreticalBlindspots.length > 0 && (
                        <div className="synthesis-section gap-category-section theoretical-section">
                            <div className="gap-section-header">
                                <span className="gap-category-indicator theoretical"></span>
                                <h3 className="synthesis-section-title theoretical-title">
                                    Theoretical & Foundational Blindspots
                                </h3>
                                <span className="gap-count-badge theoretical-badge">
                                    {result.theoreticalBlindspots.length} Gaps
                                </span>
                            </div>
                            <div className="gaps-cards-list">
                                {result.theoreticalBlindspots.map((gap, idx) => (
                                    <div key={idx} className="gap-detail-card theoretical-card">
                                        <h4 className="gap-card-title">{gap.gap}</h4>
                                        <p className="gap-explanation">{gap.explanation}</p>
                                        <div className="gap-proposed-approach">
                                            <strong>Theoretical Opportunity:</strong> {gap.proposedApproach}
                                        </div>
                                        {gap.affectedPapers && gap.affectedPapers.length > 0 && (
                                            <div className="gap-papers-row">
                                                <span className="gap-papers-label">Identified in:</span>
                                                {gap.affectedPapers.map(pid => (
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
                </div>
            )}
        </div>
    );
}
