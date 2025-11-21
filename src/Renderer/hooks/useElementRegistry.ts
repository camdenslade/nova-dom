// src/Renderer/hooks/useElementRegistry.ts
import { create } from "zustand";

type ElementRegistry = {
    elements: Map<string, HTMLElement>;
    registerElement: (id: string, element: HTMLElement | null) => void;
    unregisterElement: (id: string) => void;
    getElement: (id: string) => HTMLElement | undefined;
};

export const useElementRegistry = create<ElementRegistry>()((set, get) => ({
    elements: new Map(),

    registerElement: (id, element) =>
        set((state) => {
            const next = new Map(state.elements);
            if (element) next.set(id, element);
            else next.delete(id);
            return { elements: next };
        }),

    unregisterElement: (id) =>
        set((state) => {
            const next = new Map(state.elements);
            next.delete(id);
            return { elements: next };
        }),

    getElement: (id) => get().elements.get(id),
}));
