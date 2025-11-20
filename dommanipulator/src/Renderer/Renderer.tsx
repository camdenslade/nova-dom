// src/Renderer/Renderer.tsx
import type { Node } from "../Schema/Node.ts";
import { renderNode } from "./renderNode.tsx";

export function Renderer({ node }: { node: Node }): React.ReactNode {
    return renderNode(node);
}