// src/Panels/sections/LayoutSection.tsx
import { SelectInput } from "../shared/SelectInput.tsx";
import { PropertyInput } from "../shared/PropertyInput.tsx";
import type { SectionProps } from "../StylePanel.tsx";

const displayOptions = [
    { label: "Block", value: "block" },
    { label: "Flex", value: "flex" },
    { label: "Grid", value: "grid" },
    { label: "Inline Block", value: "inline-block" },
    { label: "Inline", value: "inline" },
    { label: "None", value: "none" },
];

const flexDirectionOptions = [
    { label: "Row", value: "row" },
    { label: "Column", value: "column" },
    { label: "Row Reverse", value: "row-reverse" },
    { label: "Column Reverse", value: "column-reverse" },
];

const justifyOptions = [
    { label: "Start", value: "flex-start" },
    { label: "Center", value: "center" },
    { label: "End", value: "flex-end" },
    { label: "Between", value: "space-between" },
    { label: "Around", value: "space-around" },
    { label: "Evenly", value: "space-evenly" },
];

const alignOptions = [
    { label: "Stretch", value: "stretch" },
    { label: "Start", value: "flex-start" },
    { label: "Center", value: "center" },
    { label: "End", value: "flex-end" },
    { label: "Baseline", value: "baseline" },
];

const wrapOptions = [
    { label: "No Wrap", value: "nowrap" },
    { label: "Wrap", value: "wrap" },
    { label: "Wrap Reverse", value: "wrap-reverse" },
];

export function LayoutSection({ style, onChange }: SectionProps) {
    const display = (style?.display as string) ?? "block";
    const isFlex = display === "flex" || display === "inline-flex";
    const isGrid = display === "grid";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <SelectInput label="Display" value={display} options={displayOptions} onChange={(v) => onChange({ display: v })} />
            {isFlex && (
                <>
                    <SelectInput label="Direction" value={style?.flexDirection as string} options={flexDirectionOptions} onChange={(v) => onChange({ flexDirection: v as React.CSSProperties["flexDirection"] })} />
                    <SelectInput label="Justify" value={style?.justifyContent as string} options={justifyOptions} onChange={(v) => onChange({ justifyContent: v })} />
                    <SelectInput label="Align" value={style?.alignItems as string} options={alignOptions} onChange={(v) => onChange({ alignItems: v })} />
                    <SelectInput label="Wrap" value={style?.flexWrap as string} options={wrapOptions} onChange={(v) => onChange({ flexWrap: v as React.CSSProperties["flexWrap"] })} />
                    <PropertyInput label="Gap" value={style?.gap as string} onChange={(v) => onChange({ gap: v || undefined })} />
                </>
            )}
            {isGrid && (
                <>
                    <PropertyInput label="Columns" value={style?.gridTemplateColumns as string} onChange={(v) => onChange({ gridTemplateColumns: v || undefined })} placeholder="1fr 1fr" />
                    <PropertyInput label="Rows" value={style?.gridTemplateRows as string} onChange={(v) => onChange({ gridTemplateRows: v || undefined })} />
                    <PropertyInput label="Gap" value={style?.gap as string} onChange={(v) => onChange({ gap: v || undefined })} />
                </>
            )}
        </div>
    );
}
