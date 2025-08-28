import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

// Planet data with names, sizes, distances, and colors
const planets = [
  { name: 'Mercury', size: 0.15, distance: 2, color: '#8B7355', speed: 1.0 },
  { name: 'Venus', size: 0.25, distance: 3, color: '#E6BE8A', speed: 0.8 },
  { name: 'Earth', size: 0.3, distance: 4, color: '#4B9CD3', speed: 0.7 },
  { name: 'Mars', size: 0.2, distance: 5, color: '#CD5C5C', speed: 0.6 },
  { name: 'Jupiter', size: 0.6, distance: 7, color: '#DAA520', speed: 0.5 },
  { name: 'Saturn', size: 0.5, distance: 9, color: '#F4A460', speed: 0.4 },
  { name: 'Uranus', size: 0.35, distance: 11, color: '#40E0D0', speed: 0.3 },
  { name: 'Neptune', size: 0.35, distance: 13, color: '#1E90FF', speed: 0.25 },
  { name: 'Pluto', size: 0.1, distance: 15, color: '#A0522D', speed: 0.2 }
];

// Planet component with orbit and rotation
const Planet: React.FC<{ planet: typeof planets[0]; index: number }> = ({ planet, index }) => {
  const planetRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (planetRef.current && orbitRef.current) {
      // Rotate the planet around the sun
      const time = state.clock.getElapsedTime();
      const angle = time * planet.speed * 0.5; // Same speed as sphere
      
      orbitRef.current.rotation.y = angle;
      
      // Position planet on its orbit
      planetRef.current.position.x = planet.distance;
      planetRef.current.position.y = 0;
      planetRef.current.position.z = 0;
      
      // Rotate planet on its own axis
      planetRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group ref={orbitRef}>
      {/* Planet */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[planet.size, 32, 32]} />
        <meshStandardMaterial color={planet.color} />
      </mesh>
      
      {/* Planet name */}
      <Text
        position={[planet.distance + planet.size + 0.3, 0, 0]}
        fontSize={0.2}
        color="white"
        anchorX="left"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
        renderOrder={1000}
      >
        {planet.name}
      </Text>
      
      {/* Orbit ring (subtle) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[planet.distance - 0.05, planet.distance + 0.05, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
      </mesh>
    </group>
  );
};

// Sun component
const Sun: React.FC = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (sunRef.current) {
      // Gentle rotation of the sun
      sunRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group>
      {/* Sun */}
      <mesh ref={sunRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color="#FFD700" 
          emissive="#FF8C00"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Sun glow effect */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial 
          color="#FFD700" 
          transparent 
          opacity={0.1}
        />
      </mesh>
      
      {/* Sun name */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.4}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#FF8C00"
        renderOrder={1000}
      >
        Sun
      </Text>
    </group>
  );
};

// Main solar system scene
const SolarSystem: React.FC = () => {
  return (
    <>
      {/* Ambient and directional lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
      <pointLight position={[0, 0, 0]} intensity={2} color="#FFD700" />
      
      {/* Sun */}
      <Sun />
      
      {/* Planets */}
      {planets.map((planet, index) => (
        <Planet key={planet.name} planet={planet} index={index} />
      ))}
      
      {/* Camera controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={30}
        target={[0, 0, 0]}
      />
    </>
  );
};

// Main Galaxy component
export const Galaxy: React.FC = () => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{
          position: [0, 15, 20],
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        style={{ 
          width: '100%', 
          height: '100%',
          background: 'linear-gradient(to bottom, #0B1426, #1a1a2e, #16213e)'
        }}
      >
        <SolarSystem />
      </Canvas>
    </div>
  );
};
