// src/Editor/reorderNode.ts
import { useEditorStore } from "./EditorState";
import { insertNode } from "./insertNode";
import type { NodeId } from "../Schema/Node";

export function reorderNode(
    nodeId: NodeId,
    targetId: NodeId,
    position: "before" | "after" | "inside"
) {
    const store = useEditorStore.getState();
    const tree = store.documentTree;

    if (nodeId === targetId) return;

    const dragged = tree.nodes[nodeId];
    if (!dragged) return;

    const target = tree.nodes[targetId];
    if (!target) return;

    let illegal = false;
    const walk = (id: NodeId) => {
        if (id === nodeId) {
            illegal = true;
            return;
        }
        const child = tree.nodes[id];
        if (!child) return;
        child.childrenIds.forEach(walk);
    };

    walk(targetId);
    if (illegal) return;
    if (dragged.parentId) {
        const parent = tree.nodes[dragged.parentId];
        const updatedParent = {
            ...parent,
            childrenIds: parent.childrenIds.filter(id => id !== nodeId),
        };
        store.dispatch({ type: "UPDATE_NODE", payload: updatedParent });
    }
    const insertParent =
        position === "inside"
            ? targetId
            : tree.nodes[targetId].parentId;

    const insertPos =
        position === "before" || position === "after"
            ? position
            : "end";
    insertNode(
        { ...dragged, parentId: insertParent },
        insertParent,
        insertPos
    );
}
