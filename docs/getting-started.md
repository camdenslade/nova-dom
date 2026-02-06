# Getting Started with Nova-DOM

## Installation

```bash
npm install nova-dom
```

## Quick Start

```tsx
import { Renderer } from "nova-dom/Renderer/Renderer";
import { useEditorStore } from "nova-dom/Editor/EditorState";

function App() {
  const tree = useEditorStore((s) => s.documentTree);
  return <Renderer />;
}
```

## Core Concepts

### Document Tree

Nova-DOM uses a **flat document model** — all nodes are stored in a single `Record<NodeId, AnyNode>` map rather than a nested tree. This makes cloning, diffing, and serialization fast and predictable.

```typescript
interface DocumentTree {
  root: NodeId;
  nodes: Record<NodeId, AnyNode>;
}
```

### Nodes

Every node has:
- `id` — Unique string identifier
- `type` — One of: `text`, `image`, `video`, `container`, `button`, `input`, `link`, `element`, `component`
- `parentId` — ID of parent node (null for root)
- `childrenIds` — Array of child node IDs
- `props` — Type-specific properties including `style` (React CSSProperties)

### State Management

The editor state lives in a Zustand store accessible via `useEditorStore`. All mutations go through a `dispatch(action)` pattern:

```typescript
const store = useEditorStore.getState();
store.dispatch({ type: "SELECT_NODE", payload: "node-id" });
store.dispatch({ type: "UPDATE_NODE", payload: updatedNode });
```

### Node Creation

Use factory functions from `Editor/nodeFunctions.ts`:

```typescript
import { createTextNode, createContainerNode } from "nova-dom/Editor/nodeFunctions";

const text = createTextNode("parent-id", "Hello World");
const container = createContainerNode("parent-id");
```

### Inserting Nodes

```typescript
import { insertNode } from "nova-dom/Editor/insertNode";

insertNode(newNode, parentId, "end");    // Append
insertNode(newNode, parentId, "start");  // Prepend
insertNode(newNode, parentId, "after");  // After selected node
```

### Undo/Redo

Built-in history tracking. Every `UPDATE_NODE`, `ADD_NODE`, and `DELETE_NODE` action pushes to the history stack:

```typescript
store.dispatch({ type: "UNDO" });
store.dispatch({ type: "REDO" });
```

## Layout

The default App layout provides:
- **Top bar** — Title, export button, plugin toolbar items
- **Canvas** — The main editing area with the rendered document
- **Right panel** — Style properties panel (visible when a node is selected)
- **Component panel** — Floating panel for managing reusable components
- **Inline toolbar** — Floating toolbar above the selected element

## Export

Click the **Export** button in the top bar to export your document as:
- **HTML** — Complete HTML document with inline styles or CSS classes
- **React** — A React functional component with JSX

## Components

Save any subtree as a reusable component:
1. Select a node on the canvas
2. Click "Save Selection as Component" in the Components panel
3. Drag components from the panel to instantiate them

## Plugins

Extend the editor with plugins. See [Plugin API](./plugin-api.md) for details.
