// src/Panels/sections/TypographySection.tsx
import { PropertyInput } from "../shared/PropertyInput.tsx";
import { ColorPicker } from "../shared/ColorPicker.tsx";
import { SelectInput } from "../shared/SelectInput.tsx";
import type { SectionProps } from "../StylePanel.tsx";

const fontWeightOptions = [
    { label: "Normal", value: "400" },
    { label: "Medium", value: "500" },
    { label: "Semi Bold", value: "600" },
    { label: "Bold", value: "700" },
    { label: "Extra Bold", value: "800" },
    { label: "Light", value: "300" },
];

const textAlignOptions = [
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
    { label: "Right", value: "right" },
    { label: "Justify", value: "justify" },
];

const textDecorationOptions = [
    { label: "None", value: "none" },
    { label: "Underline", value: "underline" },
    { label: "Line Through", value: "line-through" },
    { label: "Overline", value: "overline" },
];

const textTransformOptions = [
    { label: "None", value: "none" },
    { label: "Uppercase", value: "uppercase" },
    { label: "Lowercase", value: "lowercase" },
    { label: "Capitalize", value: "capitalize" },
];

export function TypographySection({ style, onChange }: SectionProps) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <PropertyInput label="Font Family" value={style?.fontFamily as string} onChange={(v) => onChange({ fontFamily: v || undefined })} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                <PropertyInput label="Size" value={style?.fontSize as string} onChange={(v) => onChange({ fontSize: v || undefined })} />
                <SelectInput label="Weight" value={String(style?.fontWeight ?? "400")} options={fontWeightOptions} onChange={(v) => onChange({ fontWeight: v })} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                <PropertyInput label="Line Height" value={style?.lineHeight as string} onChange={(v) => onChange({ lineHeight: v || undefined })} />
                <PropertyInput label="Letter Spacing" value={style?.letterSpacing as string} onChange={(v) => onChange({ letterSpacing: v || undefined })} />
            </div>
            <SelectInput label="Align" value={style?.textAlign as string} options={textAlignOptions} onChange={(v) => onChange({ textAlign: v as React.CSSProperties["textAlign"] })} />
            <SelectInput label="Decoration" value={style?.textDecoration as string} options={textDecorationOptions} onChange={(v) => onChange({ textDecoration: v })} />
            <SelectInput label="Transform" value={style?.textTransform as string} options={textTransformOptions} onChange={(v) => onChange({ textTransform: v })} />
            <ColorPicker label="Color" value={style?.color as string} onChange={(v) => onChange({ color: v })} />
        </div>
    );
}
