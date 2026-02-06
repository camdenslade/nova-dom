// src/Renderer/DimensionsPanel.tsx
import { useState } from "react";
import { useEditorStore } from "../Editor/EditorState.ts";
import { useElementRegistry } from "./hooks/useElementRegistry.ts";
import type { AnyNode } from "../Schema/Node.ts";

const labelStyle: React.CSSProperties = {
    fontSize: "10px",
    color: "#888",
    marginBottom: "2px",
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "4px 6px",
    backgroundColor: "#3a3a3a",
    border: "1px solid #555",
    borderRadius: "3px",
    color: "#fff",
    fontSize: "12px",
    boxSizing: "border-box",
};

export function DimensionsPanel() {
    const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
    const node = useEditorStore((s) =>
        s.selectedNodeId ? s.documentTree.nodes[s.selectedNodeId] : null
    );
    const getElement = useElementRegistry((s) => s.getElement);
    const [state, setState] = useState({ w: "", h: "", x: "", y: "", prevNode: node });

    // Sync from props when node changes (React-recommended derived state pattern)
    if (node !== state.prevNode) {
        if (selectedNodeId && node) {
            const el = getElement(selectedNodeId);
            const style = node.props.style || {};
            const rect = el?.getBoundingClientRect();
            setState({
                w: (style.width as string) ?? `${Math.round(rect?.width ?? 0)}px`,
                h: (style.height as string) ?? `${Math.round(rect?.height ?? 0)}px`,
                x: (style.left as string) ?? "0px",
                y: (style.top as string) ?? "0px",
                prevNode: node,
            });
        } else {
            setState({ w: "", h: "", x: "", y: "", prevNode: node });
        }
    }

    const values = { w: state.w, h: state.h, x: state.x, y: state.y };

    if (!node || !selectedNodeId) return null;

    const updateStyle = (key: string, value: string) => {
        useEditorStore.getState().dispatch({
            type: "UPDATE_NODE",
            payload: {
                ...node,
                props: {
                    ...node.props,
                    style: { ...node.props.style, [key]: value },
                },
            } as AnyNode,
        });
    };

    const handleChange = (field: "w" | "h" | "x" | "y", value: string) => {
        setState((prev) => ({ ...prev, [field]: value }));
    };

    const handleBlur = (field: "w" | "h" | "x" | "y") => {
        const val = values[field];
        const styleKey = { w: "width", h: "height", x: "left", y: "top" }[field];
        const normalized = /^\d+$/.test(val) ? `${val}px` : val;
        updateStyle(styleKey, normalized);
    };

    const handleKeyDown = (e: React.KeyboardEvent, field: "w" | "h" | "x" | "y") => {
        if (e.key === "Enter") handleBlur(field);
    };

    return (
        <div
            style={{
                position: "absolute",
                top: 12,
                right: 12,
                backgroundColor: "#2b2b2b",
                border: "1px solid #444",
                borderRadius: "6px",
                padding: "10px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                zIndex: 1000,
                boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                minWidth: "140px",
            }}
        >
            <div>
                <div style={labelStyle}>W</div>
                <input
                    style={inputStyle}
                    value={values.w}
                    onChange={(e) => handleChange("w", e.target.value)}
                    onBlur={() => handleBlur("w")}
                    onKeyDown={(e) => handleKeyDown(e, "w")}
                />
            </div>
            <div>
                <div style={labelStyle}>H</div>
                <input
                    style={inputStyle}
                    value={values.h}
                    onChange={(e) => handleChange("h", e.target.value)}
                    onBlur={() => handleBlur("h")}
                    onKeyDown={(e) => handleKeyDown(e, "h")}
                />
            </div>
            <div>
                <div style={labelStyle}>X</div>
                <input
                    style={inputStyle}
                    value={values.x}
                    onChange={(e) => handleChange("x", e.target.value)}
                    onBlur={() => handleBlur("x")}
                    onKeyDown={(e) => handleKeyDown(e, "x")}
                />
            </div>
            <div>
                <div style={labelStyle}>Y</div>
                <input
                    style={inputStyle}
                    value={values.y}
                    onChange={(e) => handleChange("y", e.target.value)}
                    onBlur={() => handleBlur("y")}
                    onKeyDown={(e) => handleKeyDown(e, "y")}
                />
            </div>
        </div>
    );
}
