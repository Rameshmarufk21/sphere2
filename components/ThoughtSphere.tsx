'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';
import { useThoughts } from '../lib/stores/useThoughts';
import * as THREE from 'three';

// Individual thought component
const ThoughtBubble: React.FC<{ 
  thought: any; 
  onClick: () => void; 
  onDoubleClick: () => void;
}> = ({ thought, onClick, onDoubleClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y += Math.sin(Date.now() * 0.001 + thought.id.charCodeAt(0)) * 0.001;
    }
  });

  return (
    <group position={[thought.position.x, thought.position.y, thought.position.z]}>
      {/* Thought bubble background */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial 
          color={hovered ? "#60a5fa" : "#3b82f6"} 
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      {/* Thought text */}
      <Text
        position={[0, 0, 0.4]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.8}
        textAlign="center"
        renderOrder={1}
      >
        {thought.text}
      </Text>
      
      {/* Sub-sphere indicator */}
      {thought.hasSubSpheres && (
        <mesh position={[0.4, 0.4, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      )}
    </group>
  );
};

// Main scene component
const Scene: React.FC<{ onSphereClick: (event?: any) => void }> = ({ onSphereClick }) => {
  const { thoughts, focusOnThought, createSubSphere, targetRotation, clearTargetRotation } = useThoughts();
  const [isDay, setIsDay] = useState(true);
  const groupRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      setIsDay(hour >= 6 && hour < 18);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Smoothly rotate the group towards targetRotation
  useFrame(() => {
    if (groupRef.current && targetRotation) {
      const currentX = groupRef.current.rotation.x;
      const currentY = groupRef.current.rotation.y;
      const lerpFactor = 0.08;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(currentX, targetRotation.x, lerpFactor);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(currentY, targetRotation.y, lerpFactor);

      // Close enough - clear target
      if (
        Math.abs(groupRef.current.rotation.x - targetRotation.x) < 0.002 &&
        Math.abs(groupRef.current.rotation.y - targetRotation.y) < 0.002
      ) {
        clearTargetRotation();
      }
    }
  });

  const handleThoughtClick = (thought: any) => {
    // Single click - focus on thought
    focusOnThought(thought.position);
    onSphereClick();
  };

  const handleThoughtDoubleClick = (thought: any) => {
    // Double click - create sub-sphere
    const subThoughtText = prompt(`Enter text for sub-thought of "${thought.text}":`);
    if (subThoughtText) {
      createSubSphere(thought.id, subThoughtText);
    }
  };

  const backgroundColor = isDay ? "#f8fafc" : "#1e293b";

  return (
    <>
      {/* Camera controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={20}
        minDistance={3}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.6} />
      <pointLight position={[-10, -10, -5]} intensity={0.3} />
      
      {/* Thoughts */}
      <group ref={groupRef}>
        {thoughts.filter(t => t.mode === 'sphere').map((thought) => (
          <ThoughtBubble
            key={thought.id}
            thought={thought}
            onClick={() => handleThoughtClick(thought)}
            onDoubleClick={() => handleThoughtDoubleClick(thought)}
          />
        ))}

        {/* Center sphere */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshBasicMaterial 
            color={isDay ? "#e5e7eb" : "#374151"} 
            wireframe 
            transparent 
            opacity={0.3}
          />
        </mesh>
      </group>
      
      {/* Instructions */}
      {thoughts.filter(t => t.mode === 'sphere').length === 0 && (
        <Text
          position={[0, 2, 0]}
          fontSize={0.3}
          color={isDay ? "#6b7280" : "#9ca3af"}
          anchorX="center"
          anchorY="middle"
        >
          Click to add your first thought
        </Text>
      )}
    </>
  );
};

// Main ThoughtSphere component
export const ThoughtSphere: React.FC<{ onSphereClick: (event: any) => void }> = ({ onSphereClick }) => {
  const [isDay, setIsDay] = useState(true);
  
  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      setIsDay(hour >= 6 && hour < 18);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const backgroundColor = isDay ? "#f8fafc" : "#1e293b";

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        style={{ background: backgroundColor }}
        onCreated={({ gl }) => {
          console.log('WebGL context created successfully');
          gl.setClearColor(backgroundColor);
        }}
        onError={(error) => {
          console.error('WebGL Error:', error);
        }}
      >
        <Scene onSphereClick={onSphereClick} />
      </Canvas>
    </div>
  );
};
