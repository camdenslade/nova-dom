// src/Renderer/Renderer.tsx
import { useEditorStore } from "../Editor/EditorState";
import { renderNode } from "./renderNode";

export function Renderer() {
    const tree = useEditorStore(s => s.documentTree);
    return renderNode(tree.root, tree);
}
