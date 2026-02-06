// src/Renderer/hooks/useSnapEngine.ts
import type { SnapGuide } from "../../Editor/EditorState.ts";

export interface SnapResult {
    guides: SnapGuide[];
    snappedX: number;
    snappedY: number;
}

interface RectInfo {
    id: string;
    rect: DOMRect;
}

const SNAP_THRESHOLD = 5;

export function computeSnap(
    movingRect: { left: number; top: number; width: number; height: number },
    otherRects: RectInfo[],
    threshold: number = SNAP_THRESHOLD
): SnapResult {
    const guides: SnapGuide[] = [];
    let snappedX = movingRect.left;
    let snappedY = movingRect.top;

    const movingRight = movingRect.left + movingRect.width;
    const movingCenterX = movingRect.left + movingRect.width / 2;
    const movingBottom = movingRect.top + movingRect.height;
    const movingCenterY = movingRect.top + movingRect.height / 2;

    let bestDx: number | null = null;
    let bestDy: number | null = null;
    let bestDxAbs = threshold + 1;
    let bestDyAbs = threshold + 1;

    for (const { rect } of otherRects) {
        const otherRight = rect.left + rect.width;
        const otherCenterX = rect.left + rect.width / 2;
        const otherBottom = rect.top + rect.height;
        const otherCenterY = rect.top + rect.height / 2;

        // Horizontal snap checks (X axis)
        const xChecks = [
            { moving: movingRect.left, other: rect.left },      // left-to-left
            { moving: movingRect.left, other: otherRight },      // left-to-right
            { moving: movingRight, other: rect.left },           // right-to-left
            { moving: movingRight, other: otherRight },          // right-to-right
            { moving: movingCenterX, other: otherCenterX },      // center-to-center
        ];

        for (const check of xChecks) {
            const diff = check.other - check.moving;
            const absDiff = Math.abs(diff);
            if (absDiff <= threshold && absDiff < bestDxAbs) {
                bestDx = diff;
                bestDxAbs = absDiff;
            }
        }

        // Vertical snap checks (Y axis)
        const yChecks = [
            { moving: movingRect.top, other: rect.top },         // top-to-top
            { moving: movingRect.top, other: otherBottom },      // top-to-bottom
            { moving: movingBottom, other: rect.top },           // bottom-to-top
            { moving: movingBottom, other: otherBottom },        // bottom-to-bottom
            { moving: movingCenterY, other: otherCenterY },      // center-to-center
        ];

        for (const check of yChecks) {
            const diff = check.other - check.moving;
            const absDiff = Math.abs(diff);
            if (absDiff <= threshold && absDiff < bestDyAbs) {
                bestDy = diff;
                bestDyAbs = absDiff;
            }
        }
    }

    if (bestDx !== null) {
        snappedX = movingRect.left + bestDx;
    }
    if (bestDy !== null) {
        snappedY = movingRect.top + bestDy;
    }

    // Build guide lines for the snapped positions
    const finalRight = snappedX + movingRect.width;
    const finalBottom = snappedY + movingRect.height;
    const finalCenterX = snappedX + movingRect.width / 2;
    const finalCenterY = snappedY + movingRect.height / 2;

    for (const { rect } of otherRects) {
        const otherRight = rect.left + rect.width;
        const otherCenterX = rect.left + rect.width / 2;
        const otherBottom = rect.top + rect.height;
        const otherCenterY = rect.top + rect.height / 2;

        // Vertical guide lines (X matches)
        const xPositions = [snappedX, finalRight, finalCenterX];
        const otherXPositions = [rect.left, otherRight, otherCenterX];

        for (const xp of xPositions) {
            for (const oxp of otherXPositions) {
                if (Math.abs(xp - oxp) < 1) {
                    const minY = Math.min(snappedY, rect.top);
                    const maxY = Math.max(finalBottom, otherBottom);
                    guides.push({
                        axis: "vertical",
                        position: Math.round(xp),
                        start: minY,
                        end: maxY,
                    });
                }
            }
        }

        // Horizontal guide lines (Y matches)
        const yPositions = [snappedY, finalBottom, finalCenterY];
        const otherYPositions = [rect.top, otherBottom, otherCenterY];

        for (const yp of yPositions) {
            for (const oyp of otherYPositions) {
                if (Math.abs(yp - oyp) < 1) {
                    const minX = Math.min(snappedX, rect.left);
                    const maxX = Math.max(finalRight, otherRight);
                    guides.push({
                        axis: "horizontal",
                        position: Math.round(yp),
                        start: minX,
                        end: maxX,
                    });
                }
            }
        }
    }

    // Deduplicate guides
    const unique = guides.filter((g, i, arr) =>
        arr.findIndex((o) => o.axis === g.axis && o.position === g.position) === i
    );

    return { guides: unique, snappedX, snappedY };
}
