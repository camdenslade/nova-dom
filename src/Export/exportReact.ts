// src/Export/exportReact.ts
import type { DocumentTree } from "../Schema/DocumentTree.ts";
import type { AnyNode, NodeId, ComponentInstanceNode } from "../Schema/Node.ts";
import { resolveComponentInstance } from "../Editor/componentFunctions.ts";

function styleToJSX(style: Record<string, unknown> | undefined): string {
    if (!style) return "";
    const entries = Object.entries(style).filter(([, v]) => v != null && v !== "");
    if (entries.length === 0) return "";
    const props = entries
        .map(([k, v]) => {
            const val = typeof v === "number" ? String(v) : `"${v}"`;
            return `${k}: ${val}`;
        })
        .join(", ");
    return `{{ ${props} }}`;
}

function renderNodeToJSX(
    nodeId: NodeId,
    nodes: Record<NodeId, AnyNode>,
    depth: number
): string {
    const node = nodes[nodeId];
    if (!node) return "";

    const pad = "  ".repeat(depth);
    const style = node.props.style;
    const styleStr = styleToJSX(style as Record<string, unknown>);
    const styleAttr = styleStr ? ` style={${styleStr}}` : "";

    // Resolve component instances
    if (node.type === "component") {
        const resolved = resolveComponentInstance(node as ComponentInstanceNode);
        if (!resolved) return `${pad}{/* Missing component */}`;
        return renderNodeToJSX(resolved.rootNodeId, resolved.nodes, depth);
    }

    const children = node.childrenIds
        .map((cid) => renderNodeToJSX(cid, nodes, depth + 1))
        .join("\n");

    const hasChildren = children.length > 0;
    const childBlock = hasChildren ? `\n${children}\n${pad}` : "";

    switch (node.type) {
        case "text":
            return `${pad}<span${styleAttr}>${node.props.text as string}</span>`;

        case "image":
            return `${pad}<img src="${node.props.src}" alt="${node.props.alt ?? ""}"${styleAttr} />`;

        case "video": {
            const attrs: string[] = [];
            if (node.props.controls !== false) attrs.push("controls");
            if (node.props.autoplay) attrs.push("autoPlay");
            if (node.props.loop) attrs.push("loop");
            if (node.props.muted) attrs.push("muted");
            const attrStr = attrs.length > 0 ? " " + attrs.join(" ") : "";
            return `${pad}<video src="${node.props.src}"${attrStr}${styleAttr} />`;
        }

        case "input": {
            const type = (node.props.inputType as string) ?? "text";
            const value = node.props.value ? ` defaultValue="${node.props.value}"` : "";
            const placeholder = node.props.placeholder ? ` placeholder="${node.props.placeholder}"` : "";
            return `${pad}<input type="${type}"${value}${placeholder}${styleAttr} />`;
        }

        case "button":
            return `${pad}<button${styleAttr}>${childBlock}</button>`;

        case "link": {
            const target = node.props.target ? ` target="${node.props.target}"` : "";
            return `${pad}<a href="${node.props.href}"${target}${styleAttr}>${childBlock}</a>`;
        }

        case "element": {
            const tag = node.props.tag as string;
            return `${pad}<${tag}${styleAttr}>${childBlock}</${tag}>`;
        }

        case "container":
        default:
            return `${pad}<div${styleAttr}>${childBlock}</div>`;
    }
}

export function exportToReact(tree: DocumentTree): string {
    const body = renderNodeToJSX(tree.root, tree.nodes, 2);

    return `export function NovaPage() {
  return (
${body}
  );
}
`;
}
