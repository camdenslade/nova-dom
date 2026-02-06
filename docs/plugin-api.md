# Plugin API Reference

## Overview

Plugins extend Nova-DOM with custom functionality, UI elements, and node types. They register through the Plugin Manager and receive a stable API facade.

## Creating a Plugin

```typescript
import type { NovaPlugin } from "nova-dom/Plugin/PluginTypes";
import { usePluginManager } from "nova-dom/Plugin/PluginManager";

const myPlugin: NovaPlugin = {
  name: "my-plugin",
  version: "1.0.0",

  init(api) {
    console.log("Plugin initialized!");
    console.log("Current tree:", api.getDocumentTree());

    // Return cleanup function (optional)
    return () => {
      console.log("Plugin destroyed");
    };
  },

  onNodeSelect(nodeId) {
    console.log("Selected:", nodeId);
  },

  onNodeUpdate(node) {
    console.log("Updated:", node.id);
  },
};

// Register
usePluginManager.getState().register(myPlugin);
```

## NovaPlugin Interface

```typescript
interface NovaPlugin {
  name: string;
  version: string;

  // Lifecycle
  init?: (api: PluginAPI) => void | (() => void);

  // Event hooks
  onNodeSelect?: (nodeId: NodeId | null) => void;
  onNodeUpdate?: (node: AnyNode) => void;
  onNodeAdd?: (node: AnyNode) => void;
  onNodeDelete?: (nodeId: NodeId) => void;
  onBeforeExport?: (tree: DocumentTree) => DocumentTree;

  // UI contributions
  toolbarItems?: ToolbarItemDef[];
  panelSections?: PanelSectionDef[];
  customNodeTypes?: CustomNodeTypeDefinition[];
}
```

## PluginAPI Methods

### Read Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getDocumentTree()` | `DocumentTree` | Current document state |
| `getSelectedNode()` | `AnyNode \| null` | Currently selected node |
| `getNode(id)` | `AnyNode \| undefined` | Get node by ID |
| `getElement(id)` | `HTMLElement \| undefined` | Get DOM element by node ID |

### Write Methods

| Method | Description |
|--------|-------------|
| `dispatch(action)` | Dispatch any EditorAction |
| `deleteNode(id)` | Delete a node and its children |
| `updateNode(node)` | Update a node's properties |

### Subscribe

```typescript
const unsubscribe = api.subscribe("nodeSelect", (nodeId) => {
  console.log("Selection changed to:", nodeId);
});

// Later: unsubscribe();
```

**Events:** `nodeSelect`, `nodeUpdate`, `nodeAdd`, `nodeDelete`, `treeChange`

### UI Extension

```typescript
// Add a button to the top toolbar
api.registerToolbarItem({
  id: "my-plugin:save",
  label: "Save",
  position: "right",
  onClick: () => { /* save logic */ },
});

// Add a section to the style panel
api.registerPanel({
  id: "my-plugin:custom-props",
  title: "Custom Properties",
  component: MyCustomPropsPanel,
});

// Register a custom node type
api.registerNodeType({
  type: "chart",
  label: "Chart",
  defaultProps: { data: [] },
  defaultStyle: { width: "300px", height: "200px" },
  renderer: ChartRenderer,
});
```

## ToolbarItemDef

```typescript
interface ToolbarItemDef {
  id: string;            // Unique identifier
  label: string;         // Button label text
  icon?: React.ReactNode;// Optional icon
  onClick: () => void;   // Click handler
  position?: "left" | "right"; // Toolbar position (default: "left")
}
```

## PanelSectionDef

```typescript
interface PanelSectionDef {
  id: string;                    // Unique identifier
  title: string;                 // Section header text
  component: React.ComponentType;// React component to render
  position?: "top" | "bottom";  // Position in panel (default: bottom)
}
```

## Example: Color Theme Plugin

```typescript
const colorThemePlugin: NovaPlugin = {
  name: "color-theme",
  version: "1.0.0",

  toolbarItems: [
    {
      id: "color-theme:toggle",
      label: "Dark Mode",
      position: "right",
      onClick: () => {
        const store = useEditorStore.getState();
        const root = store.documentTree.nodes[store.documentTree.root];
        store.dispatch({
          type: "UPDATE_NODE",
          payload: {
            ...root,
            props: {
              ...root.props,
              style: {
                ...root.props.style,
                backgroundColor: "#1a1a1a",
                color: "#ffffff",
              },
            },
          },
        });
      },
    },
  ],
};
```

## Unregistering

```typescript
usePluginManager.getState().unregister("my-plugin");
```

This calls the cleanup function returned from `init()` and removes all contributed toolbar items and panel sections.
