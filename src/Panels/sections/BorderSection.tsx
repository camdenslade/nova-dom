// src/Panels/sections/BorderSection.tsx
import { PropertyInput } from "../shared/PropertyInput.tsx";
import { ColorPicker } from "../shared/ColorPicker.tsx";
import { SelectInput } from "../shared/SelectInput.tsx";
import type { SectionProps } from "../StylePanel.tsx";

const borderStyleOptions = [
    { label: "None", value: "none" },
    { label: "Solid", value: "solid" },
    { label: "Dashed", value: "dashed" },
    { label: "Dotted", value: "dotted" },
    { label: "Double", value: "double" },
];

export function BorderSection({ style, onChange }: SectionProps) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                <PropertyInput label="Width" value={style?.borderWidth as string} onChange={(v) => onChange({ borderWidth: v || undefined })} placeholder="0" />
                <SelectInput label="Style" value={style?.borderStyle as string} options={borderStyleOptions} onChange={(v) => onChange({ borderStyle: v })} />
            </div>
            <ColorPicker label="Color" value={style?.borderColor as string} onChange={(v) => onChange({ borderColor: v })} />
            <PropertyInput label="Radius" value={style?.borderRadius as string} onChange={(v) => onChange({ borderRadius: v || undefined })} placeholder="0" />
        </div>
    );
}
