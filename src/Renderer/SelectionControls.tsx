// src/Renderer/SelectionControls.tsx
import React, { useEffect, useState } from "react";
import { useEditorStore } from "../Editor/EditorState.ts";
import { useElementRegistry } from "./hooks/useElementRegistry.ts";
import type { AnyNode } from "../Schema/Node.ts";
import { computeSnap } from "./hooks/useSnapEngine.ts";

const VISIBLE_SIZE = 10;
const HIT_AREA_SIZE = 20;
const BORDER_COLOR = "#0d99ff";
const DRAG_THRESHOLD = 3;

type HandlePosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top" | "bottom" | "left" | "right";

function getCursor(position: HandlePosition): string {
    const cursors: Record<HandlePosition, string> = {
        "top-left": "nwse-resize",
        "top-right": "nesw-resize",
        "bottom-left": "nesw-resize",
        "bottom-right": "nwse-resize",
        "top": "ns-resize",
        "bottom": "ns-resize",
        "left": "ew-resize",
        "right": "ew-resize",
    };
    return cursors[position];
}

function getHitAreaPosition(pos: HandlePosition, visibleSize: number, hitSize: number): React.CSSProperties {
    const offset = -(visibleSize / 2) - ((hitSize - visibleSize) / 2);
    const styles: Record<HandlePosition, React.CSSProperties> = {
        "top-left": { top: offset, left: offset },
        "top-right": { top: offset, right: offset },
        "bottom-left": { bottom: offset, left: offset },
        "bottom-right": { bottom: offset, right: offset },
        "top": { top: offset, left: "50%", transform: "translateX(-50%)" },
        "bottom": { bottom: offset, left: "50%", transform: "translateX(-50%)" },
        "left": { left: offset, top: "50%", transform: "translateY(-50%)" },
        "right": { right: offset, top: "50%", transform: "translateY(-50%)" },
    };
    return styles[pos];
}

function ResizeHandle({ position, onMouseDown }: { position: HandlePosition; onMouseDown: (e: React.MouseEvent) => void }) {
    return (
        <div
            onMouseDown={onMouseDown}
            style={{
                position: "absolute",
                width: HIT_AREA_SIZE,
                height: HIT_AREA_SIZE,
                ...getHitAreaPosition(position, VISIBLE_SIZE, HIT_AREA_SIZE),
                cursor: getCursor(position),
                pointerEvents: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 50,
            }}
        >
            <div style={{
                width: VISIBLE_SIZE,
                height: VISIBLE_SIZE,
                backgroundColor: BORDER_COLOR,
                border: "2px solid white",
                borderRadius: "2px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
            }} />
        </div>
    );
}

function getOtherRects(excludeId: string) {
    const registry = useElementRegistry.getState();
    const tree = useEditorStore.getState().documentTree;
    const rects: { id: string; rect: DOMRect }[] = [];
    for (const id of Object.keys(tree.nodes)) {
        if (id === excludeId) continue;
        const el = registry.getElement(id);
        if (el) rects.push({ id, rect: el.getBoundingClientRect() });
    }
    return rects;
}

export function SelectionControls({ nodeId }: { nodeId: string }) {
    const getElement = useElementRegistry((s) => s.getElement);
    const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
    const [paddings, setPaddings] = useState<string>("0px");
    const [margins, setMargins] = useState<{ top: number; right: number; bottom: number; left: number }>({ top: 0, right: 0, bottom: 0, left: 0 });

    useEffect(() => {
        const wrapper = getElement(nodeId);
        if (!wrapper) return;

        const target = wrapper.firstElementChild as HTMLElement || wrapper;
        const updateBoxModel = () => {
            const computed = window.getComputedStyle(target);
            const p = `${computed.paddingTop} ${computed.paddingRight} ${computed.paddingBottom} ${computed.paddingLeft}`;
            setPaddings(p);

            const wrapperComputed = window.getComputedStyle(wrapper);
            setMargins({
                top: parseFloat(wrapperComputed.marginTop) || 0,
                right: parseFloat(wrapperComputed.marginRight) || 0,
                bottom: parseFloat(wrapperComputed.marginBottom) || 0,
                left: parseFloat(wrapperComputed.marginLeft) || 0,
            });
        };
        updateBoxModel();
        window.addEventListener("resize", updateBoxModel);
        return () => { window.removeEventListener("resize", updateBoxModel); };
    }, [nodeId, getElement]);

    useEffect(() => {
        const el = getElement(nodeId);
        if (!el) return;

        const handleMouseDown = (e: MouseEvent) => {
            if ((e.target as HTMLElement).closest('input, textarea, [contenteditable="true"]')) return;
            if (e.defaultPrevented) return;

            const startX = e.clientX;
            const startY = e.clientY;
            let isDragging = false;

            const computed = window.getComputedStyle(el);
            let startLeft = parseFloat(computed.left);
            let startTop = parseFloat(computed.top);

            if (computed.position === 'static') {
                startLeft = 0;
                startTop = 0;
            } else {
                if (isNaN(startLeft)) startLeft = 0;
                if (isNaN(startTop)) startTop = 0;
            }

            const onMouseMove = (moveEvent: MouseEvent) => {
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;

                if (!isDragging) {
                    if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return;
                    isDragging = true;
                    if (computed.position === 'static') {
                        el.style.position = 'relative';
                    }
                    moveEvent.preventDefault();
                }

                const proposedLeft = startLeft + dx;
                const proposedTop = startTop + dy;
                const rect = el.getBoundingClientRect();
                const otherRects = getOtherRects(nodeId);
                const snap = computeSnap(
                    { left: rect.left + (proposedLeft - startLeft - (parseFloat(el.style.left) || 0) + startLeft), top: rect.top + (proposedTop - startTop - (parseFloat(el.style.top) || 0) + startTop), width: rect.width, height: rect.height },
                    otherRects
                );

                const snapDx = snap.snappedX - (rect.left + (proposedLeft - (parseFloat(el.style.left) || 0)));
                const snapDy = snap.snappedY - (rect.top + (proposedTop - (parseFloat(el.style.top) || 0)));

                el.style.left = `${proposedLeft + snapDx}px`;
                el.style.top = `${proposedTop + snapDy}px`;
                useEditorStore.getState().dispatch({ type: "SET_SNAP_GUIDES", payload: snap.guides });
            };

            const onMouseUp = () => {
                window.removeEventListener("mousemove", onMouseMove);
                window.removeEventListener("mouseup", onMouseUp);
                useEditorStore.getState().dispatch({ type: "SET_SNAP_GUIDES", payload: [] });

                if (isDragging) {
                    const store = useEditorStore.getState();
                    const node = store.documentTree.nodes[nodeId];
                    store.dispatch({
                        type: "UPDATE_NODE",
                        payload: {
                            ...node,
                            props: {
                                ...node.props,
                                style: { ...node.props.style, position: el.style.position as unknown, left: el.style.left, top: el.style.top },
                            },
                        } as AnyNode,
                    });
                }
            };
            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
        };
        el.addEventListener("mousedown", handleMouseDown);
        return () => { el.removeEventListener("mousedown", handleMouseDown); };
    }, [nodeId, getElement]);

    const handleSizeStart = (e: React.MouseEvent, position: HandlePosition) => {
        e.preventDefault();
        e.stopPropagation();

        const wrapper = getElement(nodeId);
        if (!wrapper) return;

        const target = wrapper.firstElementChild as HTMLElement || wrapper;
        const startRect = target.getBoundingClientRect();

        const wrapperRect = wrapper.getBoundingClientRect();
        setDimensions({ width: wrapperRect.width, height: wrapperRect.height });
        
        const startX = e.clientX;
        const startY = e.clientY;
        const computed = window.getComputedStyle(wrapper);
        let startLeft = parseFloat(computed.left);
        let startTop = parseFloat(computed.top);

        if (computed.position === 'static') {
            wrapper.style.position = 'relative';
            startLeft = 0;
            startTop = 0;
        } else {
            if (isNaN(startLeft)) startLeft = 0;
            if (isNaN(startTop)) startTop = 0;
        }

        const onMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            let newWidth = startRect.width;
            let newHeight = startRect.height;
            let newLeft = startLeft;
            let newTop = startTop;

            if (position.includes("right")) newWidth = Math.max(0, startRect.width + dx);
            if (position.includes("left")) {
                const rawWidth = startRect.width - dx;
                newWidth = Math.max(0, rawWidth);
                const widthChange = startRect.width - newWidth;
                newLeft = startLeft + widthChange;
            }
            if (position.includes("bottom")) newHeight = Math.max(0, startRect.height + dy);
            if (position.includes("top")) {
                const rawHeight = startRect.height - dy;
                newHeight = Math.max(0, rawHeight);
                const heightChange = startRect.height - newHeight;
                newTop = startTop + heightChange;
            }

            const otherRects = getOtherRects(nodeId);
            const wrapperCurRect = wrapper.getBoundingClientRect();
            const proposedRect = {
                left: wrapperCurRect.left + (newLeft - startLeft),
                top: wrapperCurRect.top + (newTop - startTop),
                width: newWidth,
                height: newHeight,
            };
            const snap = computeSnap(proposedRect, otherRects);
            useEditorStore.getState().dispatch({ type: "SET_SNAP_GUIDES", payload: snap.guides });

            target.style.width = `${newWidth}px`;
            target.style.height = `${newHeight}px`;
            wrapper.style.left = `${newLeft}px`;
            wrapper.style.top = `${newTop}px`;
            setDimensions({width: Math.round(newWidth), height: Math.round(newHeight) });
        };

        const onMouseUp = () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            setDimensions(null);
            useEditorStore.getState().dispatch({ type: "SET_SNAP_GUIDES", payload: [] });
            const store = useEditorStore.getState();
            const originalNode = store.documentTree.nodes[nodeId];
            if (!originalNode) return;
            const finalRect = target.getBoundingClientRect();

            store.dispatch({
                type: "UPDATE_NODE",
                payload: {
                    ...originalNode,
                    props: {
                        ...originalNode.props,
                        style: {
                            ...(originalNode.props?.style || {}),
                            width: `${finalRect.width}px`,
                            height: `${finalRect.height}px`,
                            position: wrapper.style.position as unknown,
                            left: wrapper.style.left,
                            top: wrapper.style.top,
                        },
                    },
                } as AnyNode,
            });
        };
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    };

    return (
        <>
        {/* Margin overlay - positioned outside the wrapper bounds */}
        {(margins.top > 0 || margins.right > 0 || margins.bottom > 0 || margins.left > 0) && (
            <div style={{
                position: "absolute",
                top: -margins.top,
                left: -margins.left,
                right: -margins.right,
                bottom: -margins.bottom,
                borderTop: margins.top > 0 ? `${margins.top}px solid rgba(255, 165, 0, 0.3)` : "none",
                borderRight: margins.right > 0 ? `${margins.right}px solid rgba(255, 165, 0, 0.3)` : "none",
                borderBottom: margins.bottom > 0 ? `${margins.bottom}px solid rgba(255, 165, 0, 0.3)` : "none",
                borderLeft: margins.left > 0 ? `${margins.left}px solid rgba(255, 165, 0, 0.3)` : "none",
                pointerEvents: "none",
                zIndex: 998,
                boxSizing: "border-box",
            }} />
        )}
        {/* Padding overlay + resize handles */}
        <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            borderWidth: paddings,
            borderColor: "rgba(75, 255, 100, 0.3)",
            borderStyle: "solid",
            pointerEvents: "none",
            zIndex: 999,
            boxSizing: "border-box",
        }}>
            <ResizeHandle position="top-left" onMouseDown={(e) => handleSizeStart(e, "top-left")} />
            <ResizeHandle position="top-right" onMouseDown={(e) => handleSizeStart(e, "top-right")} />
            <ResizeHandle position="bottom-left" onMouseDown={(e) => handleSizeStart(e, "bottom-left")} />
            <ResizeHandle position="bottom-right" onMouseDown={(e) => handleSizeStart(e, "bottom-right")} />
            <ResizeHandle position="top" onMouseDown={(e) => handleSizeStart(e, "top")} />
            <ResizeHandle position="bottom" onMouseDown={(e) => handleSizeStart(e, "bottom")} />
            <ResizeHandle position="left" onMouseDown={(e) => handleSizeStart(e, "left")} />
            <ResizeHandle position="right" onMouseDown={(e) => handleSizeStart(e, "right")} />
            {dimensions && (
                <div style={{
                    position: "absolute",
                    bottom: -32,
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#0d99ff",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "4px 8px",
                    borderRadius: "4px",
                    whiteSpace: "nowrap",
                    zIndex: 100,
                    pointerEvents: "none",
                }}>
                    {dimensions.width} × {dimensions.height}
                </div>
            )}
        </div>
        </>
    );
}