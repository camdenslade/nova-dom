// src/Renderer/Overlay.tsx
import { useEffect, useState } from "react";
import { useEditorStore } from "../Editor/EditorState";
import { useElementRegistry } from "./hooks/useElementRegistry";

function OverlayBox({
    nodeId,
    border,
    zIndex
}: {
    nodeId: string | null;
    border: string;
    zIndex: number;
}) {
    const getElement = useElementRegistry((s) => s.getElement);
    const [rect, setRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        if (!nodeId) {
            queueMicrotask(() => setRect(null));
        }
    }, [nodeId]);

    useEffect(() => {
        if (!nodeId) return;
        const el = getElement(nodeId);
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
    }, [nodeId, getElement]);

    if (!rect) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: rect.top - 1,
                left: rect.left - 1,
                width: rect.width + 2,
                height: rect.height + 2,
                border,
                pointerEvents: "none",
                zIndex,
                borderRadius: 4,
            }}
        />
    );
}

export function Overlay() {
    const selectedId = useEditorStore((s) => s.selectedNodeId);
    const hoveredId = useEditorStore((s) => s.hoveredNodeId);

    return (
        <>
            <OverlayBox
                nodeId={hoveredId}
                border="1px dashed #4A90E2"
                zIndex={9998}
            />
            <OverlayBox
                nodeId={selectedId}
                border="2px solid #4A90E2"
                zIndex={9999}
            />
        </>
    );
}
