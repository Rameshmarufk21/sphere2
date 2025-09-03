import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Sphere, Line, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useThoughts } from '../lib/stores/useThoughts';

// Planet Component
const Planet: React.FC<{ 
  index: number; 
  color: string; 
  orbitRadius: number;
  orbitSpeed: number;
  planetSize: number;
  eccentricity: number;
  name: string;
  sphereId?: string;
  thoughtCount?: number;
  onPlanetClick: (planetData: any) => void;
}> = ({ index, color, orbitRadius, orbitSpeed, planetSize, eccentricity, name, sphereId, thoughtCount, onPlanetClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Optimized planet orbit animation
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      const angle = time * orbitSpeed;
      
      // Simplified elliptical orbit calculation
      const x = orbitRadius * Math.cos(angle);
      const z = orbitRadius * Math.sin(angle) * (1 - eccentricity * 0.5);
      
      meshRef.current.position.set(x, 0, z);
      meshRef.current.rotation.y = time * 0.5;
    }
  });

  const handleClick = (event: any) => {
    event.stopPropagation();
    console.log('🪐 Planet clicked:', { name, sphereId, thoughtCount, index });
    onPlanetClick({
      name,
      color,
      size: planetSize,
      index,
      sphereId,
      thoughtCount
    });
  };



  // Helper function to get lighter and darker shades of the planet color
  const getColorShades = (baseColor: string) => {
    const color = new THREE.Color(baseColor);
    
    // Lighter shade for middle layer
    const lighterColor = color.clone();
    lighterColor.lerp(new THREE.Color(0xffffff), 0.4);
    
    // Darker shade for outer layer
    const darkerColor = color.clone();
    darkerColor.lerp(new THREE.Color(0x000000), 0.6);
    
    return { lighter: lighterColor, darker: darkerColor };
  };

  const { lighter, darker } = getColorShades(color);

  return (
    <group>
      {/* Layer 1: Innermost Core - Wireframe sphere */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
      >
        <sphereGeometry args={[planetSize * 1.2, 12, 12]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={1.0}
          wireframe
        />
      </mesh>

      {/* Layer 2: Middle Layer - Solid faceted sphere */}
      <mesh>
        <sphereGeometry args={[planetSize * 1.3, 6, 6]} />
        <meshStandardMaterial
          color={lighter}
          transparent
          opacity={0.9}
          flatShading
        />
      </mesh>


    </group>
  );
};

// Barred Spiral Galaxy Component
const BarredSpiralGalaxy: React.FC = () => {
  const galaxyRef = useRef<THREE.Group>(null);

  // Optimized barred spiral galaxy structure
  const galaxyStars = useMemo(() => {
    const stars: THREE.Vector3[] = [];
    const colors: THREE.Color[] = [];
    
    // Galaxy parameters - optimized for performance
    const totalStars = 3000;
    const barLength = 20;
    const barWidth = 4;
    const spiralArmCount = 6;
    const spiralLength = 40;
    
    for (let i = 0; i < totalStars; i++) {
      let x, y, z;
      let color: THREE.Color;
      
      // 20% of stars in the central bar with better blending
      if (i < totalStars * 0.2) {
        // Bar stars - more scattered and blended
        x = (Math.random() - 0.5) * barLength;
        y = (Math.random() - 0.5) * barWidth * 3; // Increased height variation
        z = (Math.random() - 0.5) * barWidth * 3; // Increased depth variation
        
        // Add some randomness to break rectangular pattern
        if (Math.random() < 0.4) {
          x += (Math.random() - 0.5) * 8;
          z += (Math.random() - 0.5) * 8;
        }
        
        // Bar stars are yellow-white (older stars)
        color = new THREE.Color(1, 0.9 + Math.random() * 0.1, 0.7 + Math.random() * 0.3);
      } else {
        // Spiral arm stars - create distinct arms with gaps between them
        const arm = Math.floor(Math.random() * spiralArmCount);
        const armAngle = (arm / spiralArmCount) * Math.PI * 2;
        const distance = Math.random() * spiralLength;
        
        // Spiral formula
        const spiralAngle = armAngle + (distance / spiralLength) * Math.PI * 3;
        
        // Base spiral position
        x = Math.cos(spiralAngle) * distance;
        z = Math.sin(spiralAngle) * distance;
        y = (Math.random() - 0.5) * 8;
        
        // Add randomness within the arm but keep arms distinct
        const armOffset = (Math.random() - 0.5) * 8; // Reduced to keep arms visible
        x += Math.cos(spiralAngle + Math.PI/2) * armOffset;
        z += Math.sin(spiralAngle + Math.PI/2) * armOffset;
        
        // Color based on distance from center
        if (distance < 10) {
          // Inner arms - blue-white (young stars)
          color = new THREE.Color(0.7 + Math.random() * 0.3, 0.8 + Math.random() * 0.2, 1);
        } else if (distance < 20) {
          // Middle arms - white
          color = new THREE.Color(0.9 + Math.random() * 0.1, 0.9 + Math.random() * 0.1, 0.9 + Math.random() * 0.1);
        } else {
          // Outer arms - yellow-orange (older stars)
          color = new THREE.Color(1, 0.8 + Math.random() * 0.2, 0.6 + Math.random() * 0.4);
        }
      }
      
      stars.push(new THREE.Vector3(x, y, z));
      colors.push(color);
    }
    
    return { stars, colors };
  }, []);

  // Animate galaxy rotation
  useFrame(() => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <group ref={galaxyRef}>
      {/* Render each star as a small sphere */}
      {galaxyStars.stars.map((position, index) => (
        <mesh key={index} position={position}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshBasicMaterial
            color={galaxyStars.colors[index]}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
};

// Sun Component
const Sun: React.FC<{ onSunClick: (sunData: any) => void }> = ({ onSunClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Animate sun rotation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  const handleClick = () => {
    onSunClick({
      name: 'Sun',
      color: '#FFD700',
      size: 6.0,
      index: -1
    });
  };



  return (
    <group>
      {/* Main sun sphere */}
      <mesh
        ref={meshRef}
        onClick={handleClick}

      >
        <sphereGeometry args={[6.0, 32, 32]} />
        <meshStandardMaterial
          color="#FDB813"
          transparent
          opacity={0.9}
          wireframe
        />
      </mesh>

      {/* Sun atmospheric glow */}
      <mesh>
        <sphereGeometry args={[7.2, 16, 16]} />
        <meshBasicMaterial
          color="#FDB813"
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Sun rays effect */}
      <mesh>
        <sphereGeometry args={[9.0, 16, 16]} />
        <meshBasicMaterial
          color="#FDB813"
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>



    </group>
  );
};

// Solar System Component
const SolarSystem: React.FC<{ onPlanetClick: (planetData: any) => void }> = ({ onPlanetClick }) => {
  const { getSpheres } = useThoughts();
  
  // Get spheres from Galaxy Shelf (excluding subspheres)
  const userSpheres = getSpheres().filter(sphere => !sphere.parentSphereId);
  
  // Default planet template with orbital mechanics - increased distances
  const defaultPlanets = [
    { name: 'Mercury', color: '#FFFFFF', orbitRadius: 12, orbitSpeed: 0.3, size: 3.0, eccentricity: 0.6 },
    { name: 'Venus', color: '#FFFF00', orbitRadius: 16, orbitSpeed: 0.25, size: 3.2, eccentricity: 0.5 },
    { name: 'Earth', color: '#00BFFF', orbitRadius: 20, orbitSpeed: 0.2, size: 3.0, eccentricity: 0.4 },
    { name: 'Mars', color: '#FF0000', orbitRadius: 25, orbitSpeed: 0.18, size: 2.8, eccentricity: 0.6 },
    { name: 'Jupiter', color: '#FFA500', orbitRadius: 30, orbitSpeed: 0.15, size: 3.5, eccentricity: 0.3 },
    { name: 'Saturn', color: '#FFD700', orbitRadius: 36, orbitSpeed: 0.12, size: 3.3, eccentricity: 0.4 },
    { name: 'Uranus', color: '#00FFFF', orbitRadius: 42, orbitSpeed: 0.1, size: 3.1, eccentricity: 0.5 },
    { name: 'Neptune', color: '#0000FF', orbitRadius: 48, orbitSpeed: 0.08, size: 3.2, eccentricity: 0.3 }
  ];
  
  // Create dynamic planets from user spheres
  const planets = useMemo(() => {
    if (userSpheres.length === 0) {
      return defaultPlanets; // Show default planets if no spheres created
    }
    
    // Sort spheres by thought count (ascending - smallest first)
    const sortedSpheres = [...userSpheres].sort((a, b) => {
      const aThoughts = a.thoughts?.length || 0;
      const bThoughts = b.thoughts?.length || 0;
      return aThoughts - bThoughts;
    });
    
    // Map sorted spheres to planet positions
    return defaultPlanets.map((planet, index) => {
      if (index < sortedSpheres.length) {
        const sphere = sortedSpheres[index];
        const thoughtCount = sphere.thoughts?.length || 0;
        
        // Calculate size based on thought count (min 2.5, max 4.0)
        const size = Math.max(2.5, Math.min(4.0, 2.5 + (thoughtCount * 0.15)));
        
        // Generate color based on sphere title
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
        const color = colors[index % colors.length];
        
        return {
          ...planet,
          name: sphere.title || `Sphere ${index + 1}`,
          color: color,
          size: size,
          sphereId: sphere.sphereId,
          thoughtCount: thoughtCount
        };
      }
      return planet; // Keep default planet if no sphere available
    });
  }, [userSpheres]);

  console.log('🪐 SolarSystem: Rendering', planets.length, 'planets:', planets.map(p => ({ name: p.name, sphereId: p.sphereId, thoughtCount: p.thoughtCount })));
  
  return (
    <>
      {/* Sun at the center */}
      <Sun onSunClick={onPlanetClick} />
      
      {/* Planets orbiting around the sun */}
      {planets.map((planet, index) => (
        <Planet
          key={planet.name}
          index={index}
          color={planet.color}
          orbitRadius={planet.orbitRadius}
          orbitSpeed={planet.orbitSpeed}
          planetSize={planet.size}
          eccentricity={planet.eccentricity}
          name={planet.name}
          sphereId={planet.sphereId}
          thoughtCount={planet.thoughtCount}
          onPlanetClick={onPlanetClick}
        />
      ))}

      {/* Barred Spiral Galaxy Background */}
      <BarredSpiralGalaxy />
    </>
  );
};

// PlanetSphere3D Component - 3D content inside Canvas
const PlanetSphere3D: React.FC<{ planetData: any }> = ({ planetData }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Animate planet rotation - simplified to prevent stack overflow
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={1.0} color="#ffffff" />
      <pointLight position={[0, -10, 0]} intensity={0.5} color="#ffffff" />
      
      {/* Planet as large sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[3, 16, 16]} />
        <meshStandardMaterial
          color={planetData.color}
          transparent
          opacity={0.8}
          wireframe
        />
      </mesh>

      {/* Planet atmospheric glow */}
      <mesh>
        <sphereGeometry args={[3.5, 16, 16]} />
        <meshBasicMaterial
          color={planetData.color}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Enhanced outer glow */}
      <mesh>
        <sphereGeometry args={[4.0, 16, 16]} />
        <meshBasicMaterial
          color={planetData.color}
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>

      {/* Camera Controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={20}
      />
    </>
  );
};

// PlanetSphere Component - displays clicked planet as large sphere
const PlanetSphere: React.FC<{ 
  planetData: any; 
  onBackToSolarSystem: () => void;
}> = ({ planetData, onBackToSolarSystem }) => {
  return (
    <div className="w-full h-full bg-black">
      {/* 3D Canvas */}
      <div className="flex-1 h-full relative">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          style={{ background: 'black' }}
        >
          <PlanetSphere3D planetData={planetData} />
        </Canvas>

        

        {/* Planet Info */}
        <div className="absolute top-4 right-4 text-white text-xs bg-black/20 backdrop-blur-sm px-3 py-2 rounded border border-white/10">
          <div className="font-mono font-bold">{planetData.name}</div>
          <div className="font-mono text-gray-300">Size: {planetData.size}</div>
        </div>
      </div>

               {/* Back to Galaxy Button */}
         <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
           <button
             onClick={onBackToSolarSystem}
             className="text-white hover:text-blue-300 transition-colors font-medium flex items-center gap-2"
           >
             ← Back to Galaxy
           </button>
         </div>

         {/* Instructions */}
         <div className="absolute bottom-4 left-4 right-4">
           <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10 text-center">
             <p className="text-white text-xs">
               🖱️ <strong>Mouse:</strong> Rotate view • Scroll: Zoom • Explore {planetData.name}
             </p>
           </div>
         </div>
    </div>
  );
};

// Main TestX Component
const TestX: React.FC = () => {
  const { thoughts, setViewMode, navigateToSphere } = useThoughts();
  const [currentView, setCurrentView] = useState<'solar-system' | 'planet-sphere'>('solar-system');
  const [selectedPlanet, setSelectedPlanet] = useState<any>(null);

  const handleBackToSphere = () => {
    setViewMode('sphere');
  };

  const handlePlanetClick = (planetData: any) => {
    console.log('🪐 handlePlanetClick called with:', planetData);
    // If it's a user sphere, navigate to that sphere
    if (planetData.sphereId) {
      console.log('🪐 Navigating to user sphere:', planetData.sphereId);
      navigateToSphere(planetData.sphereId);
      setViewMode('sphere');
    } else {
      console.log('🪐 Showing default planet view for:', planetData.name);
      // If it's a default planet, show planet view
      setSelectedPlanet(planetData);
      setCurrentView('planet-sphere');
    }
  };

  const handleBackToSolarSystem = () => {
    setCurrentView('solar-system');
    setSelectedPlanet(null);
  };

  // Render different views based on current state
  if (currentView === 'planet-sphere' && selectedPlanet) {
    return (
      <PlanetSphere 
        planetData={selectedPlanet} 
        onBackToSolarSystem={handleBackToSolarSystem} 
      />
    );
  }

  return (
    <div className="w-full h-full bg-black">
      {/* 3D Canvas */}
      <div className="flex-1 h-full relative">
        <Canvas
          camera={{ position: [0, 15, 30], fov: 60 }}
          style={{ background: 'black' }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <pointLight position={[0, 0, 0]} intensity={1.5} color="#ffd700" />
          <pointLight position={[0, 10, 0]} intensity={0.5} color="#ffffff" />
          
          <SolarSystem onPlanetClick={handlePlanetClick} />
          
          {/* Camera Controls - allow zooming to all planets */}
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={150}
          />
        </Canvas>

        {/* Stats in corners like astronomical images */}
        {/* Top Left */}
        <div className="absolute top-4 left-4 text-white text-xs bg-black/20 backdrop-blur-sm px-2 py-1 rounded border border-white/10">
          <div className="font-mono">Mode: Test X - Barred Spiral Galaxy</div>
        </div>

        {/* Top Right */}
        <div className="absolute top-4 right-4 text-white text-xs bg-black/20 backdrop-blur-sm px-2 py-1 rounded border border-white/10">
          <div className="font-mono">Solar System</div>
        </div>
      </div>

      {/* Instructions Overlay */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10 text-center">
          <p className="text-white text-xs">
            🖱️ <strong>Mouse:</strong> Rotate view • Scroll: Zoom • Click planets to explore
          </p>
          <p className="text-gray-300 text-xs mt-1">

          </p>
        </div>
      </div>
    </div>
  );
};

export default TestX;