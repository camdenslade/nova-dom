// src/Export/exportHtml.ts
import type { DocumentTree } from "../Schema/DocumentTree.ts";
import type { AnyNode, NodeId, ComponentInstanceNode } from "../Schema/Node.ts";
import { resolveComponentInstance } from "../Editor/componentFunctions.ts";

export interface ExportOptions {
    cssMode: "inline" | "classes";
    includeReset: boolean;
    prettyPrint: boolean;
}

export interface ExportResult {
    html: string;
    css: string;
}

function camelToKebab(str: string): string {
    return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function styleToString(style: Record<string, unknown> | undefined): string {
    if (!style) return "";
    return Object.entries(style)
        .filter(([, v]) => v != null && v !== "")
        .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
        .join("; ");
}

function indent(str: string, level: number, pretty: boolean): string {
    if (!pretty) return str;
    return "  ".repeat(level) + str;
}

const CSS_RESET = `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; }`;

let classCounter = 0;

function generateClassName(nodeType: string): string {
    return `nova-${nodeType}-${++classCounter}`;
}

function renderNodeToHtml(
    nodeId: NodeId,
    nodes: Record<NodeId, AnyNode>,
    options: ExportOptions,
    depth: number,
    classMap: Map<string, string>
): string {
    const node = nodes[nodeId];
    if (!node) return "";

    // Resolve component instances
    if (node.type === "component") {
        const resolved = resolveComponentInstance(node as ComponentInstanceNode);
        if (!resolved) return indent("<!-- Missing component -->", depth, options.prettyPrint);
        return renderNodeToHtml(resolved.rootNodeId, resolved.nodes, options, depth, classMap);
    }

    const style = node.props.style;
    const styleStr = styleToString(style as Record<string, unknown>);
    const nl = options.prettyPrint ? "\n" : "";

    let className = "";
    let styleAttr = "";
    if (options.cssMode === "classes" && styleStr) {
        className = generateClassName(node.type);
        classMap.set(className, styleStr);
        styleAttr = ` class="${className}"`;
    } else if (styleStr) {
        styleAttr = ` style="${styleStr}"`;
    }

    const children = node.childrenIds
        .map((cid) => renderNodeToHtml(cid, nodes, options, depth + 1, classMap))
        .join(nl);

    const hasChildren = children.length > 0;

    switch (node.type) {
        case "text":
            return indent(`<span${styleAttr}>${node.props.text as string}</span>`, depth, options.prettyPrint);

        case "image":
            return indent(`<img src="${node.props.src}" alt="${node.props.alt ?? ""}"${styleAttr} />`, depth, options.prettyPrint);

        case "video": {
            const attrs: string[] = [];
            if (node.props.controls !== false) attrs.push("controls");
            if (node.props.autoplay) attrs.push("autoplay");
            if (node.props.loop) attrs.push("loop");
            if (node.props.muted) attrs.push("muted");
            const attrStr = attrs.length > 0 ? " " + attrs.join(" ") : "";
            return indent(`<video src="${node.props.src}"${attrStr}${styleAttr}></video>`, depth, options.prettyPrint);
        }

        case "input": {
            const type = (node.props.inputType as string) ?? "text";
            const value = node.props.value ? ` value="${node.props.value}"` : "";
            const placeholder = node.props.placeholder ? ` placeholder="${node.props.placeholder}"` : "";
            return indent(`<input type="${type}"${value}${placeholder}${styleAttr} />`, depth, options.prettyPrint);
        }

        case "button":
            return indent(`<button${styleAttr}>${nl}${children}${nl}${hasChildren ? indent("", depth, options.prettyPrint) : ""}</button>`, depth, options.prettyPrint);

        case "link": {
            const target = node.props.target ? ` target="${node.props.target}"` : "";
            return indent(`<a href="${node.props.href}"${target}${styleAttr}>${nl}${children}${nl}${hasChildren ? indent("", depth, options.prettyPrint) : ""}</a>`, depth, options.prettyPrint);
        }

        case "element": {
            const tag = node.props.tag as string;
            return indent(`<${tag}${styleAttr}>${nl}${children}${nl}${hasChildren ? indent("", depth, options.prettyPrint) : ""}</${tag}>`, depth, options.prettyPrint);
        }

        case "container":
        default:
            return indent(`<div${styleAttr}>${nl}${children}${nl}${hasChildren ? indent("", depth, options.prettyPrint) : ""}</div>`, depth, options.prettyPrint);
    }
}

export function exportToHtml(
    tree: DocumentTree,
    options: ExportOptions = { cssMode: "inline", includeReset: false, prettyPrint: true }
): ExportResult {
    classCounter = 0;
    const classMap = new Map<string, string>();

    const bodyContent = renderNodeToHtml(tree.root, tree.nodes, options, 2, classMap);

    let css = "";
    if (options.cssMode === "classes") {
        const rules: string[] = [];
        if (options.includeReset) rules.push(CSS_RESET);
        for (const [className, styles] of classMap) {
            rules.push(`.${className} { ${styles} }`);
        }
        css = rules.join("\n");
    }

    const resetStyle = options.includeReset && options.cssMode === "inline"
        ? `\n    <style>\n      ${CSS_RESET}\n    </style>` : "";

    const styleBlock = css
        ? `\n    <style>\n      ${css.split("\n").join("\n      ")}\n    </style>` : "";

    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nova Export</title>${resetStyle}${styleBlock}
  </head>
  <body>
${bodyContent}
  </body>
</html>`;

    return { html, css };
}
