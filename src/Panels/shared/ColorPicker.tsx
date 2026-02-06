// src/Panels/shared/ColorPicker.tsx

interface ColorPickerProps {
    label: string;
    value: string | undefined;
    onChange: (value: string) => void;
}

const labelStyle: React.CSSProperties = {
    fontSize: "10px",
    color: "#888",
    marginBottom: "2px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
};

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
    const color = value || "#000000";

    return (
        <div>
            <div style={labelStyle}>{label}</div>
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        width: "28px",
                        height: "28px",
                        padding: 0,
                        border: "1px solid #555",
                        borderRadius: "3px",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                    }}
                />
                <input
                    type="text"
                    value={color}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        flex: 1,
                        padding: "4px 6px",
                        backgroundColor: "#3a3a3a",
                        border: "1px solid #555",
                        borderRadius: "3px",
                        color: "#ddd",
                        fontSize: "12px",
                        boxSizing: "border-box",
                        outline: "none",
                    }}
                />
            </div>
        </div>
    );
}
