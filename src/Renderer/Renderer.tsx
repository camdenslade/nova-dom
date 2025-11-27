// src/Renderer/Renderer.tsx
import { useEditorStore } from "../Editor/EditorState.ts";
import { renderNode } from "./renderNode.tsx";
import { DragOverlay } from "./DragOverlay.tsx";

export function Renderer() {
    const tree = useEditorStore((s) => s.documentTree);
    const selectedNodeId = useEditorStore((s) => s.selectedNodeId);

    return (
        <>
            <DragOverlay />
            {renderNode(tree.root, tree, selectedNodeId)}
        </>
    );
}
