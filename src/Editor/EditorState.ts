// src/Editor/EditorState.ts
import type { DocumentTree } from "../Schema/DocumentTree";
import type { AnyNode, NodeId } from "../Schema/Node";
import { create } from "zustand";

export interface EditorState {
    documentTree: DocumentTree;
    selectedNodeId: NodeId | null;
    hoveredNodeId: NodeId | null;
    isEditingText: NodeId | null;
    history: DocumentTree[];
    historyIndex: number;
    dispatch: (action: EditorAction) => void;
}

export type EditorAction =
    | { type: "SET_DOCUMENT_TREE"; payload: DocumentTree }
    | { type: "SELECT_NODE"; payload: NodeId | null }
    | { type: "SET_HOVER"; payload: NodeId | null }
    | { type: "SET_EDITING_TEXT"; payload: NodeId | null }
    | { type: "UNDO" }
    | { type: "REDO" }
    | { type: "UPDATE_NODE"; payload: AnyNode }
    | { type: "ADD_NODE"; payload: AnyNode }
    | { type: "DELETE_NODE"; payload: NodeId };

function cloneDocumentTree(tree: DocumentTree): DocumentTree {
    return JSON.parse(JSON.stringify(tree));
}

function pushHistory(state: EditorState, newTree: DocumentTree): EditorState {
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(cloneDocumentTree(newTree));
    return {
        ...state,
        history: newHistory,
        historyIndex: newHistory.length - 1,
    };
}

function reducer(state: EditorState, action: EditorAction): EditorState {
    switch (action.type) {
        case "SET_DOCUMENT_TREE":
            return pushHistory({ ...state, documentTree: action.payload }, action.payload);

        case "SELECT_NODE":
            return { ...state, selectedNodeId: action.payload };

        case "SET_HOVER":
            return { ...state, hoveredNodeId: action.payload };

        case "SET_EDITING_TEXT":
            return { ...state, isEditingText: action.payload };

        case "UNDO":
            if (state.historyIndex > 0) {
                const newIndex = state.historyIndex - 1;
                return {
                    ...state,
                    documentTree: cloneDocumentTree(state.history[newIndex]),
                    historyIndex: newIndex,
                };
            }
            return state;

        case "REDO":
            if (state.historyIndex < state.history.length - 1) {
                const newIndex = state.historyIndex + 1;
                return {
                    ...state,
                    documentTree: cloneDocumentTree(state.history[newIndex]),
                    historyIndex: newIndex,
                };
            }
            return state;

        case "UPDATE_NODE": {
            const newTree = cloneDocumentTree(state.documentTree);
            newTree.nodes[action.payload.id] = action.payload;
            return pushHistory({ ...state, documentTree: newTree }, newTree);
        }

        case "ADD_NODE": {
            const newTree = cloneDocumentTree(state.documentTree);
            newTree.nodes[action.payload.id] = action.payload;
            if (action.payload.parentId) {
                const parent = newTree.nodes[action.payload.parentId];
                parent.childrenIds.push(action.payload.id);
            }
            return pushHistory({ ...state, documentTree: newTree }, newTree);
        }

        case "DELETE_NODE": {
            const newTree = cloneDocumentTree(state.documentTree);

            function removeRecursively(id: NodeId) {
                const node = newTree.nodes[id];
                if (!node) return;
                node.childrenIds.forEach(removeRecursively);
                delete newTree.nodes[id];
            }

            const node = newTree.nodes[action.payload];
            if (node?.parentId) {
                const parent = newTree.nodes[node.parentId];
                parent.childrenIds = parent.childrenIds.filter(id => id !== action.payload);
            }

            removeRecursively(action.payload);

            return pushHistory({ ...state, documentTree: newTree }, newTree);
        }

        default:
            return state;
    }
}

const initialTree: DocumentTree = {
    root: "root",
    nodes: {
        root: {
            id: "root",
            type: "container",
            parentId: null,
            childrenIds: ["text1"],
            props: {
                style: { padding: "20px" }
            }
        },
        text1: {
            id: "text1",
            type: "text",
            parentId: "root",
            childrenIds: [],
            props: {
                text: "Hello World!",
                style: { fontSize: "24px", color: "#000000" }
            }
        }
    }
};


export const useEditorStore = create<EditorState>()((set) => ({
    documentTree: initialTree,
    selectedNodeId: null,
    hoveredNodeId: null,
    isEditingText: null,
    history: [cloneDocumentTree(initialTree)],
    historyIndex: 0,
    dispatch: (action: EditorAction) => {
        set(state => reducer(state, action));
    },
}));
