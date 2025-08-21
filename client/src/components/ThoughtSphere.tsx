import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useThoughts } from '@/lib/stores/useThoughts';

// Helper function to determine if it's day or night
const isDaytime = () => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18; // Day from 6 AM to 6 PM
};

// Sphere component
const Sphere: React.FC<{ onClick: (event: any) => void }> = ({ onClick }) => {
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
  useFrame((state) => {
    if (meshRef.current && !isInputMode) {
      meshRef.current.rotation.y += 0.001;
      meshRef.current.rotation.x += 0.0005;
    }
    if (shadowRef.current && !isInputMode) {
      shadowRef.current.rotation.y += 0.001;
      shadowRef.current.rotation.x += 0.0005;
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
      >
        <sphereGeometry args={[2.02, 32, 32]} />
        <meshBasicMaterial 
          transparent 
          opacity={0.3}
          color={shadowColor}
          wireframe={true}
          wireframeLinewidth={0.5}
        />
      </mesh>
      
      {/* Main sphere */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        position={[0, 0, 0]}
      >
        <sphereGeometry args={[2, 80, 80]} />
        <meshBasicMaterial 
          transparent 
          opacity={0.4}
          color={sphereColor}
          wireframe={true}
          wireframeLinewidth={0.6}
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
  
  // Text should remain stationary - no rotation with sphere

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
    >
      <Billboard
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
      >
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
      minDistance={3}
      maxDistance={15}
      target={[0, 0, 0]}
    />
  );
};

// Main scene component
const Scene: React.FC<{ onSphereClick: (event: any) => void }> = ({ onSphereClick }) => {
  const { thoughts, currentParentId, navigateBack, isEarthMode } = useThoughts();
  
  // Filter thoughts based on current navigation level and mode
  const currentThoughts = currentParentId 
    ? thoughts.filter(t => t.parentId === currentParentId && t.mode === 'sphere')
    : thoughts.filter(t => !t.parentId && t.mode === 'sphere');

  // Get center thought if we're in a nested view
  const centerThought = currentParentId 
    ? thoughts.find(t => t.id === currentParentId)
    : null;
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
      {showWireframe && <Sphere onClick={onSphereClick} />}
      
      {/* Invisible clickable sphere when wireframe is hidden - smaller to avoid blocking thoughts */}
      {!showWireframe && (
        <mesh onClick={onSphereClick} position={[0, 0, 0]}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}

      {/* Render center thought in nested view */}
      {centerThought && (
        <group position={[0, 0, 0]}>
          <Text
            fontSize={0.25}
            maxWidth={3}
            lineHeight={1.1}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            color={isDay ? "#1e293b" : "#f1f5f9"}
            outlineWidth={0.01}
            outlineColor={isDay ? "#ffffff" : "#000000"}
            fillOpacity={0.9}
          >
            {centerThought.text}
          </Text>
        </group>
      )}

      {/* Back button for nested navigation */}
      {currentParentId && (
        <group position={[0, -3, 0]}>
          <Text
            fontSize={0.15}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            color="#ef4444"
            outlineWidth={0.005}
            outlineColor="#ffffff"
            onClick={(e) => {
              e.stopPropagation();
              navigateBack();
            }}
          >
            ← Back to Main Sphere
          </Text>
        </group>
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

// CSS-based 3D Sphere Component with Thoughts (No WebGL Required)
const CSSSphere: React.FC<{ onClick: (event: any) => void }> = ({ onClick }) => {
  const [isDay, setIsDay] = useState(isDaytime());
  const { thoughts, currentParentId } = useThoughts();
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsDay(isDaytime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const sphereColor = isDay ? "#94a3b8" : "#64748b";
  
  // Filter thoughts based on current navigation level and mode
  const currentThoughts = currentParentId 
    ? thoughts.filter(t => t.parentId === currentParentId && t.mode === 'sphere')
    : thoughts.filter(t => !t.parentId && t.mode === 'sphere');

  // Get center thought if we're in a nested view
  const centerThought = currentParentId 
    ? thoughts.find(t => t.id === currentParentId)
    : null;

  console.log('CSSSphere rendering:', {
    totalThoughts: thoughts.length,
    currentThoughts: currentThoughts.length,
    currentParentId,
    thoughts: thoughts.slice(0, 3) // Show first 3 thoughts for debugging
  });

  return (
    <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: '1000px' }}>
      {/* CSS 3D Wireframe Sphere */}
      <div 
        className="relative w-96 h-96 cursor-pointer transform-gpu transition-transform duration-1000 hover:scale-110"
        onClick={onClick}
        style={{
          transformStyle: 'preserve-3d',
          animation: 'sphere-rotate 20s linear infinite',
          filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
        }}
      >
        {/* Main sphere container */}
        <div 
          className="absolute inset-0 rounded-full border-2 border-gray-400"
          style={{
            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, rgba(200,200,200,0.1) 50%, rgba(100,100,100,0.05) 100%)`,
            boxShadow: `
              inset 0 0 50px rgba(0,0,0,0.1),
              0 0 30px rgba(0,0,0,0.2),
              0 10px 20px rgba(0,0,0,0.1),
              inset 0 0 100px rgba(255,255,255,0.05)
            `,
            transform: 'rotateX(20deg) rotateY(20deg)',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Wireframe lines using CSS */}
          <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
            {/* Vertical lines */}
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={`v-${i}`}
                className="absolute w-px bg-gray-400 opacity-70"
                style={{
                  left: `${(i / 12) * 100}%`,
                  height: '100%',
                  transform: `rotateY(${(i / 12) * 360}deg) translateZ(10px)`,
                  boxShadow: '0 0 2px rgba(0,0,0,0.3)'
                }}
              />
            ))}
            
            {/* Horizontal lines */}
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={`h-${i}`}
                className="absolute h-px bg-gray-400 opacity-70"
                style={{
                  top: `${(i / 8) * 100}%`,
                  width: '100%',
                  transform: `rotateX(${(i / 8) * 180}deg) translateZ(10px)`,
                  boxShadow: '0 0 2px rgba(0,0,0,0.3)'
                }}
              />
            ))}
          </div>
          
          {/* Center thought icon - only show when no thoughts exist */}
          {currentThoughts.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl text-gray-600 drop-shadow-lg z-10">
                💭
              </div>
            </div>
          )}
          
          {/* Center thought in nested view */}
          {centerThought && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 mb-2">
                  {centerThought.text}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Render thoughts around the sphere using CSS positioning */}
      {currentThoughts.map((thought, index) => {
        // Calculate position around the sphere with better spacing
        const angle = (index / currentThoughts.length) * 2 * Math.PI;
        const radius = 220; // Increased distance from center to avoid overlap
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        // Calculate font size based on thought count
        const baseSize = 16;
        const minSize = 12;
        const maxSize = 24;
        const fontSize = Math.max(minSize, Math.min(maxSize, baseSize - (currentThoughts.length * 0.5)));
        
        return (
          <div
            key={thought.id}
            className="absolute cursor-pointer hover:scale-110 transition-transform duration-200"
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
              fontSize: `${fontSize}px`,
              color: isDay ? '#1e293b' : '#f1f5f9',
              textShadow: isDay ? '0 0 6px rgba(255,255,255,0.9)' : '0 0 6px rgba(0,0,0,0.9)',
              zIndex: 30, // Higher z-index to ensure thoughts are above everything
              maxWidth: '140px', // Slightly wider to accommodate longer text
              textAlign: 'center',
              wordBreak: 'break-word',
              fontWeight: '500', // Make text more readable
              backgroundColor: isDay ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', // Subtle background
              padding: '4px 8px',
              borderRadius: '4px',
              backdropFilter: 'blur(2px)'
            }}
            onClick={(e) => {
              e.stopPropagation();
              // Handle thought interaction
              console.log('Thought clicked:', thought.text);
            }}
          >
            {thought.text}
          </div>
        );
      })}
      
      {/* Back button for nested navigation */}
      {currentParentId && (
        <div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer text-red-500 hover:text-red-600 transition-colors"
          onClick={() => {
            // Handle thought interaction
            console.log('Back to main sphere');
          }}
        >
          ← Back to Main Sphere
        </div>
      )}
    </div>
  );
};

// Main ThoughtSphere component with CSS fallback
export const ThoughtSphere: React.FC<{ onSphereClick: (event: any) => void; forceCSSMode?: boolean }> = ({ onSphereClick, forceCSSMode = false }) => {
  const [isDay, setIsDay] = useState(isDaytime());
  const [useCSSFallback, setUseCSSFallback] = useState(false);
  const { thoughts } = useThoughts(); // Add this line to get thoughts
  
  // Check time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setIsDay(isDaytime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const backgroundColor = isDay ? "#f8fafc" : "#1e293b";

  // Use CSS fallback if WebGL fails or if forced
  if (useCSSFallback || forceCSSMode) {
    console.log('Using CSS fallback mode. Thoughts count:', thoughts.length);
    return (
      <div className="w-full h-full" style={{ background: backgroundColor }}>
        <CSSSphere onClick={onSphereClick} />
        
        {/* Instructions overlay */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center text-gray-600 text-sm">
          <p>Click the sphere to add thoughts • Hover & click thoughts to interact (CSS Mode)</p>
        </div>
      </div>
    );
  }

  return (
    <Canvas
      camera={{
        position: [0, 0, 8],
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
      onCreated={({ gl }) => {
        console.log('WebGL context created successfully');
        // Check if WebGL is working
        if (!gl.getContext().getExtension('WEBGL_debug_renderer_info')) {
          console.warn('WebGL debug info not available');
        }
      }}
      onError={(error) => {
        console.error('WebGL Error, falling back to CSS:', error);
        setUseCSSFallback(true);
      }}
    >
      <color attach="background" args={[backgroundColor]} />
      <Scene onSphereClick={onSphereClick} />
    </Canvas>
  );
};
