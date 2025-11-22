// src/Editor/reorderNode.ts
import { useEditorStore } from "./EditorState.ts";
import { insertNode } from "./insertNode.ts";
import type { NodeId } from "../Schema/Node.ts";

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
    if (dragged.parentId) {
        const parent = tree.nodes[dragged.parentId];
        parent.childrenIds = parent.childrenIds.filter(id => id !== nodeId);
        store.dispatch({
            type: "UPDATE_NODE",
            payload: { ...parent }
        });
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
