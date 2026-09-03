import { useOutletContext } from "react-router-dom";
import { useLab } from "../../context/LabContext";
import "./GapsTool.css";

const TOOL_LIMIT = 5;

export default function GapsTool() {
    const { bench } = useLab();
    const { setShowAddModal } = useOutletContext();
    const hasPapers = bench.length > 0;

    return (
        <div className="lab-tool-shell">
            {/* Standardized Tool Header with Top-Right Aligned Action Button */}
            <div className="lab-tool-header">
                <div className="lab-tool-header-left">
                    <div className="lab-tool-eyebrow">Scholar Lab · Tool 04</div>
                    <h1 className="lab-tool-title">◎ Research Gap Detector</h1>
                    <p className="lab-tool-desc">
                        Aether reads across your selected papers to surface unexplored areas — identifying what has not been studied, methodological blind spots, and open questions the field has yet to answer.
                    </p>
                </div>
                {hasPapers && (
                    <div className="lab-tool-header-action">
                        <button
                            className="lab-run-btn"
                            disabled={bench.length < 2}
                            title={bench.length < 2 ? "Add at least 2 papers" : "Detect Gaps"}
                        >
                            <span className="lab-run-btn-icon">✦</span>
                            Detect Gaps
                        </button>
                    </div>
                )}
            </div>

            {!hasPapers ? (
                <div className="lab-needs-bench">
                    <div className="lab-needs-bench-icon">◎</div>
                    <div className="lab-needs-bench-title">No papers on bench</div>
                    <div className="lab-needs-bench-text">
                        Add at least 2 papers to your bench to run this tool.
                    </div>
                    <button className="lab-run-btn" onClick={() => setShowAddModal(true)}>
                        <span className="lab-run-btn-icon">+</span> Add Papers to Bench
                    </button>
                </div>
            ) : (
                <div className="lab-tool-output-placeholder">
                    <div className="lab-tool-output-placeholder-icon">◎</div>
                    <div className="lab-tool-output-placeholder-title">Research gaps will appear here</div>
                    <div className="lab-tool-output-placeholder-text">
                        The Gap Detector will identify unexplored research areas, open questions, and methodological blind spots across your selected papers. Add papers to the bench to get started.
                    </div>
                </div>
            )}
        </div>
    );
}

