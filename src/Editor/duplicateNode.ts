// src/Editor/duplicateNode.ts
import type { AnyNode, NodeId } from "../Schema/Node.ts";
import { useEditorStore } from "./EditorState.ts";

function generateId(): NodeId {
    return Math.random().toString(36).slice(2, 10);
}

export function duplicateNode(nodeId: NodeId): NodeId | null {
    const store = useEditorStore.getState();
    const tree = store.documentTree;
    const node = tree.nodes[nodeId];
    if (!node || !node.parentId) return null;

    // Build old-to-new ID mapping for the entire subtree
    const idMap = new Map<NodeId, NodeId>();

    function collectIds(id: NodeId) {
        idMap.set(id, generateId());
        const n = tree.nodes[id];
        if (n) n.childrenIds.forEach(collectIds);
    }
    collectIds(nodeId);

    // Clone all nodes with new IDs
    const clones: AnyNode[] = [];
    function cloneSubtree(id: NodeId, newParentId: NodeId | null) {
        const original = tree.nodes[id];
        if (!original) return;

        const newId = idMap.get(id)!;
        const clone: AnyNode = {
            ...JSON.parse(JSON.stringify(original)),
            id: newId,
            parentId: newParentId,
            childrenIds: original.childrenIds.map((cid) => idMap.get(cid)!),
        };
        clones.push(clone);
        original.childrenIds.forEach((cid) => cloneSubtree(cid, newId));
    }
    cloneSubtree(nodeId, node.parentId);

    // Insert root clone after the original in the parent's childrenIds
    const parent = tree.nodes[node.parentId];
    if (!parent) return null;

    const rootCloneId = idMap.get(nodeId)!;

    // Add all cloned nodes
    for (const clone of clones) {
        store.dispatch({ type: "ADD_NODE", payload: clone });
    }

    // Reorder parent's children to place the clone after the original
    const updatedParent = store.documentTree.nodes[node.parentId];
    if (updatedParent) {
        const children = [...updatedParent.childrenIds];
        const originalIndex = children.indexOf(nodeId);
        // Move root clone right after original (ADD_NODE appends to end)
        const cloneIndex = children.indexOf(rootCloneId);
        if (cloneIndex !== -1) children.splice(cloneIndex, 1);
        children.splice(originalIndex + 1, 0, rootCloneId);

        store.dispatch({
            type: "UPDATE_NODE",
            payload: { ...updatedParent, childrenIds: children } as AnyNode,
        });
    }

    return rootCloneId;
}
