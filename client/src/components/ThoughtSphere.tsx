import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Billboard, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useThoughts } from '@/lib/stores/useThoughts';

// Helper function to determine if it's day or night
const isDaytime = () => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18; // Day from 6 AM to 6 PM
};

// Sphere component
const Sphere: React.FC<{ onClick: (event: any) => void; isSubSphere?: boolean }> = ({ onClick, isSubSphere = false }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const { isInputMode } = useThoughts();
  const [isDay, setIsDay] = useState(isDaytime());
  
  // Check time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setIsDay(isDaytime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Slow, smooth rotation when not in input mode
  useFrame(() => {
    if (!isInputMode) {
      const targetX = isSubSphere ? 0 : (meshRef.current?.rotation.x || 0);
      const tiltLerp = isSubSphere ? 0.05 : 0; // straighten faster in subsphere
      if (meshRef.current) {
        if (isSubSphere) {
          meshRef.current.rotation.x += (targetX - meshRef.current.rotation.x) * tiltLerp;
          meshRef.current.rotation.y += 0.0004;
        } else {
      meshRef.current.rotation.y += 0.001;
      meshRef.current.rotation.x += 0.0005;
    }
      }
      if (shadowRef.current) {
        if (isSubSphere) {
          shadowRef.current.rotation.x += (targetX - shadowRef.current.rotation.x) * tiltLerp;
          shadowRef.current.rotation.y += 0.0004;
        } else {
      shadowRef.current.rotation.y += 0.001;
      shadowRef.current.rotation.x += 0.0005;
        }
      }
    }
  });

  const sphereColor = isDay ? "#94a3b8" : "#64748b"; // Light grey for day, darker grey for night
  const shadowColor = isDay ? "#64748b" : "#475569";

  return (
    <group>
      {/* Shadow sphere - slightly larger and darker */}
      <mesh
        ref={shadowRef}
        position={[0.05, -0.05, -0.05]}
        onClick={onClick}
        renderOrder={0}
      >
        <sphereGeometry args={[2.02, 32, 32]} />
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
        onClick={onClick}
        position={[0, 0, 0]}
        renderOrder={0}
      >
        <sphereGeometry args={[2, 80, 80]} />
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
  );
};

// Individual thought text component
const ThoughtText: React.FC<{ thought: any; index: number; totalThoughts: number }> = ({ thought, index, totalThoughts }) => {

  const textRef = useRef<THREE.Group>(null);
  const { isInputMode, focusOnThought, navigateToThought } = useThoughts();
  const [isDay, setIsDay] = useState(isDaytime());
  const [isHovered, setIsHovered] = useState(false);
  
  // Check time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setIsDay(isDaytime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const textColor = isHovered ? "#ef4444" : (isDay ? "#000000" : "#ffffff"); // Red on hover
  
  // Proportional font scaling with minimum size limit and sphere expansion
  const getResponsiveFontSize = useMemo(() => {
    const startingSize = 0.35;  // Size for first thought
    const minSize = 0.12;       // Minimum readable size - won't go below this
    const reductionPerThought = 0.025; // Fixed reduction per thought
    
    // Calculate desired size with linear reduction
    const targetSize = startingSize - (totalThoughts - 1) * reductionPerThought;
    
    // Use the larger of target size or minimum size
    const globalSize = Math.max(minSize, targetSize);
    
    // Text length factor - shorter words are larger within the global size
    const wordCount = thought.text.trim().split(' ').length;
    const lengthFactor = Math.max(0.7, Math.min(1.4, 1.8 / Math.sqrt(thought.text.length + wordCount * 0.3)));
    
    // Small variation for natural look (consistent per text)
    const seedValue = thought.text.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const randomFactor = 0.95 + (seedValue % 10) / 100; // Very subtle variation
    
    const calculatedSize = globalSize * lengthFactor * randomFactor;
    return Math.max(minSize, calculatedSize);
  }, [thought.text, totalThoughts]);

  const fontSize = getResponsiveFontSize;
  
  return (
    <group 
      ref={textRef}
      position={[thought.position.x, thought.position.y, thought.position.z]}
      renderOrder={1000}
    >
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <Text
          fontSize={fontSize}
          maxWidth={4}
          lineHeight={1.1}
          letterSpacing={0.01}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          color={textColor}
          outlineWidth={fontSize * 0.015}
          outlineColor={isHovered ? "#ffffff" : (isDay ? "#ffffff" : "#000000")}
          fillOpacity={0.95}
          renderOrder={1000}
          onPointerEnter={() => setIsHovered(true)}
          onPointerLeave={() => setIsHovered(false)}
          onClick={(e) => {
            e.stopPropagation();
            if (e.detail === 1) {
              // Single click - focus on thought
              focusOnThought(thought.position);
            } else if (e.detail === 2) {
              // Double click - navigate to nested sphere
              navigateToThought(thought.id);
            }
          }}
        >
          {thought.text}
        </Text>
      </Billboard>
    </group>
  );
};

// Camera controller with sphere rotation for thought focus
const CameraController: React.FC = () => {
  const { camera } = useThree();
  const { isInputMode, sphereCenter, targetRotation, clearTargetRotation } = useThoughts();
  const controlsRef = useRef<any>();
  const currentRotation = useRef({ x: 0, y: 0 });

  useFrame(() => {
    if (controlsRef.current) {
      // Handle input mode camera positioning
      if (isInputMode) {
        const targetPosition = new THREE.Vector3(0, 0, 5);
        camera.position.lerp(targetPosition, 0.05);
        controlsRef.current.target.lerp(sphereCenter, 0.05);
        controlsRef.current.update();
      }
      
      // Handle thought focus rotation
      if (targetRotation) {
        const lerpFactor = 0.05;
        
        // Smoothly interpolate to target rotation
        currentRotation.current.x += (targetRotation.x - currentRotation.current.x) * lerpFactor;
        currentRotation.current.y += (targetRotation.y - currentRotation.current.y) * lerpFactor;
        
        // Apply rotation to camera orbit
        const distance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
        const newX = Math.cos(currentRotation.current.x) * Math.sin(currentRotation.current.y + Math.PI) * distance;
        const newY = Math.sin(currentRotation.current.x) * distance;
        const newZ = Math.cos(currentRotation.current.x) * Math.cos(currentRotation.current.y + Math.PI) * distance;
        
        const targetCameraPos = new THREE.Vector3(newX, newY, newZ);
        camera.position.lerp(targetCameraPos, lerpFactor);
        
        // Check if rotation is complete
        if (Math.abs(targetRotation.x - currentRotation.current.x) < 0.01 &&
            Math.abs(targetRotation.y - currentRotation.current.y) < 0.01) {
          clearTargetRotation();
        }
        
        controlsRef.current.update();
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={!isInputMode && !targetRotation}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={2}
      maxDistance={20}
      target={[0, 0, 0]}
    />
  );
};

// Main scene component
const Scene: React.FC<{ onSphereClick: (event: any) => void }> = ({ onSphereClick }) => {
  const { thoughts, currentParentId, navigateBack } = useThoughts();
  
  // Filter thoughts based on current sphere
  const { currentSphereId, getSphereThoughts, getSpheres } = useThoughts();
  
  // Get thoughts for current sphere or main sphere if none selected
  const currentThoughts = currentSphereId 
    ? getSphereThoughts(currentSphereId)
    : thoughts.filter(t => t.thoughtType === 'thought' && (t.sphereId === currentSphereId || t.isMainSphere || !t.sphereId));
  
  // Get current sphere info
  const currentSphere = currentSphereId 
    ? getSpheres().find(s => s.sphereId === currentSphereId)
    : getSpheres().find(s => s.isMainSphere);
    
  console.log('ThoughtSphere render - currentSphereId:', currentSphereId);
  console.log('Current sphere:', currentSphere);
  console.log('Current thoughts count:', currentThoughts.length);
  console.log('All spheres:', getSpheres());
  
  // Get center thought if we're in a nested view
  const centerThought = currentParentId 
    ? thoughts.find(t => t.id === currentParentId)
    : null;
  
  // Get current sphere title for display in center
  const sphereTitle = currentSphere?.title || (currentSphereId ? 'New Sphere' : 'Enter your first thought');
  const [isDay, setIsDay] = useState(isDaytime());
  
  // Check time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setIsDay(isDaytime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Hide wireframe sphere once any thoughts are added
  const showWireframe = currentThoughts.length === 0;

  return (
    <>
      {/* Dynamic Lighting based on time of day */}
      {isDay ? (
        <>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 8]} intensity={1.4} color="#ffffff" />
          <directionalLight position={[-5, -5, 5]} intensity={0.7} color="#f1f5f9" />
          <pointLight position={[0, 0, 10]} intensity={1.0} color="#ffffff" />
        </>
      ) : (
        <>
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 8]} intensity={0.8} color="#e2e8f0" />
          <directionalLight position={[-5, -5, 5]} intensity={0.4} color="#64748b" />
          <pointLight position={[0, 0, 10]} intensity={0.6} color="#cbd5e1" />
        </>
      )}
      
      {/* Show wireframe sphere only when no thoughts exist */}
      {showWireframe && <Sphere onClick={onSphereClick} isSubSphere={Boolean(currentParentId)} />}
      
      {/* Invisible clickable sphere when wireframe is hidden - smaller to avoid blocking thoughts */}
      {!showWireframe && (
        <mesh onClick={onSphereClick} position={[0, 0, 0]} renderOrder={0}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
      
      {/* Display current sphere title in center when thoughts exist */}
      {!currentParentId && currentSphere && sphereTitle && (
        <Billboard position={[0, 0, 0]} follow renderOrder={2000}>
          <Text
            fontSize={0.4}
            maxWidth={4}
            lineHeight={1.1}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            color="#ef4444"
            outlineWidth={0.02}
            outlineColor="#ffffff"
            fillOpacity={0.98}
            renderOrder={2000}
          >
            {sphereTitle}
          </Text>
        </Billboard>
      )}

      {/* Render center thought in nested view */}
      {centerThought && (
        <Billboard position={[0, 0, 0]} follow renderOrder={2000}>
          <Text
            fontSize={0.25}
            maxWidth={3}
            lineHeight={1.1}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            color="#ef4444"
            outlineWidth={0.01}
            outlineColor="#ffffff"
            fillOpacity={0.98}
            renderOrder={2000}
          >
            {centerThought.text}
          </Text>
        </Billboard>
      )}

      {/* Back button for nested navigation */}
      {currentParentId && (
        <Html fullscreen style={{ pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#94a3b8',
              fontWeight: 600,
              cursor: 'pointer',
              userSelect: 'none',
              textShadow: 'none',
              pointerEvents: 'auto'
            }}
            onClick={(e) => {
              e.stopPropagation();
              navigateBack();
            }}
          >
            ← Back to Main Sphere
          </div>
        </Html>
      )}
      
      {/* Render current level thoughts */}
      {currentThoughts.map((thought, index) => (
        <ThoughtText key={thought.id} thought={thought} index={index} totalThoughts={currentThoughts.length} />
      ))}
      
      {/* Camera controls */}
      <CameraController />
    </>
  );
};

// Main ThoughtSphere component (WebGL only)
export const ThoughtSphere: React.FC<{ onSphereClick: (event: any) => void }> = ({ onSphereClick }) => {
  const [isDay, setIsDay] = useState(isDaytime());
  
  // Check time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setIsDay(isDaytime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const backgroundColor = isDay ? "#f8fafc" : "#1e293b";

  return (
    <Canvas
      camera={{
        position: [0, 0, 6],
        fov: 45,
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
        background: 'transparent'
      }}
    >
      <color attach="background" args={[backgroundColor]} />
      <Scene onSphereClick={onSphereClick} />
    </Canvas>
  );
};
