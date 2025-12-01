// vr/src/Scene.jsx
// v2
import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

/*
  VR Scene med:
  - Panel (representerer en overflate med coating)
  - Bevegelig lys som simulerer inspeksjon
  - Interaktiv slider som visualiserer CVI
  - OrbitControls for å rotere/zoome scenen
*/

function MovingLight({ intensity = 1 }) {
  const lightRef = useRef();
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(t) * 3;
      lightRef.current.position.z = Math.cos(t) * 3;
    }
  });
  
  return (
    <pointLight
      ref={lightRef}
      position={[0, 3, 0]}
      intensity={intensity}
      color="#ffffff"
    />
  );
}

function CoatingPanel({ cvi = 50 }) {
  // CVI affects the color/shininess of the panel
  const normalizedCvi = cvi / 100;
  
  return (
    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[4, 4]} />
      <meshStandardMaterial
        color={`hsl(${120 * normalizedCvi}, 70%, 50%)`}
        metalness={0.3 + normalizedCvi * 0.4}
        roughness={0.7 - normalizedCvi * 0.4}
      />
    </mesh>
  );
}

function InspectionMarkers({ cvi = 50 }) {
  // Show quality indicators around the panel
  const markers = [
    { pos: [-1.5, 0.1, -1.5], quality: "good" },
    { pos: [1.5, 0.1, -1.5], quality: cvi > 70 ? "good" : "warning" },
    { pos: [-1.5, 0.1, 1.5], quality: cvi > 50 ? "good" : "warning" },
    { pos: [1.5, 0.1, 1.5], quality: cvi > 30 ? "warning" : "bad" },
  ];
  
  const colors = {
    good: "#22c55e",
    warning: "#f59e0b",
    bad: "#ef4444",
  };
  
  return (
    <>
      {markers.map((marker, i) => (
        <mesh key={i} position={marker.pos}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color={colors[marker.quality]}
            emissive={colors[marker.quality]}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </>
  );
}

export default function Scene() {
  const [cvi, setCvi] = useState(75);
  
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 5, 5], fov: 50 }}
        style={{ background: "#1a1a2e" }}
      >
        <ambientLight intensity={0.3} />
        <MovingLight intensity={cvi / 50} />
        
        <CoatingPanel cvi={cvi} />
        <InspectionMarkers cvi={cvi} />
        
        {/* Grid helper */}
        <gridHelper args={[10, 10, "#444", "#333"]} />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={15}
        />
      </Canvas>
      
      {/* DOM Overlay */}
      <div style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        background: "rgba(0, 0, 0, 0.7)",
        color: "white",
        padding: "20px",
        borderRadius: "8px",
        fontFamily: "Arial, sans-serif",
        minWidth: "250px"
      }}>
        <h2 style={{ margin: "0 0 15px 0", fontSize: "1.2rem" }}>
          CoatVision VR Inspector
        </h2>
        
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            CVI (Coating Visual Index): {cvi}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={cvi}
            onChange={(e) => setCvi(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
        
        <div style={{ fontSize: "0.85rem", color: "#aaa" }}>
          <p style={{ margin: "5px 0" }}>
            Kvalitet: {cvi >= 70 ? "God" : cvi >= 40 ? "Moderat" : "Lav"}
          </p>
          <p style={{ margin: "5px 0" }}>
            Bruk musen for å rotere/zoome
          </p>
        </div>
      </div>
    </div>
  );
}
