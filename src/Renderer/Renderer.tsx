// src/Renderer/Renderer.tsx
import { useEditorStore } from "../Editor/EditorState.ts";
import { renderNode } from "./renderNode.tsx";
import { Overlay } from "./Overlay.tsx";
import { DragOverlay } from "./DragOverlay.tsx";

export function Renderer() {
    const tree = useEditorStore((s) => s.documentTree);

    return (
        <>
            <Overlay />
            <DragOverlay />
            {renderNode(tree.root, tree)}
        </>
    );
}
