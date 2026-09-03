import { useOutletContext } from "react-router-dom";
import { useLab } from "../../context/LabContext";
import "./SynthesisTool.css";

const TOOL_LIMIT = 5;

export default function SynthesisTool() {
    const { bench, addToBench } = useLab();
    const { setShowAddModal } = useOutletContext();
    const hasPapers = bench.length > 0;
    const activePapers = bench.slice(0, TOOL_LIMIT);

    return (
        <div className="lab-tool-shell">
            {/* Tool Header */}
            <div className="lab-tool-header">
                <div className="lab-tool-eyebrow">Scholar Lab · Tool 01</div>
                <h1 className="lab-tool-title">🧬 Literature Synthesis</h1>
                <p className="lab-tool-desc">
                    Select multiple papers on your bench and Aether will generate a structured cross-paper analysis —
                    identifying shared findings, methodology convergence, contradictions, and research trajectory.
                </p>
            </div>

            {/* Bench requirement */}
            {!hasPapers ? (
                <div className="lab-needs-bench">
                    <div className="lab-needs-bench-icon">🧬</div>
                    <div className="lab-needs-bench-title">No papers on bench</div>
                    <div className="lab-needs-bench-text">
                        Add at least 2 papers to your bench to run a synthesis. Use the bench panel in the sidebar.
                    </div>
                    <button className="lab-run-btn" onClick={() => setShowAddModal(true)}>
                        <span className="lab-run-btn-icon">+</span> Add Papers to Bench
                    </button>
                </div>
            ) : (
                <>
                    {/* Action bar */}
                    <div className="synthesis-action-bar">
                        <div className="synthesis-papers-used">
                            Analyzing{" "}
                            <strong>{activePapers.length}</strong>
                            {bench.length > TOOL_LIMIT && ` of ${bench.length}`} paper{activePapers.length !== 1 ? "s" : ""}
                            {bench.length > TOOL_LIMIT && (
                                <span className="lab-tool-limit-note">
                                    ⚠ Tool cap: <strong>{TOOL_LIMIT}</strong> papers max
                                </span>
                            )}
                        </div>
                        <button
                            className="lab-run-btn"
                            disabled={bench.length < 2}
                            title={bench.length < 2 ? "Add at least 2 papers to synthesize" : "Run synthesis"}
                        >
                            <span className="lab-run-btn-icon">✦</span>
                            Run Synthesis
                        </button>
                    </div>

                    {/* Placeholder output */}
                    <div className="lab-tool-output-placeholder">
                        <div className="lab-tool-output-placeholder-icon">🧬</div>
                        <div className="lab-tool-output-placeholder-title">Synthesis output will appear here</div>
                        <div className="lab-tool-output-placeholder-text">
                            The AI engine for this tool is being wired. Hit "Run Synthesis" once the feature is live
                            and Aether will generate a full cross-paper analysis including convergence, conflicts, trajectory, and gaps.
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
