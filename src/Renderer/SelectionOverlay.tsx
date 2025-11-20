// src/Renderer/SelectionOverlay.tsx
import { useEffect, useState } from "react";
import { useEditorStore } from "../Editor/EditorState";
import { useElementRegistry } from "./hooks/useElementRegistry";

export function SelectionOverlay() {
    const selectedId = useEditorStore((s) => s.selectedNodeId);
    const getElement = useElementRegistry((s) => s.getElement);
    const [rect, setRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        if (!selectedId) {
            queueMicrotask(() => setRect(null));
        }
    }, [selectedId]);

    useEffect(() => {
        if (!selectedId) return;
        const el = getElement(selectedId);
        if (!el) {
            queueMicrotask(() => setRect(null));
            return;
        }
        const update = () => {
            const r = el.getBoundingClientRect();
            queueMicrotask(() => setRect(r));
        };

        update();
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);

        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
        };
    }, [selectedId, getElement]);

    if (!rect) return null;
    return (
        <div
            style={{
                position: "fixed",
                top: rect.top - 2,
                left: rect.left - 2,
                width: rect.width + 4,
                height: rect.height + 4,
                border: "2px solid #4A90E2",
                pointerEvents: "none",
                zIndex: 9999,
                borderRadius: 4,
            }}
        />
    );
}
