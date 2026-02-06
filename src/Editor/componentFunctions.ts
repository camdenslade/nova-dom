// src/Editor/componentFunctions.ts
import type { AnyNode, NodeId, ComponentInstanceNode } from "../Schema/Node.ts";
import type { ComponentDefinition, ComponentId } from "../Schema/Component.ts";
import { useEditorStore } from "./EditorState.ts";
import { useComponentRegistry } from "./ComponentRegistry.ts";

function generateId(): NodeId {
    return Math.random().toString(36).slice(2, 10);
}

export function saveAsComponent(rootNodeId: NodeId, name: string): ComponentId | null {
    const store = useEditorStore.getState();
    const tree = store.documentTree;
    const rootNode = tree.nodes[rootNodeId];
    if (!rootNode) return null;

    // Collect all nodes in the subtree
    const subtreeNodes: Record<NodeId, AnyNode> = {};
    function collect(id: NodeId) {
        const node = tree.nodes[id];
        if (!node) return;
        subtreeNodes[id] = JSON.parse(JSON.stringify(node));
        node.childrenIds.forEach(collect);
    }
    collect(rootNodeId);

    // Set root's parentId to null in the definition copy
    subtreeNodes[rootNodeId] = { ...subtreeNodes[rootNodeId], parentId: null };

    const componentId = generateId();
    const definition: ComponentDefinition = {
        id: componentId,
        name,
        rootNodeId,
        nodes: subtreeNodes,
        exposedProps: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    useComponentRegistry.getState().registerComponent(definition);

    // Replace the original subtree with a component instance node
    const instanceNode: ComponentInstanceNode = {
        id: generateId(),
        type: "component",
        parentId: rootNode.parentId,
        childrenIds: [],
        props: {
            componentId,
            overrides: {},
            style: rootNode.props.style,
        },
    };

    // Remove original subtree children from parent
    if (rootNode.parentId) {
        const parent = tree.nodes[rootNode.parentId];
        if (parent) {
            const children = parent.childrenIds.map((cid) =>
                cid === rootNodeId ? instanceNode.id : cid
            );
            store.dispatch({
                type: "UPDATE_NODE",
                payload: { ...parent, childrenIds: children } as AnyNode,
            });
        }
    }

    // Delete original subtree nodes
    function deleteSubtree(id: NodeId) {
        const node = tree.nodes[id];
        if (!node) return;
        node.childrenIds.forEach(deleteSubtree);
        delete store.documentTree.nodes[id];
    }
    deleteSubtree(rootNodeId);

    // Add the instance node
    store.dispatch({ type: "ADD_NODE", payload: instanceNode });
    store.dispatch({ type: "SELECT_NODE", payload: instanceNode.id });

    return componentId;
}

export function instantiateComponent(componentId: ComponentId, parentId: NodeId): NodeId | null {
    const def = useComponentRegistry.getState().getComponent(componentId);
    if (!def) return null;

    const instanceNode: ComponentInstanceNode = {
        id: generateId(),
        type: "component",
        parentId,
        childrenIds: [],
        props: {
            componentId,
            overrides: {},
            style: def.nodes[def.rootNodeId]?.props.style,
        },
    };

    const store = useEditorStore.getState();
    store.dispatch({ type: "ADD_NODE", payload: instanceNode });
    return instanceNode.id;
}

export function resolveComponentInstance(
    instanceNode: ComponentInstanceNode
): { rootNodeId: NodeId; nodes: Record<NodeId, AnyNode> } | null {
    const def = useComponentRegistry.getState().getComponent(instanceNode.props.componentId);
    if (!def) return null;

    // Deep clone the definition's nodes
    const resolved: Record<NodeId, AnyNode> = JSON.parse(JSON.stringify(def.nodes));

    // Apply overrides
    for (const [key, value] of Object.entries(instanceNode.props.overrides)) {
        // Format: "nodeId.propPath"
        const dotIndex = key.indexOf(".");
        if (dotIndex === -1) continue;
        const nodeId = key.slice(0, dotIndex);
        const propPath = key.slice(dotIndex + 1);
        const node = resolved[nodeId];
        if (!node) continue;

        // Simple single-level prop override
        const parts = propPath.split(".");
        let target: Record<string, unknown> = node as unknown as Record<string, unknown>;
        for (let i = 0; i < parts.length - 1; i++) {
            target = target[parts[i]] as Record<string, unknown>;
            if (!target) break;
        }
        if (target) {
            target[parts[parts.length - 1]] = value;
        }
    }

    return { rootNodeId: def.rootNodeId, nodes: resolved };
}
