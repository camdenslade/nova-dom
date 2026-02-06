// src/Schema/CustomNodeType.ts
import type React from "react";
import type { AnyNode } from "./Node.ts";

export interface CustomNodeTypeDefinition {
    type: string;
    label: string;
    defaultProps: Record<string, unknown>;
    defaultStyle: React.CSSProperties;
    renderer: React.ComponentType<{ node: AnyNode; children: React.ReactNode }>;
}
