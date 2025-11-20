// src/Renderer/renderNode.tsx
import React from "react";
import type { Node } from "../Schema/Node";
import { useEditorStore } from "../Editor/EditorState";
import { useElementRegistry } from "./hooks/useElementRegistry";

export function renderNode(node: Node): React.ReactNode {
    const { select } = useEditorStore.getState();
    const { registerElement } = useElementRegistry.getState();

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        select(node.id);
    };

    return (
        <div
            ref={(el) => registerElement(node.id, el)}
            onClick={handleClick}
            style={{ position: "relative" }}
        >
            {node.type === "text" && (
                <span style={node.props.style}>{node.props.text}</span>
            )}

            {node.type === "container" && (
                <div style={node.props.style}>
                    {node.children?.map((child) => (
                        <React.Fragment key={child.id}>
                            {renderNode(child)}
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
}
