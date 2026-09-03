import { useOutletContext } from "react-router-dom";
import { useLab } from "../../context/LabContext";
import "./SynthesisTool.css";

const TOOL_LIMIT = 5;

export default function SynthesisTool() {
    const { bench } = useLab();
    const { setShowAddModal } = useOutletContext();
    const hasPapers = bench.length > 0;

    return (
        <div className="lab-tool-shell">
            {/* Standardized Tool Header with Top-Right Aligned Action Button */}
            <div className="lab-tool-header">
                <div className="lab-tool-header-left">
                    <div className="lab-tool-eyebrow">Scholar Lab · Tool 01</div>
                    <h1 className="lab-tool-title">✦ Literature Synthesis</h1>
                    <p className="lab-tool-desc">
                        Select multiple papers on your bench and Aether will generate a structured cross-paper analysis —
                        identifying shared findings, methodology convergence, contradictions, and research trajectory.
                    </p>
                </div>
                {hasPapers && (
                    <div className="lab-tool-header-action">
                        <button
                            className="lab-run-btn"
                            disabled={bench.length < 2}
                            title={bench.length < 2 ? "Add at least 2 papers to synthesize" : "Run Synthesis"}
                        >
                            <span className="lab-run-btn-icon">✦</span>
                            Run Synthesis
                        </button>
                    </div>
                )}
            </div>

            {/* Bench requirement */}
            {!hasPapers ? (
                <div className="lab-needs-bench">
                    <div className="lab-needs-bench-icon">✦</div>
                    <div className="lab-needs-bench-title">No papers on bench</div>
                    <div className="lab-needs-bench-text">
                        Add at least 2 papers to your bench to run a synthesis. Use the bench panel in the sidebar.
                    </div>
                    <button className="lab-run-btn" onClick={() => setShowAddModal(true)}>
                        <span className="lab-run-btn-icon">+</span> Add Papers to Bench
                    </button>
                </div>
            ) : (
                /* Output Area */
                <div className="lab-tool-output-placeholder">
                    <div className="lab-tool-output-placeholder-icon">✦</div>
                    <div className="lab-tool-output-placeholder-title">Synthesis output will appear here</div>
                    <div className="lab-tool-output-placeholder-text">
                        The AI engine for this tool is being wired. Hit "Run Synthesis" once the feature is live
                        and Aether will generate a full cross-paper analysis including convergence, conflicts, trajectory, and gaps.
                    </div>
                </div>
            )}
        </div>
    );
}

