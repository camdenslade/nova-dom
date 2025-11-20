// src/Schema/Node.ts
export interface Node {
    id: string;
    type: "text" | "container";
    props: {style?: React.CSSProperties; text?: string; [key: string]: unknown;};
    children?: Node[];
}