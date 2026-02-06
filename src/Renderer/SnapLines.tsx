// src/Renderer/SnapLines.tsx
import { useEditorStore } from "../Editor/EditorState.ts";

export function SnapLines() {
    const guides = useEditorStore((s) => s.snapGuides);

    if (guides.length === 0) return null;

    return (
        <>
            {guides.map((g, i) => (
                <div
                    key={i}
                    style={{
                        position: "fixed",
                        backgroundColor: "#ff00ff",
                        pointerEvents: "none",
                        zIndex: 9998,
                        ...(g.axis === "vertical"
                            ? { left: g.position, top: g.start, width: 1, height: g.end - g.start }
                            : { top: g.position, left: g.start, height: 1, width: g.end - g.start }),
                    }}
                />
            ))}
        </>
    );
}
