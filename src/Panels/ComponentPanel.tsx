// src/Panels/ComponentPanel.tsx
import { useState } from "react";
import { useComponentRegistry } from "../Editor/ComponentRegistry.ts";
import { useEditorStore } from "../Editor/EditorState.ts";
import { saveAsComponent, instantiateComponent } from "../Editor/componentFunctions.ts";

const btnStyle: React.CSSProperties = {
    padding: "6px 10px",
    backgroundColor: "#3a3a3a",
    border: "1px solid #555",
    borderRadius: "4px",
    color: "#ccc",
    fontSize: "11px",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
};

export function ComponentPanel() {
    const components = useComponentRegistry((s) => s.components);
    const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
    const tree = useEditorStore((s) => s.documentTree);
    const [isOpen, setIsOpen] = useState(true);

    const componentList = Object.values(components);

    const handleSave = () => {
        if (!selectedNodeId || selectedNodeId === tree.root) return;
        const name = `Component ${componentList.length + 1}`;
        saveAsComponent(selectedNodeId, name);
    };

    const handleInstantiate = (componentId: string) => {
        const parentId = selectedNodeId ?? tree.root;
        const newId = instantiateComponent(componentId, parentId);
        if (newId) {
            useEditorStore.getState().dispatch({ type: "SELECT_NODE", payload: newId });
        }
    };

    return (
        <div
            style={{
                position: "absolute",
                top: 12,
                left: 12,
                width: 200,
                backgroundColor: "#1e1e1e",
                border: "1px solid #444",
                borderRadius: "6px",
                zIndex: 1000,
                boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                overflow: "hidden",
            }}
        >
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: "8px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: isOpen ? "1px solid #333" : "none",
                    userSelect: "none",
                }}
            >
                Components
                <span style={{ fontSize: "10px", color: "#666" }}>{isOpen ? "\u25B2" : "\u25BC"}</span>
            </div>

            {isOpen && (
                <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {selectedNodeId && selectedNodeId !== tree.root && (
                        <button onClick={handleSave} style={{ ...btnStyle, backgroundColor: "#0d99ff", border: "none", color: "#fff", textAlign: "center" }}>
                            Save Selection as Component
                        </button>
                    )}

                    {componentList.length === 0 && (
                        <div style={{ fontSize: "11px", color: "#666", padding: "4px 0" }}>
                            No components yet. Select an element and save it as a component.
                        </div>
                    )}

                    {componentList.map((comp) => (
                        <button
                            key={comp.id}
                            onClick={() => handleInstantiate(comp.id)}
                            style={btnStyle}
                        >
                            {comp.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
