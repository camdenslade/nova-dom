// src/Schema/Node.ts
import type { CSSProperties } from "react";

export type NodeId = string;
export interface Node {
    id: NodeId;
    type: "text" | "image" | "video" | "container" | "button" | "input" | "link" | "element";
    parentId: NodeId | null;
    childrenIds: NodeId[];
    props: {style?: CSSProperties; [key: string]: unknown};
}
export interface TextNode extends Node {
    type: "text";
    props: Node["props"] & {
        text: string;
    };
    childrenIds: NodeId[];
}
export interface ImageNode extends Node {
    type: "image";
    props: Node["props"] & {
        src: string;
        alt?: string;
    };
    childrenIds: NodeId[];
}
export interface VideoNode extends Node {
    type: "video";
    props: Node["props"] & {
        src: string;
        autoplay?: boolean;
        controls?: boolean;
        loop?: boolean;
        muted?: boolean;
    };
    childrenIds: NodeId[];
}
export interface ContainerNode extends Node {
    type: "container";
}
export interface ButtonNode extends Node {
    type: "button";
    props: Node["props"] & {
        onClick?: string;
    };
}
export interface InputNode extends Node {
    type: "input";
    props: Node["props"] & {
        value?: string;
        placeholder?: string;
        inputType?: string;
    };
    childrenIds: NodeId[];
}
export interface LinkNode extends Node {
    type: "link";
    props: Node["props"] & {
        href: string;
        target?: "_blank" | "_self";
    };
}
export interface ElementNode extends Node {
    type: "element";
    props: Node["props"] & {
        tag: string;
    };
}
export type AnyNode = | TextNode | ImageNode | VideoNode | ContainerNode | ButtonNode | InputNode | LinkNode | ElementNode;