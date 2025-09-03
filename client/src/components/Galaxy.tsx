import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useThoughts } from '../lib/stores/useThoughts';
import * as THREE from 'three';

// Helper function to check if it's daytime
const isDaytime = () => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18; // Day from 6 AM to 6 PM
};

// MiniSphere component - mini version of the new thought sphere
const MiniSphere: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const [isDay, setIsDay] = useState(isDaytime());
  
  // Check time every minute
  React.useEffect(() => {
    const interval = setInterval(() => {
      setIsDay(isDaytime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Slow, smooth rotation
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.005;
    }
    if (shadowRef.current) {
      shadowRef.current.rotation.y += 0.01;
      shadowRef.current.rotation.x += 0.005;
    }
  });

  const sphereColor = isDay ? "#94a3b8" : "#64748b"; // Light grey for day, darker grey for night
  const shadowColor = isDay ? "#64748b" : "#475569";

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 0, 5]} intensity={1.0} color="#ffffff" />
      
      <group>
        {/* Shadow sphere - slightly larger and darker */}
        <mesh
          ref={shadowRef}
          position={[0.06, -0.06, -0.06]}
          renderOrder={0}
        >
          <sphereGeometry args={[1.6, 16, 16]} />
          <meshBasicMaterial 
            transparent 
            opacity={0.3}
            color={shadowColor}
            wireframe={true}
            wireframeLinewidth={0.5}
            depthWrite={false}
          />
        </mesh>
        
        {/* Main sphere */}
        <mesh
          ref={meshRef}
          position={[0, 0, 0]}
          renderOrder={0}
        >
          <sphereGeometry args={[1.6, 32, 32]} />
          <meshBasicMaterial 
            transparent 
            opacity={0.4}
            color={sphereColor}
            wireframe={true}
            wireframeLinewidth={0.6}
            depthWrite={false}
          />
        </mesh>
      </group>
    </>
  );
};

const Galaxy: React.FC = () => {
  const { getSpheres, navigateToSphere, setViewMode } = useThoughts();
  const spheres = getSpheres();
  const [clickedSphereId, setClickedSphereId] = useState<string | null>(null);

  const handleSphereClick = (sphereId: string) => {
    console.log('🪐 Galaxy: Clicking sphere with ID:', sphereId);
    console.log('🪐 Galaxy: Current state before navigation:', useThoughts.getState());
    
    // Visual feedback
    setClickedSphereId(sphereId);
    
    // First navigate to the sphere
    navigateToSphere(sphereId);
    console.log('🪐 Galaxy: navigateToSphere called, currentSphereId should be:', sphereId);
    
    // Then switch to sphere mode
    setViewMode('sphere');
    console.log('🪐 Galaxy: setViewMode called, switching to sphere mode');
    
    // Verify the navigation worked
    setTimeout(() => {
      const currentState = useThoughts.getState();
      console.log('🪐 Galaxy: Navigation verification - currentSphereId:', currentState.currentSphereId, 'viewMode:', currentState.viewMode);
      console.log('🪐 Galaxy: All thoughts:', currentState.thoughts);
      console.log('🪐 Galaxy: Spheres found:', currentState.getSpheres());
    }, 100);
  };



  console.log('🪐 Galaxy: Rendering with', spheres.length, 'spheres');

  // Get time-based background color like ThoughtSphere
  const isDaytime = () => {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18; // Day from 6 AM to 6 PM
  };
  
  const backgroundColor = isDaytime() ? "#f8fafc" : "#1e293b";
  const textColor = isDaytime() ? "#1f2937" : "#f1f5f9";

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor }}>
      <h1 className="text-4xl font-bold text-center mb-12" style={{ color: textColor }}>
          Galaxy Shelf
        </h1>
        
        {spheres.length === 0 ? (
        <div className="text-center text-xl" style={{ color: isDaytime() ? "#6b7280" : "#9ca3af" }}>
            No spheres stored yet. Create some thoughts first!
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {spheres.map((sphere) => (
              <div
                key={sphere.sphereId}
                onClick={() => handleSphereClick(sphere.sphereId!)}
              className="cursor-pointer transition-all duration-300 group text-center"
              style={{ userSelect: 'none' }}
            >
              {/* Mini 3D Wireframe Sphere - Like New Thought */}
              <div className="w-32 h-32 mx-auto relative group-hover:scale-110 transition-transform duration-300" style={{ marginBottom: '-20px' }}>
                <Canvas
                  camera={{ position: [0, 0, 9], fov: 50 }}
                  style={{ width: '100%', height: '100%' }}
                >
                  <MiniSphere />
                </Canvas>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: textColor }}>
                {sphere.title || 'Untitled Sphere'}
              </h3>

              {clickedSphereId === sphere.sphereId && (
                <p className="text-red-400 text-xs mt-2 font-bold">
                  ✓ Clicked!
                </p>
              )}
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default Galaxy;
