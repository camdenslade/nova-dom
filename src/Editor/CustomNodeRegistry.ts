// src/Editor/CustomNodeRegistry.ts
import { create } from "zustand";
import type { CustomNodeTypeDefinition } from "../Schema/CustomNodeType.ts";

interface CustomNodeRegistryState {
    customTypes: Record<string, CustomNodeTypeDefinition>;
    register: (def: CustomNodeTypeDefinition) => void;
    unregister: (type: string) => void;
}

export const useCustomNodeRegistry = create<CustomNodeRegistryState>()((set) => ({
    customTypes: {},
    register: (def) =>
        set((s) => ({ customTypes: { ...s.customTypes, [def.type]: def } })),
    unregister: (type) =>
        set((s) => {
            const copy = { ...s.customTypes };
            delete copy[type];
            return { customTypes: copy };
        }),
}));
