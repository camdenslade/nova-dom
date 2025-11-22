// src/Renderer/DragOverlay.tsx
import { useEffect, useState } from "react";
import { useEditorStore } from "../Editor/EditorState.ts";
import { useElementRegistry } from "./hooks/useElementRegistry.ts";

export function DragOverlay() {
    const draggingNodeId = useEditorStore((s) => s.draggingNodeId);
    const dragOverNodeId = useEditorStore((s) => s.dragOverNodeId);
    const dragPosition = useEditorStore((s) => s.dragPosition);
    const getElement = useElementRegistry((s) => s.getElement);
    const [rect, setRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        if (!dragOverNodeId) {
            queueMicrotask(() => setRect(null));
            return;
        }
        const el = getElement(dragOverNodeId);
        if (!el) {
            queueMicrotask(() => setRect(null));
            return;
        }
        const r = el.getBoundingClientRect();
        queueMicrotask(() => setRect(r));
    }, [dragOverNodeId, getElement]);

    if (!rect || !draggingNodeId || !dragPosition) return null;
    let style: React.CSSProperties = {
        position: "fixed",
        pointerEvents: "none",
        zIndex: 9999,
    };
    if (dragPosition === "inside") {
        style = {
            ...style,
            top: rect.top - 1,
            left: rect.left - 1,
            width: rect.width + 2,
            height: rect.height + 2,
            border: "2px dashed blue",
            borderRadius: 4,
        };
    } else if (dragPosition === "before") {
        style = {
            ...style,
            top: rect.top - 4,
            left: rect.left,
            width: rect.width,
            height: 0,
            borderTop: "4px solid blue",
        };
    } else if (dragPosition === "after") {
        style = {
            ...style,
            top: rect.bottom,
            left: rect.left,
            width: rect.width,
            height: 0,
            borderTop: "4px solid blue",
        };
    }
    return <div style={style} />;
}