// src/App.tsx
import { Renderer } from "./Renderer/Renderer.tsx";

export default function App() {
  return (
    <div 
      style={{ 
        width: "100vw", 
        height: "100vh", 
        display: "flex", 
        flexDirection: "column", 
        overflow: "hidden" // Prevents window scrollbars, we want internal scrolling
      }}
    >
        {/* Top Bar (Placeholder for your future toolbar) */}
        <div style={{ 
            height: "40px", 
            backgroundColor: "#2b2b2b", 
            color: "#fff", 
            display: "flex", 
            alignItems: "center", 
            padding: "0 16px",
            fontSize: "13px",
            fontWeight: 500,
            borderBottom: "1px solid #000"
        }}>
            Nova Editor v0.2
            <span style={{ marginLeft: "auto", opacity: 0.5 }}>Press Ctrl+Z to Undo</span>
        </div>

        {/* Main Canvas Area */}
        <div style={{ 
            flex: 1, // Takes up all remaining height
            position: "relative", 
            backgroundColor: "#f0f0f0", // The "Infinite Canvas" background color
            overflow: "auto" // Allows scrolling if your content gets too big
        }}>
            <Renderer />
        </div>
    </div>
  );
}