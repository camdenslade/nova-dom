// src/Editor/ComponentRegistry.ts
import { create } from "zustand";
import type { ComponentDefinition, ComponentId } from "../Schema/Component.ts";

interface ComponentRegistryState {
    components: Record<ComponentId, ComponentDefinition>;
    registerComponent: (def: ComponentDefinition) => void;
    unregisterComponent: (id: ComponentId) => void;
    getComponent: (id: ComponentId) => ComponentDefinition | undefined;
    updateComponent: (id: ComponentId, updates: Partial<ComponentDefinition>) => void;
}

export const useComponentRegistry = create<ComponentRegistryState>()((set, get) => ({
    components: {},
    registerComponent: (def) =>
        set((s) => ({ components: { ...s.components, [def.id]: def } })),
    unregisterComponent: (id) =>
        set((s) => {
            const copy = { ...s.components };
            delete copy[id];
            return { components: copy };
        }),
    getComponent: (id) => get().components[id],
    updateComponent: (id, updates) =>
        set((s) => ({
            components: {
                ...s.components,
                [id]: { ...s.components[id], ...updates, updatedAt: Date.now() },
            },
        })),
}));
