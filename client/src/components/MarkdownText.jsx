import React from "react";

/**
 * Lightweight, robust markdown formatter for academic AI responses.
 * Parses code blocks, bold/italic, lists, and linebreaks without external libraries.
 */
function formatInline(text) {
    if (!text) return "";
    
    // Split by bold (**text**) or inline code (`code`)
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    
    return parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
            return (
                <code
                    key={i}
                    style={{
                        background: "rgba(0, 0, 0, 0.06)",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontFamily: "monospace",
                        fontSize: "0.9em",
                        color: "#0f172a"
                    }}
                >
                    {part.slice(1, -1)}
                </code>
            );
        }
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
            return <strong key={i} style={{ fontWeight: "700", color: "inherit" }}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
            return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return part;
    });
}

export default function MarkdownText({ content }) {
    if (!content || typeof content !== "string") return null;

    const lines = content.split("\n");
    const elements = [];
    let currentList = [];
    let isNumbered = false;

    function flushList() {
        if (currentList.length > 0) {
            if (isNumbered) {
                elements.push(
                    <ol key={`ol-${elements.length}`} style={{ paddingLeft: "22px", margin: "8px 0" }}>
                        {currentList.map((item, idx) => (
                            <li key={idx} style={{ marginBottom: "4px", lineHeight: "1.6" }}>{formatInline(item)}</li>
                        ))}
                    </ol>
                );
            } else {
                elements.push(
                    <ul key={`ul-${elements.length}`} style={{ paddingLeft: "20px", margin: "8px 0" }}>
                        {currentList.map((item, idx) => (
                            <li key={idx} style={{ marginBottom: "4px", lineHeight: "1.6" }}>{formatInline(item)}</li>
                        ))}
                    </ul>
                );
            }
            currentList = [];
        }
    }

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
            flushList();
            return;
        }

        // Bullet point
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
            if (isNumbered && currentList.length > 0) flushList();
            isNumbered = false;
            currentList.push(trimmed.slice(2));
            return;
        }

        // Numbered list item: e.g. "1. " or "2) "
        const numMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)/);
        if (numMatch) {
            if (!isNumbered && currentList.length > 0) flushList();
            isNumbered = true;
            currentList.push(numMatch[2]);
            return;
        }

        flushList();

        // Section header like ### Title
        if (trimmed.startsWith("### ")) {
            elements.push(
                <h4 key={index} style={{ margin: "14px 0 6px", fontSize: "1.05rem", fontWeight: "700" }}>
                    {formatInline(trimmed.slice(4))}
                </h4>
            );
            return;
        }

        if (trimmed.startsWith("## ")) {
            elements.push(
                <h3 key={index} style={{ margin: "16px 0 8px", fontSize: "1.15rem", fontWeight: "700" }}>
                    {formatInline(trimmed.slice(3))}
                </h3>
            );
            return;
        }

        elements.push(
            <p key={index} style={{ margin: "6px 0", lineHeight: "1.65" }}>
                {formatInline(trimmed)}
            </p>
        );
    });

    flushList();

    return <div className="markdown-content">{elements}</div>;
}
