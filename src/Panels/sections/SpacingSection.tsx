// src/Panels/sections/SpacingSection.tsx
import { PropertyInput } from "../shared/PropertyInput.tsx";
import type { SectionProps } from "../StylePanel.tsx";

export function SpacingSection({ style, onChange }: SectionProps) {
    const update = (key: string, value: string) => {
        const normalized = /^\d+$/.test(value) ? `${value}px` : value;
        onChange({ [key]: normalized || undefined });
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "10px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Margin</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                <PropertyInput label="Top" value={style?.marginTop as string} onChange={(v) => update("marginTop", v)} placeholder="0" />
                <PropertyInput label="Right" value={style?.marginRight as string} onChange={(v) => update("marginRight", v)} placeholder="0" />
                <PropertyInput label="Bottom" value={style?.marginBottom as string} onChange={(v) => update("marginBottom", v)} placeholder="0" />
                <PropertyInput label="Left" value={style?.marginLeft as string} onChange={(v) => update("marginLeft", v)} placeholder="0" />
            </div>
            <div style={{ fontSize: "10px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Padding</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                <PropertyInput label="Top" value={style?.paddingTop as string} onChange={(v) => update("paddingTop", v)} placeholder="0" />
                <PropertyInput label="Right" value={style?.paddingRight as string} onChange={(v) => update("paddingRight", v)} placeholder="0" />
                <PropertyInput label="Bottom" value={style?.paddingBottom as string} onChange={(v) => update("paddingBottom", v)} placeholder="0" />
                <PropertyInput label="Left" value={style?.paddingLeft as string} onChange={(v) => update("paddingLeft", v)} placeholder="0" />
            </div>
        </div>
    );
}
