// src/Panels/sections/SizeSection.tsx
import { PropertyInput } from "../shared/PropertyInput.tsx";
import type { SectionProps } from "../StylePanel.tsx";

export function SizeSection({ style, onChange }: SectionProps) {
    const update = (key: string, value: string) => {
        const normalized = /^\d+$/.test(value) ? `${value}px` : value;
        onChange({ [key]: normalized || undefined });
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            <PropertyInput label="Width" value={style?.width as string} onChange={(v) => update("width", v)} />
            <PropertyInput label="Height" value={style?.height as string} onChange={(v) => update("height", v)} />
            <PropertyInput label="Min W" value={style?.minWidth as string} onChange={(v) => update("minWidth", v)} placeholder="auto" />
            <PropertyInput label="Min H" value={style?.minHeight as string} onChange={(v) => update("minHeight", v)} placeholder="auto" />
            <PropertyInput label="Max W" value={style?.maxWidth as string} onChange={(v) => update("maxWidth", v)} placeholder="none" />
            <PropertyInput label="Max H" value={style?.maxHeight as string} onChange={(v) => update("maxHeight", v)} placeholder="none" />
        </div>
    );
}
