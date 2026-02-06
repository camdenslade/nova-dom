// src/Schema/Component.ts
import type { AnyNode, NodeId } from "./Node.ts";

export type ComponentId = string;

export interface ComponentDefinition {
    id: ComponentId;
    name: string;
    description?: string;
    rootNodeId: NodeId;
    nodes: Record<NodeId, AnyNode>;
    exposedProps: ComponentPropDef[];
    createdAt: number;
    updatedAt: number;
}

export interface ComponentPropDef {
    name: string;
    nodeId: NodeId;
    propPath: string;
    defaultValue: unknown;
}
