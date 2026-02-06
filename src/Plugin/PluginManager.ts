// src/Plugin/PluginManager.ts
import { create } from "zustand";
import type { NovaPlugin, ToolbarItemDef, PanelSectionDef, PluginEvent } from "./PluginTypes.ts";
import type { AnyNode, NodeId } from "../Schema/Node.ts";
import { useEditorStore } from "../Editor/EditorState.ts";
import { createPluginAPI } from "./createPluginAPI.ts";

type EventHandler = (...args: unknown[]) => void;

interface PluginManagerState {
    plugins: Record<string, NovaPlugin>;
    cleanups: Record<string, (() => void) | undefined>;
    toolbarItems: ToolbarItemDef[];
    panelSections: PanelSectionDef[];
    eventHandlers: Record<PluginEvent, EventHandler[]>;
    register: (plugin: NovaPlugin) => void;
    unregister: (name: string) => void;
    addToolbarItem: (item: ToolbarItemDef) => void;
    addPanelSection: (section: PanelSectionDef) => void;
    addEventListener: (event: PluginEvent, handler: EventHandler) => () => void;
    notify: (event: PluginEvent, ...args: unknown[]) => void;
}

export const usePluginManager = create<PluginManagerState>()((set, get) => ({
    plugins: {},
    cleanups: {},
    toolbarItems: [],
    panelSections: [],
    eventHandlers: {
        nodeSelect: [],
        nodeUpdate: [],
        nodeAdd: [],
        nodeDelete: [],
        treeChange: [],
    },

    register: (plugin) => {
        const state = get();
        if (state.plugins[plugin.name]) {
            state.unregister(plugin.name);
        }

        const api = createPluginAPI();

        // Register plugin-provided toolbar items
        if (plugin.toolbarItems) {
            for (const item of plugin.toolbarItems) {
                api.registerToolbarItem(item);
            }
        }

        // Register plugin-provided panel sections
        if (plugin.panelSections) {
            for (const section of plugin.panelSections) {
                api.registerPanel(section);
            }
        }

        // Register plugin-provided custom node types
        if (plugin.customNodeTypes) {
            for (const nodeDef of plugin.customNodeTypes) {
                api.registerNodeType(nodeDef);
            }
        }

        // Initialize plugin
        let cleanup: (() => void) | undefined;
        if (plugin.init) {
            const result = plugin.init(api);
            if (typeof result === "function") cleanup = result;
        }

        // Register event hooks
        if (plugin.onNodeSelect) {
            api.subscribe("nodeSelect", plugin.onNodeSelect as EventHandler);
        }
        if (plugin.onNodeUpdate) {
            api.subscribe("nodeUpdate", plugin.onNodeUpdate as EventHandler);
        }
        if (plugin.onNodeAdd) {
            api.subscribe("nodeAdd", plugin.onNodeAdd as EventHandler);
        }
        if (plugin.onNodeDelete) {
            api.subscribe("nodeDelete", plugin.onNodeDelete as EventHandler);
        }

        set((s) => ({
            plugins: { ...s.plugins, [plugin.name]: plugin },
            cleanups: { ...s.cleanups, [plugin.name]: cleanup },
        }));
    },

    unregister: (name) => {
        const state = get();
        const cleanup = state.cleanups[name];
        if (cleanup) cleanup();

        set((s) => {
            const plugins = { ...s.plugins };
            delete plugins[name];
            const cleanups = { ...s.cleanups };
            delete cleanups[name];
            return {
                plugins,
                cleanups,
                toolbarItems: s.toolbarItems.filter((i) => !i.id.startsWith(`${name}:`)),
                panelSections: s.panelSections.filter((sec) => !sec.id.startsWith(`${name}:`)),
            };
        });
    },

    addToolbarItem: (item) =>
        set((s) => ({ toolbarItems: [...s.toolbarItems, item] })),

    addPanelSection: (section) =>
        set((s) => ({ panelSections: [...s.panelSections, section] })),

    addEventListener: (event, handler) => {
        set((s) => ({
            eventHandlers: {
                ...s.eventHandlers,
                [event]: [...s.eventHandlers[event], handler],
            },
        }));
        return () => {
            set((s) => ({
                eventHandlers: {
                    ...s.eventHandlers,
                    [event]: s.eventHandlers[event].filter((h) => h !== handler),
                },
            }));
        };
    },

    notify: (event, ...args) => {
        const handlers = get().eventHandlers[event];
        for (const handler of handlers) {
            handler(...args);
        }
    },
}));

// Subscribe to EditorState changes and fire plugin events
let prevState = useEditorStore.getState();
useEditorStore.subscribe((state) => {
    const pm = usePluginManager.getState();

    if (state.selectedNodeId !== prevState.selectedNodeId) {
        pm.notify("nodeSelect", state.selectedNodeId);
    }

    if (state.documentTree !== prevState.documentTree) {
        pm.notify("treeChange", state.documentTree);

        // Detect added/updated/deleted nodes
        const prevNodes = prevState.documentTree.nodes;
        const newNodes = state.documentTree.nodes;

        for (const id of Object.keys(newNodes)) {
            if (!prevNodes[id]) {
                pm.notify("nodeAdd", newNodes[id]);
            } else if (JSON.stringify(prevNodes[id]) !== JSON.stringify(newNodes[id])) {
                pm.notify("nodeUpdate", newNodes[id]);
            }
        }

        for (const id of Object.keys(prevNodes)) {
            if (!newNodes[id]) {
                pm.notify("nodeDelete", id as NodeId);
            }
        }
    }

    prevState = state;
});

// Force TypeScript to see that AnyNode is used (for type narrowing in event handlers)
void (null as unknown as AnyNode);
