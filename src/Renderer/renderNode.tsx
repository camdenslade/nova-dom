// src/Renderer/renderNode.tsx
import React from "react";
import type { NodeId } from "../Schema/Node.ts";
import type { DocumentTree } from "../Schema/DocumentTree.ts";
import { useEditorStore } from "../Editor/EditorState.ts";
import { useElementRegistry } from "./hooks/useElementRegistry.ts";
import { reorderNode } from "../Editor/reorderNode.ts";
import { SelectionControls } from "./SelectionControls.tsx";
import { resolveComponentInstance } from "../Editor/componentFunctions.ts";
import { useCustomNodeRegistry } from "../Editor/CustomNodeRegistry.ts";
import type { ComponentInstanceNode } from "../Schema/Node.ts";

export function renderNode(id: NodeId, tree: DocumentTree, selectedNodeId: NodeId | null): React.ReactNode {
    const node = tree.nodes[id];
    if (!node) return null;

    const { registerElement } = useElementRegistry.getState();
    const dispatch = useEditorStore.getState().dispatch;
    const isSelected = id === selectedNodeId;
    const children = node.childrenIds;
    

    const { 
        position, left, top, right, bottom, transform, zIndex, marginTop, marginLeft, marginRight, marginBottom,
        ...contentStyle
    } = node.props.style || {};

    const wrapperStyle: React.CSSProperties = {
        position: (position as React.CSSProperties["position"]) || "relative",
        left, top, right, bottom, transform, zIndex,
        marginTop, marginLeft, marginRight, marginBottom,
        display: "inline-block", 
        width: "fit-content",
        userSelect: "none",
        boxSizing: "border-box",
        verticalAlign: "top",
    };

    const ref = (element: HTMLElement | null) => registerElement(id, element);
    const stop = (e: React.MouseEvent) => e.stopPropagation();
    const select = () => dispatch({ type: "SELECT_NODE", payload: id });
    const hover = () => dispatch({ type: "SET_HOVER", payload: id });
    const unhover = () => dispatch({ type: "SET_HOVER", payload: null });
    const wrapChildren = () => children.map((childId) => renderNode(childId, tree, selectedNodeId));

    const preventDrag = (e: React.DragEvent) => e.preventDefault();
    const commonProps = {
        draggable: false,
        onDragStart: preventDrag,
        style: contentStyle
    };

    let el: React.ReactNode;

    switch (node.type) {
        case "text": {
            const isEditing = useEditorStore.getState().isEditingText === id;
            if (isEditing) {
                el = (
                    <span
                        contentEditable
                        suppressContentEditableWarning
                        style={contentStyle}
                        onBlur={(e) => {
                            const value = e.currentTarget.innerText;
                            dispatch({ type: "UPDATE_NODE", payload: { ...node, props: { ...node.props, text: value } } });
                            dispatch({ type: "SET_EDITING_TEXT", payload: null });
                        }}
                        ref={ref}
                    >
                        {node.props.text}
                    </span>
                );
                break;
            }
            el = (
                <span 
                    {...commonProps} 
                    onDoubleClick={() => dispatch({type: "SET_EDITING_TEXT", payload: id})}
                >
                    {node.props.text}
                </span>
            );
            break;
        }
        
        case "image": el = <img src={node.props.src} alt={node.props.alt ?? ""} {...commonProps} />; break;
        case "video": el = (
            <video
                src={node.props.src}
                controls={node.props.controls ?? true}
                autoPlay={node.props.autoplay ?? false}
                loop={node.props.loop ?? false}
                muted={node.props.muted ?? false}
                {...commonProps}
            />
        ); break;
        case "input": el = (
            <input
                type={node.props.inputType ?? "text"}
                value={node.props.value ?? ""}
                placeholder={node.props.placeholder}
                onChange={(e) => {
                    dispatch({
                        type: "UPDATE_NODE",
                        payload: { ...node, props: { ...node.props, value: e.target.value } },
                    });
                }}
                {...commonProps}
            />
        ); break;
        case "button": el = <button onClick={(e) => e.preventDefault()} {...commonProps}>{wrapChildren()}</button>; break;
        case "link": el = (
            <a
                href={node.props.href}
                target={node.props.target ?? "_self"}
                onClick={(e) => e.preventDefault()}
                {...commonProps}
            >
                {wrapChildren()}
            </a>
        ); break;
        case "element": el = React.createElement(node.props.tag, { ...commonProps }, wrapChildren()); break;

        case "component": {
            const resolved = resolveComponentInstance(node as ComponentInstanceNode);
            if (!resolved) {
                el = <div style={{ border: "2px dashed red", padding: 8, color: "red", fontSize: 12 }}>Missing component</div>;
            } else {
                // Render the resolved component subtree inline
                const renderResolved = (nodeId: NodeId, nodes: Record<string, import("../Schema/Node.ts").AnyNode>): React.ReactNode => {
                    const n = nodes[nodeId];
                    if (!n) return null;
                    const childContent = n.childrenIds.map((cid) => renderResolved(cid, nodes));
                    const tag = n.type === "text" ? "span" : n.type === "image" ? "img" : n.type === "container" ? "div" : "div";
                    if (n.type === "text") return <span key={n.id} style={n.props.style}>{n.props.text as string}{childContent}</span>;
                    if (n.type === "image") return <img key={n.id} src={n.props.src as string} alt={(n.props.alt as string) ?? ""} style={n.props.style} />;
                    return React.createElement(tag, { key: n.id, style: n.props.style }, childContent);
                };
                el = <div {...commonProps}>{renderResolved(resolved.rootNodeId, resolved.nodes)}</div>;
            }
            break;
        }

        case "container":
            el = <div {...commonProps}>{wrapChildren()}</div>;
            break;

        default: {
            const nodeType = (node as import("../Schema/Node.ts").AnyNode).type;
            const customDef = useCustomNodeRegistry.getState().customTypes[nodeType];
            if (customDef) {
                const CustomRenderer = customDef.renderer;
                el = <CustomRenderer node={node as import("../Schema/Node.ts").AnyNode}>{wrapChildren()}</CustomRenderer>;
            } else {
                el = <div {...commonProps}>{wrapChildren()}</div>;
            }
            break;
        }
    }

    return (
        <div
            ref={ref}
            onClick={(e) => { stop(e); select(); }}
            onMouseEnter={(e) => { stop(e); hover(); }}
            onMouseLeave={(e) => { stop(e); unhover(); }}
            onMouseMove={(e) => {
                const store = useEditorStore.getState();
                if (!store.draggingNodeId || store.draggingNodeId === id) return;
                const el = useElementRegistry.getState().getElement(id);
                if (!el) return;
                const rect = el.getBoundingClientRect();
                let position: "before" | "after" | "inside";
                if (e.clientY < rect.top + 10) position = "before";
                else if (e.clientY > rect.bottom - 10) position = "after";
                else position = "inside";
                store.dispatch({ type: "SET_DRAG_OVER", payload: { nodeId: id, position }});
            }}
            onMouseUp={() => {
                const store = useEditorStore.getState();
                const dragging = store.draggingNodeId;
                const over = store.dragOverNodeId;
                const pos = store.dragPosition;
                if (dragging && over && pos) reorderNode(dragging, over, pos);
                store.dispatch({ type: "CLEAR_DRAG" });
            }}
            
            style={wrapperStyle}
        >
            {el}
            {isSelected && <SelectionControls nodeId={id} />}
        </div>
    );
}