// src/Panels/shared/PropertyInput.tsx
import { useState } from "react";

interface PropertyInputProps {
    label: string;
    value: string | number | undefined;
    onChange: (value: string) => void;
    type?: "text" | "number";
    placeholder?: string;
}

const labelStyle: React.CSSProperties = {
    fontSize: "10px",
    color: "#888",
    marginBottom: "2px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "4px 6px",
    backgroundColor: "#3a3a3a",
    border: "1px solid #555",
    borderRadius: "3px",
    color: "#ddd",
    fontSize: "12px",
    boxSizing: "border-box",
    outline: "none",
};

export function PropertyInput({ label, value, onChange, type = "text", placeholder }: PropertyInputProps) {
    const [localState, setLocalState] = useState({ localValue: String(value ?? ""), prevValue: value });

    // Sync from prop when the external value changes (React-recommended derived state pattern)
    if (value !== localState.prevValue) {
        setLocalState({ localValue: String(value ?? ""), prevValue: value });
    }

    const localValue = localState.localValue;

    const handleBlur = () => {
        onChange(localValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") onChange(localValue);
    };

    return (
        <div>
            <div style={labelStyle}>{label}</div>
            <input
                type={type}
                style={inputStyle}
                value={localValue}
                placeholder={placeholder}
                onChange={(e) => setLocalState((s) => ({ ...s, localValue: e.target.value }))}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
}
