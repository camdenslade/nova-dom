// src/Panels/ExportPanel.tsx
import { useState } from "react";
import { useEditorStore } from "../Editor/EditorState.ts";
import { exportToHtml } from "../Export/exportHtml.ts";
import { exportToReact } from "../Export/exportReact.ts";
import type { ExportOptions } from "../Export/exportHtml.ts";

const tabStyle: React.CSSProperties = {
    padding: "6px 16px",
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 500,
    borderRadius: "4px 4px 0 0",
};

const codeStyle: React.CSSProperties = {
    width: "100%",
    height: "300px",
    backgroundColor: "#1a1a1a",
    color: "#e0e0e0",
    border: "1px solid #444",
    borderRadius: "4px",
    padding: "12px",
    fontSize: "12px",
    fontFamily: "monospace",
    resize: "vertical",
    boxSizing: "border-box",
};

export function ExportPanel({ onClose }: { onClose: () => void }) {
    const tree = useEditorStore((s) => s.documentTree);
    const [tab, setTab] = useState<"html" | "react">("html");
    const [options, setOptions] = useState<ExportOptions>({
        cssMode: "inline",
        includeReset: false,
        prettyPrint: true,
    });
    const [copied, setCopied] = useState(false);

    const result = tab === "html"
        ? exportToHtml(tree, options)
        : { html: exportToReact(tree), css: "" };

    const code = tab === "html" ? result.html : result.html;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const ext = tab === "html" ? "html" : "tsx";
        const blob = new Blob([code], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `nova-export.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 20000,
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: 640,
                    maxHeight: "80vh",
                    backgroundColor: "#2b2b2b",
                    borderRadius: "8px",
                    border: "1px solid #444",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #444" }}>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>Export</span>
                    <button
                        onClick={onClose}
                        style={{
                            marginLeft: "auto",
                            background: "none",
                            border: "none",
                            color: "#888",
                            fontSize: "18px",
                            cursor: "pointer",
                            padding: "0 4px",
                        }}
                    >
                        x
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: 4, padding: "8px 16px 0" }}>
                    <button
                        onClick={() => setTab("html")}
                        style={{
                            ...tabStyle,
                            backgroundColor: tab === "html" ? "#3a3a3a" : "transparent",
                            color: tab === "html" ? "#fff" : "#888",
                        }}
                    >
                        HTML
                    </button>
                    <button
                        onClick={() => setTab("react")}
                        style={{
                            ...tabStyle,
                            backgroundColor: tab === "react" ? "#3a3a3a" : "transparent",
                            color: tab === "react" ? "#fff" : "#888",
                        }}
                    >
                        React
                    </button>
                </div>

                {/* Options (HTML only) */}
                {tab === "html" && (
                    <div style={{ display: "flex", gap: 16, padding: "8px 16px", fontSize: "11px", color: "#aaa" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                            <input
                                type="checkbox"
                                checked={options.cssMode === "classes"}
                                onChange={(e) => setOptions({ ...options, cssMode: e.target.checked ? "classes" : "inline" })}
                            />
                            CSS Classes
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                            <input
                                type="checkbox"
                                checked={options.includeReset}
                                onChange={(e) => setOptions({ ...options, includeReset: e.target.checked })}
                            />
                            Include Reset
                        </label>
                    </div>
                )}

                {/* Code Preview */}
                <div style={{ padding: "8px 16px" }}>
                    <textarea readOnly value={code} style={codeStyle} />
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, padding: "8px 16px 16px", justifyContent: "flex-end" }}>
                    <button
                        onClick={handleCopy}
                        style={{
                            padding: "6px 16px",
                            backgroundColor: copied ? "#2ecc40" : "#0d99ff",
                            border: "none",
                            borderRadius: "4px",
                            color: "#fff",
                            fontSize: "12px",
                            cursor: "pointer",
                        }}
                    >
                        {copied ? "Copied!" : "Copy"}
                    </button>
                    <button
                        onClick={handleDownload}
                        style={{
                            padding: "6px 16px",
                            backgroundColor: "#3a3a3a",
                            border: "1px solid #555",
                            borderRadius: "4px",
                            color: "#ccc",
                            fontSize: "12px",
                            cursor: "pointer",
                        }}
                    >
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
}
