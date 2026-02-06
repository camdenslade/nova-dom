# Node Types Reference

## Base Node Interface

All nodes share this base structure:

```typescript
interface Node {
  id: NodeId;           // Unique string identifier
  type: string;         // Node type discriminator
  parentId: NodeId | null;
  childrenIds: NodeId[];
  props: {
    style?: CSSProperties;
    [key: string]: unknown;
  };
}
```

## Built-in Types

### `text`

Editable text content. Double-click to enter inline editing mode.

| Prop | Type | Description |
|------|------|-------------|
| `text` | `string` | The text content |

### `image`

An `<img>` element.

| Prop | Type | Description |
|------|------|-------------|
| `src` | `string` | Image source URL |
| `alt` | `string?` | Alt text |

### `video`

A `<video>` element with playback controls.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | | Video source URL |
| `controls` | `boolean?` | `true` | Show playback controls |
| `autoplay` | `boolean?` | `false` | Auto-play on load |
| `loop` | `boolean?` | `false` | Loop playback |
| `muted` | `boolean?` | `false` | Mute audio |

### `container`

A generic `<div>` block-level container. No type-specific props.

### `button`

A `<button>` element. In editor mode, click is prevented.

| Prop | Type | Description |
|------|------|-------------|
| `onClick` | `string?` | onClick handler string (for export) |

### `input`

A form `<input>` element. Value updates are captured in editor mode.

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string?` | Input value |
| `placeholder` | `string?` | Placeholder text |
| `inputType` | `string?` | HTML input type (default: `"text"`) |

### `link`

An `<a>` anchor element. Navigation is prevented in editor mode.

| Prop | Type | Description |
|------|------|-------------|
| `href` | `string` | Link URL |
| `target` | `"_blank" \| "_self"?` | Link target |

### `element`

A generic HTML element rendered via `React.createElement`.

| Prop | Type | Description |
|------|------|-------------|
| `tag` | `string` | HTML tag name (e.g., `"section"`, `"article"`) |

### `component`

An instance of a saved component. Renders the component definition's subtree with optional overrides.

| Prop | Type | Description |
|------|------|-------------|
| `componentId` | `string` | ID of the ComponentDefinition |
| `overrides` | `Record<string, unknown>` | Property overrides (`"nodeId.propPath"` → value) |

## Creating Nodes

Use factory functions from `Editor/nodeFunctions.ts`:

```typescript
createTextNode(parentId, text?)
createImageNode(parentId, src?)
createVideoNode(parentId, src?)
createContainerNode(parentId)
createButtonNode(parentId, label?)  // Returns { button, child }
createInputNode(parentId)
createLinkNode(parentId, href?)
createElementNode(parentId, tag?)
```

## Custom Node Types

Register custom node types with their own renderers:

```typescript
import { useCustomNodeRegistry } from "nova-dom/Editor/CustomNodeRegistry";

useCustomNodeRegistry.getState().register({
  type: "my-card",
  label: "Card",
  defaultProps: { title: "Card Title" },
  defaultStyle: { padding: "16px", borderRadius: "8px" },
  renderer: ({ node, children }) => (
    <div style={node.props.style}>
      <h3>{node.props.title as string}</h3>
      {children}
    </div>
  ),
});
```
