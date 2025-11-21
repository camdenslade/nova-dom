// src/Schema/DocumentTree.ts
import type { AnyNode, NodeId } from "./Node";

export interface DocumentTree {
    root: NodeId;
    nodes: Record<NodeId, AnyNode>;
}