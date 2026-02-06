// src/Panels/shared/SelectInput.tsx

interface SelectInputProps {
    label: string;
    value: string | undefined;
    options: { label: string; value: string }[];
    onChange: (value: string) => void;
}

const labelStyle: React.CSSProperties = {
    fontSize: "10px",
    color: "#888",
    marginBottom: "2px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
};

export function SelectInput({ label, value, options, onChange }: SelectInputProps) {
    return (
        <div>
            <div style={labelStyle}>{label}</div>
            <select
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    width: "100%",
                    padding: "4px 6px",
                    backgroundColor: "#3a3a3a",
                    border: "1px solid #555",
                    borderRadius: "3px",
                    color: "#ddd",
                    fontSize: "12px",
                    boxSizing: "border-box",
                    outline: "none",
                }}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
