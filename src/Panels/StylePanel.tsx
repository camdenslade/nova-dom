// src/Panels/StylePanel.tsx
import type React from "react";
import { useState } from "react";
import { useEditorStore } from "../Editor/EditorState.ts";
import type { AnyNode } from "../Schema/Node.ts";
import { SizeSection } from "./sections/SizeSection.tsx";
import { LayoutSection } from "./sections/LayoutSection.tsx";
import { SpacingSection } from "./sections/SpacingSection.tsx";
import { TypographySection } from "./sections/TypographySection.tsx";
import { BackgroundSection } from "./sections/BackgroundSection.tsx";
import { BorderSection } from "./sections/BorderSection.tsx";
import { usePluginManager } from "../Plugin/PluginManager.ts";

export interface SectionProps {
    style: React.CSSProperties | undefined;
    onChange: (updates: Partial<React.CSSProperties>) => void;
}

const TEXT_TYPES = new Set(["text", "button", "link", "input"]);

function SectionHeader({ title, open, onToggle }: { title: string; open: boolean; onToggle: () => void }) {
    return (
        <div
            onClick={onToggle}
            style={{
                padding: "8px 0",
                fontSize: "11px",
                fontWeight: 600,
                color: "#ccc",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #333",
                userSelect: "none",
            }}
        >
            {title}
            <span style={{ fontSize: "10px", color: "#666" }}>{open ? "\u25B2" : "\u25BC"}</span>
        </div>
    );
}

function CollapsibleSection({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div>
            <SectionHeader title={title} open={open} onToggle={() => setOpen(!open)} />
            {open && <div style={{ padding: "8px 0" }}>{children}</div>}
        </div>
    );
}

export function StylePanel() {
    const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
    const node = useEditorStore((s) =>
        s.selectedNodeId ? s.documentTree.nodes[s.selectedNodeId] : null
    );
    const pluginSections = usePluginManager((s) => s.panelSections);

    if (!node || !selectedNodeId) return null;

    const updateStyle = (updates: Partial<React.CSSProperties>) => {
        useEditorStore.getState().dispatch({
            type: "UPDATE_NODE",
            payload: {
                ...node,
                props: { ...node.props, style: { ...node.props.style, ...updates } },
            } as AnyNode,
        });
    };

    const style = node.props.style;
    const showTypography = TEXT_TYPES.has(node.type);

    return (
        <div
            style={{
                width: 260,
                backgroundColor: "#1e1e1e",
                borderLeft: "1px solid #333",
                overflowY: "auto",
                color: "#ccc",
                fontSize: 12,
                padding: "0 12px",
                flexShrink: 0,
            }}
        >
            <div style={{ padding: "10px 0 4px", fontSize: "13px", fontWeight: 600, color: "#fff", borderBottom: "1px solid #444" }}>
                {node.type.charAt(0).toUpperCase() + node.type.slice(1)}
                <span style={{ color: "#666", fontWeight: 400, marginLeft: 6, fontSize: 11 }}>#{node.id}</span>
            </div>

            <CollapsibleSection title="Size">
                <SizeSection style={style} onChange={updateStyle} />
            </CollapsibleSection>

            <CollapsibleSection title="Layout">
                <LayoutSection style={style} onChange={updateStyle} />
            </CollapsibleSection>

            <CollapsibleSection title="Spacing">
                <SpacingSection style={style} onChange={updateStyle} />
            </CollapsibleSection>

            {showTypography && (
                <CollapsibleSection title="Typography">
                    <TypographySection style={style} onChange={updateStyle} />
                </CollapsibleSection>
            )}

            <CollapsibleSection title="Background">
                <BackgroundSection style={style} onChange={updateStyle} />
            </CollapsibleSection>

            <CollapsibleSection title="Border">
                <BorderSection style={style} onChange={updateStyle} />
            </CollapsibleSection>

            {pluginSections.map((section) => (
                <CollapsibleSection key={section.id} title={section.title}>
                    <section.component />
                </CollapsibleSection>
            ))}
        </div>
    );
}
