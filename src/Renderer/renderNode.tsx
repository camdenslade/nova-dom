// src/Renderer/renderNode.tsx
import type { Node } from "../Schema/Node.ts";

export function renderNode(node: Node): React.ReactNode {
    switch (node.type) {
        case "text":
            return <p style={node.props.style}>{node.props.text}</p>;
        case "container":
            return (<div style={node.props.style}>{node.children?.map(child => renderNode(child))}</div>);
        default:
            return null;
    }
}