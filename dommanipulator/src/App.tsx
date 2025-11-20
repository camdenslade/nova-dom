// src/App.tsx
import { Renderer } from "./Renderer/Renderer.tsx";
import type { Node } from "./Schema/Node.ts";

const Tree: Node = {
  id: "root",
  type: "container",
  props: { style: { padding: 20, backgroundColor: "#eee" } },
  children: [
    {
      id: "text1",
      type: "text",
      props: { text: "Hello, World!", style: { color: "blue", fontSize: 24 } },
    },
    {
      id: "container1",
      type: "container",
      props: { style: { marginTop: 10, padding: 10, backgroundColor: "#fff" } },
      children: [
        {
          id: "text2",
          type: "text",
          props: { text: "This is a nested container.", style: { color: "green" } },
        },
      ],
    },
  ],
};

export function App(): React.ReactNode {
  return <Renderer node={Tree} />;
}