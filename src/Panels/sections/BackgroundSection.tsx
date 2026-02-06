// src/Panels/sections/BackgroundSection.tsx
import { ColorPicker } from "../shared/ColorPicker.tsx";
import { PropertyInput } from "../shared/PropertyInput.tsx";
import { SelectInput } from "../shared/SelectInput.tsx";
import type { SectionProps } from "../StylePanel.tsx";

const bgSizeOptions = [
    { label: "Auto", value: "auto" },
    { label: "Cover", value: "cover" },
    { label: "Contain", value: "contain" },
];

const bgRepeatOptions = [
    { label: "Repeat", value: "repeat" },
    { label: "No Repeat", value: "no-repeat" },
    { label: "Repeat X", value: "repeat-x" },
    { label: "Repeat Y", value: "repeat-y" },
];

export function BackgroundSection({ style, onChange }: SectionProps) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <ColorPicker label="Color" value={style?.backgroundColor as string} onChange={(v) => onChange({ backgroundColor: v })} />
            <PropertyInput label="Image URL" value={style?.backgroundImage as string} onChange={(v) => onChange({ backgroundImage: v ? `url(${v})` : undefined })} placeholder="https://..." />
            <SelectInput label="Size" value={style?.backgroundSize as string} options={bgSizeOptions} onChange={(v) => onChange({ backgroundSize: v })} />
            <SelectInput label="Repeat" value={style?.backgroundRepeat as string} options={bgRepeatOptions} onChange={(v) => onChange({ backgroundRepeat: v })} />
            <PropertyInput label="Position" value={style?.backgroundPosition as string} onChange={(v) => onChange({ backgroundPosition: v || undefined })} placeholder="center" />
        </div>
    );
}
