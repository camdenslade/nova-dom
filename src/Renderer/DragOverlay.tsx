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
            top: rect.top - 2,
            left: rect.left - 2,
            width: rect.width + 4,
            height: rect.height + 4,
            border: "2px dashed #0d99ff",
            borderRadius: 4,
            backgroundColor: "rgba(13, 153, 255, 0.08)",
        };
    } else if (dragPosition === "before") {
        style = {
            ...style,
            top: rect.top - 2,
            left: rect.left,
            width: rect.width,
            height: 4,
            backgroundColor: "#0d99ff",
            borderRadius: 2,
            boxShadow: "0 0 6px rgba(13, 153, 255, 0.6)",
        };
    } else if (dragPosition === "after") {
        style = {
            ...style,
            top: rect.bottom - 2,
            left: rect.left,
            width: rect.width,
            height: 4,
            backgroundColor: "#0d99ff",
            borderRadius: 2,
            boxShadow: "0 0 6px rgba(13, 153, 255, 0.6)",
        };
    }
    return <div style={style} />;
}