# nova-dom

![MIT License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react)
![Zustand](https://img.shields.io/badge/Zustand-5.0.8-orange)
![Vite](https://img.shields.io/badge/vite-7.2.2-646cff?logo=vite)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

A lightweight, modern, TypeScript-first DOM editing engine for React.
Build visual editors, page builders, no-code tools, layout builders, or custom Webflow-like tools with a clean, lightweight and extendable API.

## Features:
• Fast + Modern Renderer (recursive, optimized, typed)

• Flat DocumentTree model (like Figma/Webflow: scalable + easy diffing)

• Selection + Hover overlays (Webflow-style UX)

• Inline text editing (contentEditable)

• Undo / Redo stack (history-safe reducer architecture)

• Composable Node Types (text, container, button, image, element)

• Tree editing utilities (insert, delete, update)

• Resizable DOM (coming soon)

• Drag + drop reordering (coming soon)

• Style inspector & CSS box model tools (coming soon)

## Installation:
npm install nova-dom
or
yarn add nova-dom

## Basic Usage:
import { Renderer, Overlay } from "nova-dom";
import { useEditorStore } from "nova-dom/EditorState";

export default function Canvas() {
  const tree = useEditorStore((s) => s.documentTree);

  return (
    <div className="canvas">
      <Overlay />
      {renderNode(tree.root, tree)}
    </div>
  );
}

## Architecture
- nova-dom uses a flat document model:

interface DocumentTree {
  root: NodeId;
  nodes: Record<NodeId, AnyNode>;
}


## Each node contains:

interface Node {
  id: string;
  type: "container" | "text" | ... ;
  parentId: string | null;
  childrenIds: string[];
  props: { style?: CSSProperties; [key: string]: any };
}


## This enables:
- fast cloning
- easy undo/redo
- efficient tree diffing
- portable serialization

## Roadmap
v0.2.0:
- Live resize handles
- Resize overlay panel
- Box model outlines (padding/margin)

v0.3.0:
- Drag + drop reordering
- Insertion indicators
- Smart snap lines

v0.4.0:
- Style panel (typography, spacing, background)
- Inline toolbar

v0.5.0:
- Component system
- Custom user-defined nodes

v0.6.0:
- Export to HTML/CSS
- Embed React components

v1.0.0:
- Stable plugin API
- Full documentation
- Full demo app

## Contributing:
- See CONTRIBUTING.md

## License:
- MIT
