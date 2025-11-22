// src/Editor/nodeFactories.ts
import type {
    NodeId,
    TextNode,
    ImageNode,
    VideoNode,
    ContainerNode,
    ButtonNode,
    InputNode,
    LinkNode,
    ElementNode,
} from "../Schema/Node.ts";

function id(): NodeId {
    return Math.random().toString(36).slice(2, 10);
}

export function createTextNode(parentId: NodeId | null, text = "New Text"): TextNode {
    return {
        id: id(),
        type: "text",
        parentId,
        childrenIds: [],
        props: {
            text,
            style: { fontSize: "16px", color: "#000" },
        },
    };
}

export function createImageNode(parentId: NodeId | null, src = ""): ImageNode {
    return {
        id: id(),
        type: "image",
        parentId,
        childrenIds: [],
        props: {
            src,
            alt: "",
            style: { width: "200px", height: "auto" },
        },
    };
}

export function createVideoNode(parentId: NodeId | null, src = ""): VideoNode {
    return {
        id: id(),
        type: "video",
        parentId,
        childrenIds: [],
        props: {
            src,
            autoplay: false,
            loop: false,
            controls: true,
            muted: false,
            style: { width: "400px", height: "auto" },
        },
    };
}

export function createContainerNode(parentId: NodeId | null): ContainerNode {
    return {
        id: id(),
        type: "container",
        parentId,
        childrenIds: [],
        props: {
            style: {
                display: "block",
                padding: "10px",
                border: "1px solid #ddd",
            },
        },
    };
}

export function createButtonNode(
    parentId: NodeId | null,
    label = "Button"
): { button: ButtonNode; child: TextNode } {
    const textChild = createTextNode(null, label);

    const button: ButtonNode = {
        id: id(),
        type: "button",
        parentId,
        childrenIds: [textChild.id],
        props: {
            onClick: "",
            style: {
                padding: "8px 12px",
                background: "#eee",
                borderRadius: "4px",
                border: "1px solid #ccc",
            },
        },
    };

    return { button, child: textChild };
}


export function createInputNode(parentId: NodeId | null): InputNode {
    return {
        id: id(),
        type: "input",
        parentId,
        childrenIds: [],
        props: {
            value: "",
            placeholder: "Type...",
            inputType: "text",
            style: {
                padding: "6px 8px",
                border: "1px solid #ccc",
            },
        },
    };
}

export function createLinkNode(parentId: NodeId | null, href = "#"): LinkNode {
    return {
        id: id(),
        type: "link",
        parentId,
        childrenIds: [],
        props: {
            href,
            target: "_self",
            style: { color: "#0066ff", textDecoration: "underline" },
        },
    };
}

export function createElementNode(parentId: NodeId | null, tag = "div"): ElementNode {
    return {
        id: id(),
        type: "element",
        parentId,
        childrenIds: [],
        props: {
            tag,
            style: {},
        },
    };
}
