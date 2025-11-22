// src/Renderer/renderNode.tsx
import React from "react";
import type { NodeId } from "../Schema/Node.ts";
import type { DocumentTree } from "../Schema/DocumentTree.ts";
import { useEditorStore } from "../Editor/EditorState.ts";
import { useElementRegistry } from "./hooks/useElementRegistry.ts";
import { reorderNode } from "../Editor/reorderNode.ts";

export function renderNode(id: NodeId, tree: DocumentTree): React.ReactNode {
    const node = tree.nodes[id];
    if (!node) return null;

    const { registerElement } = useElementRegistry.getState();
    const dispatch = useEditorStore.getState().dispatch;

    const children = node.childrenIds;
    const style = node.props.style;

    const ref = (element: HTMLElement | null) => registerElement(id, element);

    const stop = (e: React.MouseEvent) => e.stopPropagation();

    const select = () => dispatch({ type: "SELECT_NODE", payload: id });
    const hover = () => dispatch({ type: "SET_HOVER", payload: id });
    const unhover = () => dispatch({ type: "SET_HOVER", payload: null });

    const wrapChildren = () =>
        children.map((childId) => renderNode(childId, tree));

    let el: React.ReactNode;

    switch (node.type) {
        case "text": {
            const isEditing =
                useEditorStore.getState().isEditingText === id;

            if (isEditing) {
                el = (
                    <span
                        contentEditable
                        suppressContentEditableWarning
                        style={node.props.style}
                        onBlur={(e) => {
                            const value = e.currentTarget.innerText;
                            dispatch({
                                type: "UPDATE_NODE",
                                payload: {
                                    ...node,
                                    props: { ...node.props, text: value },
                                },
                            });
                            dispatch({ type: "SET_EDITING_TEXT", payload: null });
                        }}
                        onInput={(e) => {
                            const value = e.currentTarget.innerText;
                            dispatch({
                                type: "UPDATE_NODE",
                                payload: {
                                    ...node,
                                    props: { ...node.props, text: value },
                                },
                            });
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
                    style={node.props.style}
                    onDoubleClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: "SET_EDITING_TEXT", payload: id });
                    }}
                >
                    {node.props.text}
                </span>
            );
            break;
        }

        case "image":
            el = (
                <img
                    src={node.props.src}
                    alt={node.props.alt ?? ""}
                    style={style}
                />
            );
            break;

        case "video":
            el = (
                <video
                    src={node.props.src}
                    autoPlay={node.props.autoplay}
                    loop={node.props.loop}
                    controls={node.props.controls}
                    muted={node.props.muted}
                    style={style}
                />
            );
            break;

        case "input":
            el = (
                <input
                    style={style}
                    value={node.props.value ?? ""}
                    placeholder={node.props.placeholder}
                    type={node.props.inputType ?? "text"}
                />
            );
            break;

        case "button":
            el = <button style={style}>{wrapChildren()}</button>;
            break;

        case "link":
            el = (
                <a
                    href={node.props.href}
                    target={node.props.target}
                    style={style}
                >
                    {wrapChildren()}
                </a>
            );
            break;

        case "element":
            el = React.createElement(
                node.props.tag,
                { style },
                wrapChildren()
            );
            break;

        case "container":
        default:
            el = <div style={style}>{wrapChildren()}</div>;
            break;
    }

    return (
        <div
            ref={ref}
            onClick={(e) => {
                stop(e);
                select();
            }}
            onMouseEnter={(e) => {
                stop(e);
                hover();
            }}
            onMouseLeave={(e) => {
                stop(e);
                unhover();
            }}
            onMouseDown={(e) => {
                stop(e);
                const store = useEditorStore.getState();
                if (store.isEditingText) return;
                store.dispatch({ type: "SET_DRAGGING", payload: id });
            }}
            onMouseMove={(e) => {
                const store = useEditorStore.getState();
                if (!store.draggingNodeId) return;
                if (store.draggingNodeId === id) {
                    store.dispatch({
                        type: "SET_DRAG_OVER",
                        payload: { nodeId: null, position: null }
                    });
                    return;
                }
                const el = useElementRegistry.getState().getElement(id);
                if (!el) return;
                const rect = el.getBoundingClientRect();
                let position: "before" | "after" | "inside";
                if (e.clientY < rect.top + 6) position = "before";
                else if (e.clientY > rect.bottom - 6) position = "after";
                else position = "inside";
                store.dispatch({ type: "SET_DRAG_OVER", payload: { nodeId: id, position }});
            }}
            onMouseUp={() => {
                const store = useEditorStore.getState();
                const dragging = store.draggingNodeId;
                const over = store.dragOverNodeId;
                const pos = store.dragPosition;
                if (dragging && over && pos) {
                    reorderNode(dragging, over, pos);
                }
                store.dispatch({ type: "CLEAR_DRAG" });
            }}


            style={{ position: "relative" }}
        >
            {el}
        </div>
    );
}
