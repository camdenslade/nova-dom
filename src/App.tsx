// src/App.tsx
import { useState } from "react";
import { Renderer } from "./Renderer/Renderer.tsx";
import { SnapLines } from "./Renderer/SnapLines.tsx";
import { InlineToolbar } from "./Renderer/InlineToolbar.tsx";
import { StylePanel } from "./Panels/StylePanel.tsx";
import { ComponentPanel } from "./Panels/ComponentPanel.tsx";
import { ExportPanel } from "./Panels/ExportPanel.tsx";
import { useEditorStore } from "./Editor/EditorState.ts";
import { usePluginManager } from "./Plugin/PluginManager.ts";

export default function App() {
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const pluginToolbarItems = usePluginManager((s) => s.toolbarItems);
  const [showExport, setShowExport] = useState(false);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
        {/* Top Bar */}
        <div style={{
            height: "40px",
            backgroundColor: "#2b2b2b",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            fontSize: "13px",
            fontWeight: 500,
            borderBottom: "1px solid #000",
            flexShrink: 0,
            gap: "12px",
        }}>
            Nova Editor v1.0
            {pluginToolbarItems.filter((i) => i.position !== "right").map((item) => (
                <button key={item.id} onClick={item.onClick} style={{ padding: "4px 8px", backgroundColor: "#3a3a3a", border: "1px solid #555", borderRadius: "4px", color: "#ccc", fontSize: "12px", cursor: "pointer" }}>
                    {item.icon} {item.label}
                </button>
            ))}
            <button
                onClick={() => setShowExport(true)}
                style={{
                    marginLeft: "auto",
                    padding: "4px 12px",
                    backgroundColor: "#0d99ff",
                    border: "none",
                    borderRadius: "4px",
                    color: "#fff",
                    fontSize: "12px",
                    cursor: "pointer",
                }}
            >
                Export
            </button>
            {pluginToolbarItems.filter((i) => i.position === "right").map((item) => (
                <button key={item.id} onClick={item.onClick} style={{ padding: "4px 8px", backgroundColor: "#3a3a3a", border: "1px solid #555", borderRadius: "4px", color: "#ccc", fontSize: "12px", cursor: "pointer" }}>
                    {item.icon} {item.label}
                </button>
            ))}
            <span style={{ opacity: 0.5 }}>Ctrl+Z to Undo</span>
        </div>

        {/* Main Content: Canvas + Right Panel */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {/* Canvas Area */}
            <div style={{
                flex: 1,
                position: "relative",
                backgroundColor: "#f0f0f0",
                overflow: "auto"
            }}>
                <Renderer />
                <SnapLines />
                <InlineToolbar />
                <ComponentPanel />
            </div>

            {/* Right Style Panel */}
            {selectedNodeId && <StylePanel />}
        </div>

        {/* Export Modal */}
        {showExport && <ExportPanel onClose={() => setShowExport(false)} />}
    </div>
  );
}
