import { useOutletContext } from 'react-router-dom';
import { useLab } from '../../context/LabContext';
import './MatrixTool.css';

const TOOL_LIMIT = 6;

export default function MatrixTool() {
    const { bench } = useLab();
    const { setShowAddModal } = useOutletContext();
    const hasPapers = bench.length > 0;
    const activePapers = bench.slice(0, TOOL_LIMIT);

    return (
        <div className='lab-tool-shell'>
            <div className='lab-tool-header'>
                <div className='lab-tool-eyebrow'>Scholar Lab · Tool 03</div>
                <h1 className='lab-tool-title'>≡ Evidence Matrix</h1>
                <p className='lab-tool-desc'>Build an evidence matrix across your selected papers — map specific claims, hypotheses, or research questions against paper evidence, methodology, and conclusions.</p>
            </div>

            {!hasPapers ? (
                <div className='lab-needs-bench'>
                    <div className='lab-needs-bench-icon'>≡</div>
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
                            title={bench.length < 2 ? 'Add at least 2 papers' : 'Build Matrix'}
                        >
                            <span className='lab-run-btn-icon'>✦</span>
                            Build Matrix
                        </button>
                    </div>

                    <div className='lab-tool-output-placeholder'>
                        <div className='lab-tool-output-placeholder-icon'>≡</div>
                        <div className='lab-tool-output-placeholder-title'>Evidence matrix will appear here</div>
                        <div className='lab-tool-output-placeholder-text'>The Evidence Matrix will render a tabular grid of research claims versus paper evidence. Add papers and define your research questions to populate the matrix.</div>
                    </div>
                </>
            )}
        </div>
    );
}
