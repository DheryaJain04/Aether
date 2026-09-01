import { useState } from "react";
import { RANKING_MODES } from "../utils/scoring";
import "./RankingToolbar.css";

function balanceWeights(changedDim, newValue, currentWeights) {
    const clampedNew = Math.max(0, Math.min(100, Math.round(Number(newValue) / 5) * 5));
    const otherKeys = ["relevance", "freshness", "impact", "venue"].filter(k => k !== changedDim);
    const targetRemaining = 100 - clampedNew;

    const currentOtherSum = otherKeys.reduce((sum, k) => sum + (currentWeights[k] || 0), 0);
    const next = { ...currentWeights, [changedDim]: clampedNew };

    if (currentOtherSum > 0) {
        let assigned = 0;
        otherKeys.forEach((k, idx) => {
            if (idx === otherKeys.length - 1) {
                // Last key takes exact remainder to ensure sum === 100
                next[k] = Math.max(0, targetRemaining - assigned);
            } else {
                const ratio = currentWeights[k] / currentOtherSum;
                const share = Math.max(0, Math.round((ratio * targetRemaining) / 5) * 5);
                next[k] = share;
                assigned += share;
            }
        });
        // Guarantee exact sum of 100 in case of rounding
        const currentTotal = clampedNew + otherKeys.reduce((sum, k) => sum + next[k], 0);
        if (currentTotal !== 100) {
            next[otherKeys[otherKeys.length - 1]] = Math.max(0, next[otherKeys[otherKeys.length - 1]] + (100 - currentTotal));
        }
    } else {
        const each = Math.floor(targetRemaining / otherKeys.length / 5) * 5;
        let assigned = 0;
        otherKeys.forEach((k, idx) => {
            if (idx === otherKeys.length - 1) {
                next[k] = Math.max(0, targetRemaining - assigned);
            } else {
                next[k] = each;
                assigned += each;
            }
        });
    }

    return next;
}

export default function RankingToolbar({
    activeMode,
    weights,
    onModeChange,
    onWeightsChange
}) {
    const [showCustom, setShowCustom] = useState(activeMode === "custom");

    function handleSelectMode(modeId) {
        if (modeId === "custom") {
            setShowCustom(true);
            onModeChange("custom");
        } else {
            setShowCustom(false);
            onModeChange(modeId);
            onWeightsChange(RANKING_MODES[modeId].weights);
        }
    }

    function handleSliderChange(dimension, value) {
        const balanced = balanceWeights(dimension, value, weights);
        onWeightsChange(balanced);
        if (activeMode !== "custom") {
            onModeChange("custom");
            setShowCustom(true);
        }
    }

    function handleEqualWeights() {
        onWeightsChange({ relevance: 25, freshness: 25, impact: 25, venue: 25 });
        onModeChange("custom");
    }

    function handleResetToBalanced() {
        onModeChange("balanced");
        onWeightsChange(RANKING_MODES.balanced.weights);
        setShowCustom(false);
    }

    const currentDescription =
        activeMode === "custom"
            ? "Custom Scholar Weighting: Weights auto-balance proportionally so the total always equals 100%."
            : RANKING_MODES[activeMode]?.description || "";

    const totalWeight =
        (weights.relevance || 0) +
        (weights.freshness || 0) +
        (weights.impact || 0) +
        (weights.venue || 0);

    return (
        <section className="ranking-toolbar-card" aria-label="Ranking Modes & Scoring Priorities">
            <div className="ranking-toolbar-top">
                <div className="ranking-label-group">
                    <span className="ranking-section-title">PRIORITIZE:</span>
                    <span className="ranking-active-desc">{currentDescription}</span>
                </div>

                <div className="ranking-mode-pills" role="tablist">
                    {Object.values(RANKING_MODES).map((mode) => {
                        const isSelected = activeMode === mode.id;
                        return (
                            <button
                                key={mode.id}
                                type="button"
                                role="tab"
                                aria-selected={isSelected}
                                className={`ranking-pill-btn ${isSelected ? "is-active" : ""}`}
                                onClick={() => handleSelectMode(mode.id)}
                            >
                                <span className="pill-icon">{mode.icon}</span>
                                <span className="pill-label">{mode.label}</span>
                            </button>
                        );
                    })}

                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeMode === "custom"}
                        className={`ranking-pill-btn ${activeMode === "custom" ? "is-active custom-active" : ""}`}
                        onClick={() => handleSelectMode("custom")}
                    >
                        <span className="pill-icon">🎛️</span>
                        <span className="pill-label">Custom</span>
                    </button>
                </div>
            </div>

            {/* EXPANDABLE CUSTOM AUTO-BALANCING SLIDERS DRAWER */}
            {showCustom && (
                <div className="custom-weights-drawer">
                    <div className="custom-weights-header">
                        <div className="custom-header-info">
                            <h4>Proportional Weight Balancing</h4>
                            <div className="total-weight-pill">
                                Total: <strong>{totalWeight}%</strong>
                                <span className="total-check">✓ strictly balanced</span>
                            </div>
                        </div>

                        <div className="custom-header-actions">
                            <button
                                type="button"
                                className="quick-preset-btn"
                                onClick={handleEqualWeights}
                                title="Set all four categories to 25%"
                            >
                                Equal 25% Each
                            </button>
                            <button
                                type="button"
                                className="reset-weights-btn"
                                onClick={handleResetToBalanced}
                            >
                                Reset to Balanced
                            </button>
                        </div>
                    </div>

                    {/* Proportional Segmented Progress Bar */}
                    <div className="total-bar-track" title="Total weight allocation">
                        <div className="total-seg seg-rel" style={{ width: `${weights.relevance}%` }}></div>
                        <div className="total-seg seg-fre" style={{ width: `${weights.freshness}%` }}></div>
                        <div className="total-seg seg-imp" style={{ width: `${weights.impact}%` }}></div>
                        <div className="total-seg seg-ven" style={{ width: `${weights.venue}%` }}></div>
                    </div>

                    <div className="sliders-grid">
                        <div className="slider-item">
                            <div className="slider-label-row">
                                <span className="dim-name name-rel">🎯 Relevance</span>
                                <strong className="dim-val">{weights.relevance}%</strong>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={weights.relevance}
                                onChange={(e) => handleSliderChange("relevance", e.target.value)}
                                className="weight-range-slider slider-rel"
                            />
                        </div>

                        <div className="slider-item">
                            <div className="slider-label-row">
                                <span className="dim-name name-fre">⚡ Freshness</span>
                                <strong className="dim-val">{weights.freshness}%</strong>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={weights.freshness}
                                onChange={(e) => handleSliderChange("freshness", e.target.value)}
                                className="weight-range-slider slider-fre"
                            />
                        </div>

                        <div className="slider-item">
                            <div className="slider-label-row">
                                <span className="dim-name name-imp">🏆 Impact (Citations)</span>
                                <strong className="dim-val">{weights.impact}%</strong>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={weights.impact}
                                onChange={(e) => handleSliderChange("impact", e.target.value)}
                                className="weight-range-slider slider-imp"
                            />
                        </div>

                        <div className="slider-item">
                            <div className="slider-label-row">
                                <span className="dim-name name-ven">🏛️ Venue Authority</span>
                                <strong className="dim-val">{weights.venue}%</strong>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={weights.venue}
                                onChange={(e) => handleSliderChange("venue", e.target.value)}
                                className="weight-range-slider slider-ven"
                            />
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
