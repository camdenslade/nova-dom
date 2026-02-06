// src/Plugin/createPluginAPI.ts
import type { PluginAPI } from "./PluginTypes.ts";
import { useEditorStore } from "../Editor/EditorState.ts";
import { useElementRegistry } from "../Renderer/hooks/useElementRegistry.ts";
import { usePluginManager } from "./PluginManager.ts";
import { useCustomNodeRegistry } from "../Editor/CustomNodeRegistry.ts";
import type { CustomNodeTypeDefinition } from "../Schema/CustomNodeType.ts";
import type { PanelSectionDef, ToolbarItemDef, PluginEvent } from "./PluginTypes.ts";
import type { AnyNode, NodeId } from "../Schema/Node.ts";
import type { EditorAction } from "../Editor/EditorState.ts";

export function createPluginAPI(): PluginAPI {
    return {
        // Read
        getDocumentTree: () => useEditorStore.getState().documentTree,

        getSelectedNode: () => {
            const state = useEditorStore.getState();
            return state.selectedNodeId ? state.documentTree.nodes[state.selectedNodeId] ?? null : null;
        },

        getNode: (id: NodeId) => useEditorStore.getState().documentTree.nodes[id],

        getElement: (id: NodeId) => useElementRegistry.getState().getElement(id) ?? undefined,

        // Write
        dispatch: (action: EditorAction) => useEditorStore.getState().dispatch(action),

        deleteNode: (id: NodeId) => useEditorStore.getState().dispatch({ type: "DELETE_NODE", payload: id }),

        updateNode: (node: AnyNode) => useEditorStore.getState().dispatch({ type: "UPDATE_NODE", payload: node }),

        // Subscribe
        subscribe: (event: PluginEvent, handler: (...args: unknown[]) => void) => {
            return usePluginManager.getState().addEventListener(event, handler);
        },

        // UI Extension
        registerPanel: (def: PanelSectionDef) => {
            usePluginManager.getState().addPanelSection(def);
        },

        registerToolbarItem: (def: ToolbarItemDef) => {
            usePluginManager.getState().addToolbarItem(def);
        },

        registerNodeType: (def: CustomNodeTypeDefinition) => {
            useCustomNodeRegistry.getState().register(def);
        },
    };
}
