// src/Editor/EditorState.ts
import { create } from "zustand";
import type { Node } from "../Schema/Node.ts";
import { nanoid } from "nanoid";

type EditorState = {
    root: Node;
    selectedNodeId: string | null;

    select: (nodeId: string) => void;
    updateNode: (nodeId: string, newProps: Partial<Node["props"]>) => void;
    addNode: (parentId: string, newNode: Omit<Node, "id">) => void;
    deleteNode: (nodeId: string) => void;
};

export const useEditorStore = create<EditorState>()((set, get) => ({
    root: {
        id: "root",
        type: "container",
        props: { style: {} },
        children: [],
    },
    selectedNodeId: null,
    select: (nodeId: string) => set({ selectedNodeId: nodeId }),
    updateNode: (nodeId: string, newProps: Partial<Node["props"]>) => {
        const updateNodeRecursively = (node: Node): Node => {
            if (node.id === nodeId) {
                return { ...node, props: { ...node.props, ...newProps } };
            }
            if (node.children) {
                return {
                    ...node,
                    children: node.children.map(updateNodeRecursively),
                };
            }
            return node;
        };
        set({ root: updateNodeRecursively(get().root) });
    },
    addNode: (parentId: string, newNode: Omit<Node, "id">) => {
        const addNodeRecursively = (node: Node): Node => {
            if (node.id === parentId) {
                return {
                    ...node,
                    children: [...(node.children || []), { ...newNode, id: nanoid() }],
                };
            }
            if (node.children) {
                return {
                    ...node,
                    children: node.children.map(addNodeRecursively),
                };
            }
            return node;
        };
        set({ root: addNodeRecursively(get().root) });
    },
    deleteNode: (nodeId: string) => {
        const deleteNodeRecursively = (node: Node): Node | null => {
            if (node.id === nodeId) {
                return null;
            }
            if (node.children) {
                const updatedChildren = node.children
                    .map(deleteNodeRecursively)
                    .filter((child): child is Node => child !== null);
                return { ...node, children: updatedChildren };
            }
            return node;
        };
        const updatedRoot = deleteNodeRecursively(get().root);
        set({ root: updatedRoot || { id: "root", type: "container", props: { style: {} }, children: [] } });
    },
}));