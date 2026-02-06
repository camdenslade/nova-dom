// src/Plugin/PluginTypes.ts
import type React from "react";
import type { AnyNode, NodeId } from "../Schema/Node.ts";
import type { DocumentTree } from "../Schema/DocumentTree.ts";
import type { EditorAction } from "../Editor/EditorState.ts";
import type { CustomNodeTypeDefinition } from "../Schema/CustomNodeType.ts";

export type PluginEvent = "nodeSelect" | "nodeUpdate" | "nodeAdd" | "nodeDelete" | "treeChange";

export interface ToolbarItemDef {
    id: string;
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    position?: "left" | "right";
}

export interface PanelSectionDef {
    id: string;
    title: string;
    component: React.ComponentType;
    position?: "top" | "bottom";
}

export interface PluginAPI {
    // Read
    getDocumentTree: () => DocumentTree;
    getSelectedNode: () => AnyNode | null;
    getNode: (id: NodeId) => AnyNode | undefined;
    getElement: (id: NodeId) => HTMLElement | undefined;

    // Write
    dispatch: (action: EditorAction) => void;
    deleteNode: (id: NodeId) => void;
    updateNode: (node: AnyNode) => void;

    // Subscribe
    subscribe: (event: PluginEvent, handler: (...args: unknown[]) => void) => () => void;

    // UI Extension
    registerPanel: (def: PanelSectionDef) => void;
    registerToolbarItem: (def: ToolbarItemDef) => void;
    registerNodeType: (def: CustomNodeTypeDefinition) => void;
}

export interface NovaPlugin {
    name: string;
    version: string;
    init?: (api: PluginAPI) => void | (() => void);
    onNodeSelect?: (nodeId: NodeId | null) => void;
    onNodeUpdate?: (node: AnyNode) => void;
    onNodeAdd?: (node: AnyNode) => void;
    onNodeDelete?: (nodeId: NodeId) => void;
    onBeforeExport?: (tree: DocumentTree) => DocumentTree;
    toolbarItems?: ToolbarItemDef[];
    panelSections?: PanelSectionDef[];
    customNodeTypes?: CustomNodeTypeDefinition[];
}
