// src/Schema/DocumentTree.ts
import type { AnyNode, NodeId } from "./Node.ts";

export interface DocumentTree {
    root: NodeId;
    nodes: Record<NodeId, AnyNode>;
}