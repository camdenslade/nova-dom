// src/Renderer/InlineToolbar.tsx
import { useEffect, useState } from "react";
import { useEditorStore } from "../Editor/EditorState.ts";
import { useElementRegistry } from "./hooks/useElementRegistry.ts";
import { duplicateNode } from "../Editor/duplicateNode.ts";
import type { AnyNode } from "../Schema/Node.ts";

const btnStyle: React.CSSProperties = {
    padding: "4px 8px",
    backgroundColor: "transparent",
    border: "none",
    color: "#ccc",
    fontSize: "12px",
    cursor: "pointer",
    borderRadius: "3px",
    whiteSpace: "nowrap",
};

const btnHoverBg = "#444";

function ToolButton({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                ...btnStyle,
                backgroundColor: hovered ? (danger ? "#662222" : btnHoverBg) : "transparent",
                color: danger ? "#ff6666" : "#ccc",
            }}
        >
            {label}
        </button>
    );
}

export function InlineToolbar() {
    const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
    const getElement = useElementRegistry((s) => s.getElement);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

    useEffect(() => {
        if (!selectedNodeId) {
            setPosition(null);
            return;
        }
        const el = getElement(selectedNodeId);
        if (!el) {
            setPosition(null);
            return;
        }
        const rect = el.getBoundingClientRect();
        setPosition({
            top: rect.top - 36,
            left: rect.left + rect.width / 2,
        });
    }, [selectedNodeId, getElement]);

    if (!position || !selectedNodeId) return null;

    const store = useEditorStore.getState();
    const node = store.documentTree.nodes[selectedNodeId];
    if (!node) return null;

    const handleDelete = () => {
        store.dispatch({ type: "DELETE_NODE", payload: selectedNodeId });
        store.dispatch({ type: "SELECT_NODE", payload: null });
    };

    const handleDuplicate = () => {
        const newId = duplicateNode(selectedNodeId);
        if (newId) store.dispatch({ type: "SELECT_NODE", payload: newId });
    };

    const handleMoveUp = () => {
        if (!node.parentId) return;
        const parent = store.documentTree.nodes[node.parentId];
        if (!parent) return;
        const idx = parent.childrenIds.indexOf(selectedNodeId);
        if (idx <= 0) return;
        const children = [...parent.childrenIds];
        [children[idx - 1], children[idx]] = [children[idx], children[idx - 1]];
        store.dispatch({
            type: "UPDATE_NODE",
            payload: { ...parent, childrenIds: children } as AnyNode,
        });
    };

    const handleMoveDown = () => {
        if (!node.parentId) return;
        const parent = store.documentTree.nodes[node.parentId];
        if (!parent) return;
        const idx = parent.childrenIds.indexOf(selectedNodeId);
        if (idx < 0 || idx >= parent.childrenIds.length - 1) return;
        const children = [...parent.childrenIds];
        [children[idx], children[idx + 1]] = [children[idx + 1], children[idx]];
        store.dispatch({
            type: "UPDATE_NODE",
            payload: { ...parent, childrenIds: children } as AnyNode,
        });
    };

    const handleToggleVisibility = () => {
        const currentDisplay = node.props.style?.display;
        const newDisplay = currentDisplay === "none" ? "block" : "none";
        store.dispatch({
            type: "UPDATE_NODE",
            payload: {
                ...node,
                props: { ...node.props, style: { ...node.props.style, display: newDisplay } },
            } as AnyNode,
        });
    };

    return (
        <div
            style={{
                position: "fixed",
                top: Math.max(4, position.top),
                left: position.left,
                transform: "translateX(-50%)",
                display: "flex",
                gap: 2,
                backgroundColor: "#2b2b2b",
                padding: "3px 4px",
                borderRadius: 6,
                boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                zIndex: 10000,
                border: "1px solid #444",
            }}
        >
            <ToolButton label="\u2191" onClick={handleMoveUp} />
            <ToolButton label="\u2193" onClick={handleMoveDown} />
            <ToolButton label="Dup" onClick={handleDuplicate} />
            <ToolButton label={node.props.style?.display === "none" ? "Show" : "Hide"} onClick={handleToggleVisibility} />
            <ToolButton label="Del" onClick={handleDelete} danger />
        </div>
    );
}
