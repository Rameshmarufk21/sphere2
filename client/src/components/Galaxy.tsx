import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useThoughts } from '@/lib/stores/useThoughts';

// Celestial body component (thought sphere)
const CelestialBody: React.FC<{ 
  thought: any; 
  position: THREE.Vector3; 
  size: number; 
  isSun: boolean;
  orbitRadius?: number;
  orbitSpeed?: number;
}> = ({ thought, position, size, isSun, orbitRadius, orbitSpeed }) => {
  const bodyRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (bodyRef.current) {
      if (isSun) {
        // Sun gently rotates on its axis
        bodyRef.current.rotation.y += 0.005;
      } else if (orbitRef.current && orbitRadius && orbitSpeed) {
        // Planets orbit around the sun
        const time = state.clock.getElapsedTime();
        const angle = time * orbitSpeed * 0.5; // Same speed as sphere
        
        orbitRef.current.rotation.y = angle;
        
        // Position planet on its orbit
        bodyRef.current.position.x = orbitRadius;
        bodyRef.current.position.y = 0;
        bodyRef.current.position.z = 0;
        
        // Rotate planet on its own axis
        bodyRef.current.rotation.y += 0.02;
      }
    }
  });

  const material = isSun ? (
    <meshStandardMaterial 
      color="#FFD700" 
      emissive="#FF8C00"
      emissiveIntensity={0.3}
    />
  ) : (
    <meshStandardMaterial 
      color={thought.color || '#4B9CD3'} 
      emissive={thought.color || '#4B9CD3'}
      emissiveIntensity={0.1}
    />
  );

  const body = (
    <mesh ref={bodyRef}>
      <sphereGeometry args={[size, 32, 32]} />
      {material}
    </mesh>
  );

  if (isSun) {
    return (
      <group>
        {body}
        {/* Sun glow effect */}
        <mesh position={position}>
          <sphereGeometry args={[size * 1.2, 32, 32]} />
          <meshBasicMaterial 
            color="#FFD700" 
            transparent 
            opacity={0.1}
          />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={orbitRef}>
      {body}
      {/* Subtle orbit ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[orbitRadius! - 0.1, orbitRadius! + 0.1, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.05} />
      </mesh>
    </group>
  );
};

// Main solar system scene
const SolarSystem: React.FC = () => {
  const { thoughts } = useThoughts();
  
  // Filter thoughts for sphere mode and sort by text length (larger = more important)
  const sphereThoughts = thoughts
    .filter(t => t.mode === 'sphere')
    .sort((a, b) => b.text.length - a.text.length);
  
  // Create celestial bodies from thoughts
  const celestialBodies = useMemo(() => {
    if (sphereThoughts.length === 0) {
      return [];
    }
    
    const bodies = [];
    
    // First thought becomes the sun
    if (sphereThoughts[0]) {
      bodies.push({
        thought: sphereThoughts[0],
        position: new THREE.Vector3(0, 0, 0),
        size: 2, // Large sun size
        isSun: true,
        color: '#FFD700'
      });
    }
    
    // Remaining thoughts become planets
    const planetOrbits = [4, 6, 8, 10, 12, 14, 16, 18, 20]; // Orbit distances
    const planetSizes = [0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.25, 0.2, 0.15]; // Planet sizes
    const planetSpeeds = [1.0, 0.8, 0.6, 0.5, 0.4, 0.3, 0.25, 0.2, 0.15]; // Orbit speeds
    
    for (let i = 1; i < sphereThoughts.length && i <= 9; i++) {
      bodies.push({
        thought: sphereThoughts[i],
        position: new THREE.Vector3(planetOrbits[i-1], 0, 0),
        size: planetSizes[i-1],
        isSun: false,
        orbitRadius: planetOrbits[i-1],
        orbitSpeed: planetSpeeds[i-1],
        color: `hsl(${i * 40}, 70%, 60%)` // Generate different colors
      });
    }
    
    return bodies;
  }, [sphereThoughts]);

  return (
    <>
      {/* Space background with stars */}
      <Stars />
      
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[0, 0, 0]} intensity={3} color="#FFD700" />
      
      {/* Celestial bodies */}
      {celestialBodies.map((body, index) => (
        <CelestialBody
          key={body.thought.id}
          thought={body.thought}
          position={body.position}
          size={body.size}
          isSun={body.isSun}
          orbitRadius={body.orbitRadius}
          orbitSpeed={body.orbitSpeed}
        />
      ))}
      
      {/* Camera controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={8}
        maxDistance={50}
        target={[0, 0, 0]}
      />
    </>
  );
};

// Stars background component
const Stars: React.FC = () => {
  const starsRef = useRef<THREE.Points>(null);
  
  const starsGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;     // x
      positions[i + 1] = (Math.random() - 0.5) * 100; // y
      positions[i + 2] = (Math.random() - 0.5) * 100; // z
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);
  
  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0005; // Very slow star field rotation
    }
  });

  return (
    <points ref={starsRef} geometry={starsGeometry}>
      <pointsMaterial
        size={0.1}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation={true}
      />
    </points>
  );
};

// Main Galaxy component
export const Galaxy: React.FC = () => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{
          position: [0, 20, 25],
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
          background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0B1426 100%)'
        }}
      >
        <SolarSystem />
      </Canvas>
    </div>
  );
};
