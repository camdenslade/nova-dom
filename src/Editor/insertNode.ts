// src/Editor/insertNode.ts
import { useEditorStore } from "./EditorState.ts";
import type { AnyNode, NodeId } from "../Schema/Node.ts";

export type InsertPosition =
    | "start"
    | "end"
    | "before"
    | "after"
    | number;

export interface InsertSpec {
    main: AnyNode;
    children?: AnyNode[];
}

export function insertNode(
    node: AnyNode | InsertSpec,
    parentId?: NodeId | null,
    position: InsertPosition = "end"
): NodeId {
    const store = useEditorStore.getState();
    const dispatch = store.dispatch;
    const selected = store.selectedNodeId;
    const tree = store.documentTree;

    const targetParent =
        parentId ??
        selected ??
        tree.root;

    if (!("main" in node)) {
        const main: AnyNode = { ...node, parentId: targetParent };
        insertSingle(main, targetParent, position, store, dispatch);
        return main.id;
    }

    const children = node.children ?? [];
    const main: AnyNode = { ...node.main, parentId: targetParent };

    insertSingle(main, targetParent, position, store, dispatch);

    for (const child of children) {
        dispatch({
            type: "ADD_NODE",
            payload: { ...child, parentId: main.id }
        });
    }

    return main.id;
}

function insertSingle(
    node: AnyNode,
    parentId: NodeId,
    position: InsertPosition,
    store: {
        documentTree: {
            nodes: Record<NodeId, AnyNode>;
        };
        selectedNodeId: NodeId | null;
    },
    dispatch: (action: import("./EditorState").EditorAction) => void
) {
    dispatch({ type: "ADD_NODE", payload: node });

    const parent = store.documentTree.nodes[parentId];
    if (!parent) return;

    const children = parent.childrenIds;
    const len = children.length;

    let index = len;

    if (position === "start") index = 0;
    else if (position === "end") index = len;
    else if (typeof position === "number") {
        index = Math.max(0, Math.min(position, len));
    } else if ((position === "before" || position === "after") && store.selectedNodeId) {
        const selIndex = children.indexOf(store.selectedNodeId);
        if (selIndex !== -1) {
            index = position === "before" ? selIndex : selIndex + 1;
        }
    }

    const current = children.indexOf(node.id);
    if (current === index) return;

    const updated = children.slice();
    updated.splice(current, 1);
    updated.splice(index, 0, node.id);

    dispatch({
        type: "UPDATE_NODE",
        payload: { ...parent, childrenIds: updated }
    });
}
