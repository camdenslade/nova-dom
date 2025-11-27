// src/Editor/EditorState.ts
import type { DocumentTree } from "../Schema/DocumentTree.ts";
import type { AnyNode, NodeId } from "../Schema/Node.ts";
import { create } from "zustand";

export interface EditorState {
    documentTree: DocumentTree;
    selectedNodeId: NodeId | null;
    hoveredNodeId: NodeId | null;
    isEditingText: NodeId | null;
    draggingNodeId: NodeId | null
    dragOverNodeId: NodeId | null
    dragPosition: "before" | "after" | "inside" | null
    history: DocumentTree[];
    historyIndex: number;
    dispatch: (action: EditorAction) => void;
}

export type EditorAction =
    | { type: "SET_DOCUMENT_TREE"; payload: DocumentTree }
    | { type: "SELECT_NODE"; payload: NodeId | null }
    | { type: "SET_HOVER"; payload: NodeId | null }
    | { type: "SET_EDITING_TEXT"; payload: NodeId | null }
    | { type: "SET_DRAGGING"; payload: NodeId | null }
    | { type: "SET_DRAG_OVER"; payload: { nodeId: NodeId | null; position: "before" | "after" | "inside" | null } }
    | { type: "CLEAR_DRAG" }
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

        case "SET_DRAGGING":
            return { ...state, draggingNodeId: action.payload };

        case "SET_DRAG_OVER":
            return {
                ...state,
                dragOverNodeId: action.payload.nodeId,
                dragPosition: action.payload.position,
            };

        case "CLEAR_DRAG":
            return { ...state, draggingNodeId: null, dragOverNodeId: null, dragPosition: null };


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
            childrenIds: ["text1", "box1"],
            props: {
                style: { padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }
            }
        },
        text1: {
            id: "text1",
            type: "text",
            parentId: "root",
            childrenIds: [],
            props: {
                text: "Try resizing the blue box below:",
                style: { fontSize: "16px", color: "#333" }
            }
        },
        box1: {
            id: "box1",
            type: "container",
            parentId: "root",
            childrenIds: [],
            props: {
                style: { 
                    width: "100px", 
                    height: "100px", 
                    backgroundColor: "#ff0055",
                    border: "2px solid #333" 
                }
            }
        }
    }
};


export const useEditorStore = create<EditorState>()((set) => ({
    documentTree: initialTree,
    selectedNodeId: null,
    hoveredNodeId: null,
    isEditingText: null,
    draggingNodeId: null,
    dragOverNodeId: null,
    dragPosition: null,
    history: [cloneDocumentTree(initialTree)],
    historyIndex: 0,
    dispatch: (action: EditorAction) => {
        set(state => reducer(state, action));
    },
}));
