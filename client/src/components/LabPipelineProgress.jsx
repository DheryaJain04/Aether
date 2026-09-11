import "./LabPipelineProgress.css";

const PIPELINE_STEPS = [
    {
        id: 1,
        agent: "Agent 01",
        stepNum: "01",
        title: "Ingestion & Budget",
        shortTitle: "Ingestion",
        desc: "Sanitizes text & allocates token bounds"
    },
    {
        id: 2,
        agent: "Agent 02",
        stepNum: "02",
        title: "Parallel IR Extraction",
        shortTitle: "IR Extraction",
        desc: "Extracts findings, claims & methodologies"
    },
    {
        id: 3,
        agent: "Agent 03",
        stepNum: "03",
        title: "Cross-Paper Arbiter",
        shortTitle: "Cross Arbiter",
        desc: "Evaluates consensus, divergence & stances"
    },
    {
        id: 4,
        agent: "Agent 04",
        stepNum: "04",
        title: "Grounding & Fact-Check",
        shortTitle: "Grounding",
        desc: "Validates citations & filters hallucinations"
    },
    {
        id: 5,
        agent: "Agent 05",
        stepNum: "05",
        title: "Deterministic Formatter",
        shortTitle: "Formatter",
        desc: "Emits verified visual JSON structure"
    }
];

export default function LabPipelineProgress({
    toolName = "Analysis",
    paperCount = 2,
    activeStep = 1
}) {
    const currentStepObj = PIPELINE_STEPS.find(s => s.id === activeStep) || PIPELINE_STEPS[0];

    return (
        <div className="pipeline-flowchart-card" role="status" aria-live="polite">
            {/* Header / Active Agent Status */}
            <div className="flowchart-header">
                <div className="flowchart-badge">
                    <span className="live-indicator-dot"></span>
                    5-Layer Multi-Agent Relay Pipeline Active
                </div>
                <div className="flowchart-active-title">
                    <span className="flowchart-active-step-tag">Step {currentStepObj.stepNum}</span>
                    <span>{currentStepObj.agent}: {currentStepObj.title}</span>
                </div>
                <div className="flowchart-active-subtitle">
                    {currentStepObj.desc} · Processing {paperCount} papers on bench for {toolName}
                </div>
            </div>

            {/* Glowing Flowchart Pipeline Nodes */}
            <div className="flowchart-track">
                {PIPELINE_STEPS.map((step, index) => {
                    const isCompleted = activeStep > step.id;
                    const isActive = activeStep === step.id;
                    const isPending = activeStep < step.id;

                    const statusClass = isCompleted
                        ? "step-completed"
                        : isActive
                        ? "step-active"
                        : "step-pending";

                    return (
                        <div key={step.id} className="flowchart-node-wrapper">
                            {/* Step Card */}
                            <div className={`flowchart-node ${statusClass}`}>
                                <div className="node-glow-ring"></div>
                                <div className="node-header">
                                    <span className="node-step-circle">{step.stepNum}</span>
                                    <span className="node-status-badge">
                                        {isCompleted && "Completed"}
                                        {isActive && (
                                            <>
                                                <span className="node-active-pulse"></span>
                                                Working
                                            </>
                                        )}
                                        {isPending && "Pending"}
                                    </span>
                                </div>
                                <div className="node-title-row">
                                    <div className="node-agent-name">{step.agent}</div>
                                    <div className="node-title">{step.title}</div>
                                </div>
                                <div className="node-desc">{step.desc}</div>
                            </div>

                            {/* Connecting Line between nodes */}
                            {index < PIPELINE_STEPS.length - 1 && (
                                <div className={`flowchart-connector ${activeStep > index + 1 ? "connector-passed" : activeStep === index + 1 ? "connector-active" : "connector-pending"}`}>
                                    <div className="connector-line">
                                        <div className="connector-beam"></div>
                                    </div>
                                    <div className="connector-arrow">›</div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
