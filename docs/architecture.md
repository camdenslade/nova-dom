# Architecture

## Overview

Nova-DOM is organized into five layers:

```
Schema       — Type definitions (Node, DocumentTree, Component)
Editor       — State management and tree operations (Zustand stores)
Renderer     — React components for rendering, selection, drag-drop
Panels       — Style panel, component panel, export panel
Plugin       — Plugin API, manager, and registry
```

## Directory Structure

```
src/
├── Schema/              # Data model types
│   ├── Node.ts          # Node type definitions (9 types)
│   ├── DocumentTree.ts  # Document tree interface
│   ├── Component.ts     # Component definition types
│   └── CustomNodeType.ts# Custom node type definition
├── Editor/              # State management
│   ├── EditorState.ts   # Main Zustand store + reducer
│   ├── nodeFunctions.ts # Node factory functions
│   ├── insertNode.ts    # Node insertion logic
│   ├── reorderNode.ts   # Drag-drop reordering
│   ├── duplicateNode.ts # Deep subtree cloning
│   ├── componentFunctions.ts # Save/instantiate/resolve components
│   ├── ComponentRegistry.ts  # Component definitions store
│   └── CustomNodeRegistry.ts # Custom renderer registry
├── Renderer/            # React rendering
│   ├── Renderer.tsx     # Root renderer component
│   ├── renderNode.tsx   # Recursive node renderer
│   ├── SelectionControls.tsx # Selection overlay + resize handles
│   ├── DragOverlay.tsx  # Drop indicator overlays
│   ├── SnapLines.tsx    # Alignment guide lines
│   ├── InlineToolbar.tsx# Floating action toolbar
│   └── hooks/
│       ├── useElementRegistry.ts # DOM element tracking
│       └── useSnapEngine.ts     # Snap computation
├── Panels/              # UI panels
│   ├── StylePanel.tsx   # Right sidebar style editor
│   ├── ComponentPanel.tsx # Component library panel
│   ├── ExportPanel.tsx  # Export modal
│   ├── sections/        # Style panel sections
│   │   ├── SizeSection.tsx
│   │   ├── LayoutSection.tsx
│   │   ├── SpacingSection.tsx
│   │   ├── TypographySection.tsx
│   │   ├── BackgroundSection.tsx
│   │   └── BorderSection.tsx
│   └── shared/          # Reusable panel components
│       ├── PropertyInput.tsx
│       ├── ColorPicker.tsx
│       └── SelectInput.tsx
├── Export/              # Export functionality
│   ├── exportHtml.ts    # HTML/CSS serializer
│   └── exportReact.ts   # React JSX serializer
├── Plugin/              # Plugin system
│   ├── PluginTypes.ts   # Plugin API type definitions
│   ├── PluginManager.ts # Plugin lifecycle + event system
│   └── createPluginAPI.ts # API facade factory
├── App.tsx              # Root layout component
└── main.tsx             # React entry point
```

## Zustand Stores

Nova-DOM uses multiple Zustand stores, each with a distinct responsibility:

| Store | Purpose | Has History? |
|-------|---------|-------------|
| `useEditorStore` | Document tree, selection, drag state, undo/redo | Yes |
| `useElementRegistry` | Maps NodeId → HTMLElement for DOM access | No |
| `useComponentRegistry` | Component definitions | No |
| `useCustomNodeRegistry` | Custom node type renderers | No |
| `usePluginManager` | Plugin lifecycle, toolbar items, panel sections | No |

## Rendering Pipeline

```
App.tsx
├── Top Bar (title, export button, plugin toolbar items)
└── Main Content
    ├── Canvas
    │   ├── Renderer.tsx
    │   │   └── renderNode(rootId, tree, selectedId)  [recursive]
    │   │       ├── Wrapper div (positioning, margins, events)
    │   │       ├── Semantic element (text/image/video/etc.)
    │   │       ├── SelectionControls (if selected)
    │   │       └── Children [recursive renderNode calls]
    │   ├── SnapLines
    │   ├── InlineToolbar
    │   └── ComponentPanel
    └── StylePanel (if node selected)
```

## Style Separation

Node styles are split between wrapper and content:

- **Wrapper div**: `position`, `left`, `top`, `right`, `bottom`, `transform`, `zIndex`, `margin*`
- **Content element**: Everything else (`color`, `fontSize`, `backgroundColor`, `padding`, etc.)

This separation allows positioning/layout to be controlled at the wrapper level while visual styling applies to the semantic element.

## History System

Every tree mutation (`UPDATE_NODE`, `ADD_NODE`, `DELETE_NODE`) goes through `pushHistory()`:
1. Deep-clone the tree via `JSON.parse(JSON.stringify(tree))`
2. Slice the history at the current index (discarding future states if undoing)
3. Push the new state
4. Update the history index

Undo/Redo clone and restore from the history stack.
