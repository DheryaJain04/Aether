import { useOutletContext } from 'react-router-dom';
import { useLab } from '../../context/LabContext';
import './CompareTool.css';

const TOOL_LIMIT = 4;

export default function CompareTool() {
    const { bench } = useLab();
    const { setShowAddModal } = useOutletContext();
    const hasPapers = bench.length > 0;
    const activePapers = bench.slice(0, TOOL_LIMIT);

    return (
        <div className='lab-tool-shell'>
            <div className='lab-tool-header'>
                <div className='lab-tool-eyebrow'>Scholar Lab · Tool 02</div>
                <h1 className='lab-tool-title'>⊞ Paper Comparison</h1>
                <p className='lab-tool-desc'>Load 2–4 papers and Aether will build a structured side-by-side comparison — methodology, contributions, key findings, and limitations mapped against each paper.</p>
            </div>

            {!hasPapers ? (
                <div className='lab-needs-bench'>
                    <div className='lab-needs-bench-icon'>⊞</div>
                    <div className='lab-needs-bench-title'>No papers on bench</div>
                    <div className='lab-needs-bench-text'>
                        Add at least 2 papers to your bench to run this tool.
                    </div>
                    <button className='lab-run-btn' onClick={() => setShowAddModal(true)}>
                        <span className='lab-run-btn-icon'>+</span> Add Papers to Bench
                    </button>
                </div>
            ) : (
                <>
                    <div className='tool-action-bar'>
                        <span className='tool-papers-used'>
                            Using <strong>{activePapers.length}</strong>
                            {bench.length > TOOL_LIMIT &&  of } paper{activePapers.length !== 1 ? 's' : ''}
                            {bench.length > TOOL_LIMIT && (
                                <span className='lab-tool-limit-note'>
                                    ⚠ Tool cap: <strong>{TOOL_LIMIT}</strong> papers max
                                </span>
                            )}
                        </span>
                        <button
                            className='lab-run-btn'
                            disabled={bench.length < 2}
                            title={bench.length < 2 ? 'Add at least 2 papers' : 'Run Comparison'}
                        >
                            <span className='lab-run-btn-icon'>✦</span>
                            Run Comparison
                        </button>
                    </div>

                    <div className='lab-tool-output-placeholder'>
                        <div className='lab-tool-output-placeholder-icon'>⊞</div>
                        <div className='lab-tool-output-placeholder-title'>Comparison table will appear here</div>
                        <div className='lab-tool-output-placeholder-text'>Paper Comparison will generate a multi-column structured breakdown of each paper across standardized dimensions. Add 2 to 4 papers to begin.</div>
                    </div>
                </>
            )}
        </div>
    );
}
