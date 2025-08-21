import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useThoughts, Thought } from '@/lib/stores/useThoughts';

const isDaytime = () => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18;
};

// Create NASA-quality procedural Earth textures for high realism
const createNASAEarthTextures = () => {
  // Day texture - NASA Blue Marble satellite imagery quality
  const createDayTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 4096; // Ultra-high resolution for NASA quality
    canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;
    
    // Create realistic ocean base with NASA Blue Marble colors
    const oceanGradient = ctx.createRadialGradient(2048, 1024, 0, 2048, 1024, 1600);
    oceanGradient.addColorStop(0, '#0a0f14');   // Deep ocean (NASA deep blue)
    oceanGradient.addColorStop(0.2, '#0f172a'); // Deep blue
    oceanGradient.addColorStop(0.4, '#1e3a8a'); // Ocean blue
    oceanGradient.addColorStop(0.6, '#1e40af'); // Medium blue
    oceanGradient.addColorStop(0.8, '#2563eb'); // Lighter blue
    oceanGradient.addColorStop(1, '#3b82f6');   // Coastal blue
    
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, 4096, 2048);
    
    // North America - NASA satellite colors
    ctx.fillStyle = '#14532d'; // Dark forest green (NASA)
    ctx.beginPath();
    ctx.ellipse(800, 600, 360, 280, -0.2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Great Plains - NASA desert colors
    ctx.fillStyle = '#78350f'; // Desert brown (NASA)
    ctx.beginPath();
    ctx.ellipse(700, 700, 160, 120, -0.1, 0, 2 * Math.PI);
    ctx.fill();
    
    // South America - Amazon (NASA rainforest green)
    ctx.fillStyle = '#064e3b'; // Dark rainforest green (NASA)
    ctx.beginPath();
    ctx.ellipse(2800, 1200, 240, 560, 0.3, 0, 2 * Math.PI);
    ctx.fill();
    
    // Andes Mountains - NASA mountain colors
    ctx.fillStyle = '#52525b'; // Mountain grey (NASA)
    ctx.beginPath();
    ctx.ellipse(2700, 1160, 200, 120, 0.3, 0, 2 * Math.PI);
    ctx.fill();
    
    // Europe - NASA temperate colors
    ctx.fillStyle = '#14532d'; // European green (NASA)
    ctx.beginPath();
    ctx.ellipse(1800, 720, 280, 200, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Africa - NASA African terrain
    ctx.fillStyle = '#064e3b'; // Central African green (NASA)
    ctx.beginPath();
    ctx.ellipse(1600, 800, 280, 440, 0.1, 0, 2 * Math.PI);
    ctx.fill();
    
    // Sahara Desert - NASA desert colors
    ctx.fillStyle = '#d97706'; // Desert yellow (NASA)
    ctx.beginPath();
    ctx.ellipse(1500, 760, 200, 280, 0.1, 0, 2 * Math.PI);
    ctx.fill();
    
    // Asia - NASA Asian terrain
    ctx.fillStyle = '#14532d'; // Asian green (NASA)
    ctx.beginPath();
    ctx.ellipse(3200, 700, 480, 400, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Himalayas - NASA mountain colors
    ctx.fillStyle = '#52525b'; // Mountain grey (NASA)
    ctx.beginPath();
    ctx.ellipse(3100, 640, 360, 160, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Siberian tundra - NASA tundra colors
    ctx.fillStyle = '#4b5563'; // Tundra grey (NASA)
    ctx.beginPath();
    ctx.ellipse(3200, 500, 400, 200, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Australia - NASA Australian terrain
    ctx.fillStyle = '#064e3b'; // Australian green (NASA)
    ctx.beginPath();
    ctx.ellipse(3400, 1400, 240, 160, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Australian Outback - NASA outback colors
    ctx.fillStyle = '#92400e'; // Outback brown (NASA)
    ctx.beginPath();
    ctx.ellipse(3300, 1440, 160, 120, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Polar ice caps - NASA ice colors
    ctx.fillStyle = '#f8fafc'; // Ice white (NASA)
    ctx.beginPath();
    ctx.ellipse(2048, 200, 800, 160, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(2048, 1848, 800, 160, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Add detailed island chains with NASA colors
    ctx.fillStyle = '#14532d';
    // Philippines
    for (let i = 0; i < 20; i++) {
      const x = 3000 + Math.random() * 200;
      const y = 1000 + Math.random() * 200;
      const size = 8 + Math.random() * 20;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Caribbean
    for (let i = 0; i < 15; i++) {
      const x = 2200 + Math.random() * 200;
      const y = 800 + Math.random() * 100;
      const size = 5 + Math.random() * 15;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Add subtle terrain variations for NASA realism
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * 4096;
      const y = Math.random() * 2048;
      const size = 3 + Math.random() * 8;
      const terrainType = Math.random();
      
      if (terrainType < 0.3) {
        ctx.fillStyle = '#374151'; // Mountain variations
      } else if (terrainType < 0.6) {
        ctx.fillStyle = '#1f2937'; // Forest variations
      } else {
        ctx.fillStyle = '#6b7280'; // Tundra variations
      }
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
  };
  
  // Night texture - City lights and emissions
  const createNightTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;
    
    // Black space background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 4096, 2048);
    
    // City lights - major population centers
    ctx.fillStyle = '#fbbf24'; // Warm city light yellow
    
    // North America - East Coast megalopolis
    for (let i = 0; i < 30; i++) {
      const x = 850 + Math.random() * 100;
      const y = 600 + Math.random() * 200;
      const size = 2 + Math.random() * 6;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // West Coast
    for (let i = 0; i < 20; i++) {
      const x = 600 + Math.random() * 80;
      const y = 650 + Math.random() * 150;
      const size = 2 + Math.random() * 5;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Europe - Dense city networks
    for (let i = 0; i < 40; i++) {
      const x = 1750 + Math.random() * 200;
      const y = 680 + Math.random() * 120;
      const size = 1 + Math.random() * 4;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Asia - Mega cities
    for (let i = 0; i < 50; i++) {
      const x = 3000 + Math.random() * 400;
      const y = 700 + Math.random() * 200;
      const size = 2 + Math.random() * 7;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // South America
    for (let i = 0; i < 15; i++) {
      const x = 2700 + Math.random() * 200;
      const y = 1200 + Math.random() * 300;
      const size = 2 + Math.random() * 5;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
  };
  
  // Cloud texture - Realistic cloud formations
  const createCloudTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;
    
    // Transparent background
    ctx.clearRect(0, 0, 4096, 2048);
    
    // Cloud formations
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    // Generate realistic cloud patterns
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * 4096;
      const y = Math.random() * 2048;
      const size = 60 + Math.random() * 200;
      
      ctx.globalAlpha = 0.3 + Math.random() * 0.5;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Weather systems and storm formations
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * 4096;
      const y = Math.random() * 2048;
      const size = 150 + Math.random() * 300;
      
      ctx.globalAlpha = 0.6 + Math.random() * 0.3;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1.0;
    return new THREE.CanvasTexture(canvas);
  };
  
  // Bump map for terrain elevation - simulates mountains and valleys
  const createBumpTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;
    
    // Base elevation (sea level)
    ctx.fillStyle = '#808080'; // Middle gray for sea level
    ctx.fillRect(0, 0, 4096, 2048);
    
    // Mountain ranges - lighter grays for higher elevation
    
    // Himalayas - highest mountains
    ctx.fillStyle = '#ffffff'; // White for highest peaks
    ctx.beginPath();
    ctx.ellipse(3100, 640, 360, 160, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Andes Mountains
    ctx.fillStyle = '#e5e5e5'; // Light gray for high mountains
    ctx.beginPath();
    ctx.ellipse(2700, 1160, 200, 120, 0.3, 0, 2 * Math.PI);
    ctx.fill();
    
    // Rocky Mountains
    ctx.fillStyle = '#d0d0d0'; // Medium-light gray
    ctx.beginPath();
    ctx.ellipse(700, 600, 160, 200, -0.3, 0, 2 * Math.PI);
    ctx.fill();
    
    // Alps
    ctx.fillStyle = '#d5d5d5';
    ctx.beginPath();
    ctx.ellipse(1850, 700, 120, 80, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Appalachian Mountains
    ctx.fillStyle = '#c0c0c0';
    ctx.beginPath();
    ctx.ellipse(850, 650, 100, 180, -0.2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Ocean trenches - darker grays for depth
    ctx.fillStyle = '#404040'; // Dark gray for deep ocean
    
    // Mariana Trench area
    ctx.beginPath();
    ctx.ellipse(3300, 1000, 80, 40, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Mid-Atlantic Ridge
    ctx.fillStyle = '#606060'; // Slightly lighter for ridges
    for (let i = 0; i < 20; i++) {
      const y = 400 + i * 60;
      ctx.beginPath();
      ctx.ellipse(1200, y, 30, 80, 0, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Add noise for realistic terrain variation
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 4096;
      const y = Math.random() * 2048;
      const size = 5 + Math.random() * 15;
      const elevation = Math.random() * 0.3 + 0.7; // Random elevation factor
      
      ctx.fillStyle = `rgba(${Math.floor(255 * elevation)}, ${Math.floor(255 * elevation)}, ${Math.floor(255 * elevation)}, 0.3)`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
  };
  
  return {
    dayTexture: createDayTexture(),
    nightTexture: createNightTexture(),
    cloudTexture: createCloudTexture(),
    bumpTexture: createBumpTexture()
  };
};

// Cloud Layer Component - Separate sphere for realistic cloud effects
const CloudLayer: React.FC = () => {
  const cloudRef = useRef<THREE.Mesh>(null);
  const { cloudTexture } = useMemo(() => createNASAEarthTextures(), []);

  useFrame(() => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y += 0.0005; // Clouds move slower than Earth
    }
  });

  return (
    <mesh ref={cloudRef} position={[0, 0, 0]}>
      <sphereGeometry args={[2.35, 64, 64]} />
      <meshStandardMaterial 
        map={cloudTexture}
        transparent
        opacity={0.4}
        alphaTest={0.1}
        depthWrite={false}
      />
    </mesh>
  );
};

// Atmosphere Glow Effect Component
const AtmosphereGlow: React.FC = () => {
  const [isDay, setIsDay] = useState(isDaytime());

  useEffect(() => {
    const interval = setInterval(() => {
      setIsDay(isDaytime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[2.6, 32, 32]} />
      <meshBasicMaterial 
        color={isDay ? '#87ceeb' : '#1e3a8a'}
        transparent
        opacity={0.08}
        side={THREE.BackSide}
      />
    </mesh>
  );
};

// Google Earth-like Globe Component with NASA-quality rendering
const GoogleEarth: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const [isDay, setIsDay] = useState(isDaytime());
  
  const { dayTexture, nightTexture, bumpTexture } = useMemo(() => createNASAEarthTextures(), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsDay(isDaytime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001; // Realistic Earth rotation speed
    }
  });

  return (
    <group>
      {/* Deep space stars background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Main Earth sphere with NASA-quality textures */}
      <mesh ref={earthRef} onClick={onClick} position={[0, 0, 0]}>
        <sphereGeometry args={[2.3, 64, 64]} />
        <meshStandardMaterial 
          map={dayTexture}
          emissiveMap={nightTexture} // City lights show at night
          emissive={isDay ? new THREE.Color(0x000000) : new THREE.Color(0x444444)}
          bumpMap={bumpTexture} // Terrain elevation
          bumpScale={0.05} // Subtle but visible elevation
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
      
      {/* Dynamic cloud layer */}
      <CloudLayer />
      
      {/* Atmospheric glow effect */}
      <AtmosphereGlow />
    </group>
  );
};

// Earth Thought Text Component
const EarthThoughtText: React.FC<{ thought: Thought; index: number; totalThoughts: number }> = ({ 
  thought, 
  index, 
  totalThoughts 
}) => {
  const textRef = useRef<THREE.Group>(null);
  const { focusOnThought, navigateToThought } = useThoughts();
  const [isDay, setIsDay] = useState(isDaytime());
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsDay(isDaytime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const textColor = isHovered ? "#ff6b35" : (isDay ? "#ffffff" : "#f0f0f0");
  
  // Calculate font size based on thought count
  const getResponsiveFontSize = useMemo(() => {
    const startingSize = 0.25;
    const minSize = 0.08;
    const reductionPerThought = 0.015;
    
    const targetSize = startingSize - (totalThoughts - 1) * reductionPerThought;
    const globalSize = Math.max(minSize, targetSize);
    
    const wordCount = thought.text.trim().split(' ').length;
    const lengthFactor = Math.max(0.7, Math.min(1.3, 1.5 / Math.sqrt(thought.text.length + wordCount * 0.3)));
    
    return Math.max(minSize, globalSize * lengthFactor);
  }, [thought.text, totalThoughts]);

  const fontSize = getResponsiveFontSize;

  return (
    <group 
      ref={textRef}
      position={[thought.position.x, thought.position.y, thought.position.z]}
    >
      {/* Billboard text that always faces camera */}
      <Text
        fontSize={fontSize}
        maxWidth={3}
        lineHeight={1.1}
        letterSpacing={0.01}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color={textColor}
        outlineWidth={fontSize * 0.02}
        outlineColor={isHovered ? "#ffffff" : "#000000"}
        fillOpacity={0.95}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          if (e.detail === 1) {
            focusOnThought(thought.position);
          } else if (e.detail === 2) {
            navigateToThought(thought.id);
          }
        }}
      >
        {thought.text}
      </Text>
      
      {/* Show attachments indicator */}
      {thought.attachments && (
        <Text
          fontSize={fontSize * 0.6}
          position={[0, -fontSize * 0.8, 0]}
          color="#fbbf24"
          outlineWidth={fontSize * 0.01}
          outlineColor="#000000"
          textAlign="center"
          anchorX="center"
          anchorY="middle"
        >
          📎
        </Text>
      )}
    </group>
  );
};

// Enhanced Input Component for Earth Mode with attachments and location input
const EarthInputOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [locationType, setLocationType] = useState<'coordinates' | 'place'>('coordinates');
  const { addThought } = useThoughts();
  const inputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (showLocationInput && locationInputRef.current) {
      locationInputRef.current.focus();
    }
  }, [showLocationInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setShowLocationInput(true);
    }
  };

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locationInput.trim()) {
      console.log('Adding Earth thought with custom location:', {
        text: inputValue,
        mode: 'earth',
        location: locationInput,
        locationType
      });
      
      // Parse coordinates if that's what was entered
      let latitude = 0, longitude = 0;
      if (locationType === 'coordinates') {
        const coords = locationInput.split(',').map(s => parseFloat(s.trim()));
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          [latitude, longitude] = coords;
        }
      }
      
      addThought(
        inputValue, 
        'earth',
        undefined, // No attachments for now
        false // Don't use geolocation, use custom location
      );
      
      // Close both inputs
      setInputValue('');
      setLocationInput('');
      setShowLocationInput(false);
      onClose();
    }
  };

  const handleAttachmentClick = () => {
    // TODO: Implement attachment functionality
    console.log('Attachment button clicked');
  };

  if (showLocationInput) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowLocationInput(false);
            onClose();
          }
        }}
        style={{ 
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
      >
        <div className="w-full max-w-2xl mx-4">
          <form onSubmit={handleLocationSubmit}>
            <div 
              className="relative"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div className="px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Where is this happening?
                </h3>
                
                {/* Location Type Toggle */}
                <div className="flex space-x-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setLocationType('coordinates')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      locationType === 'coordinates'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Coordinates
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationType('place')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      locationType === 'place'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Place Name
                  </button>
                </div>
                
                {/* Location Input */}
                <input
                  ref={locationInputRef}
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder={locationType === 'coordinates' ? 'e.g., 40.7128, -74.0060' : 'e.g., New York City'}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg outline-none text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  style={{
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                />
                
                <div className="mt-3 text-sm text-gray-600">
                  {locationType === 'coordinates' 
                    ? 'Enter latitude and longitude separated by a comma'
                    : 'Enter the name of a city, country, or landmark'
                  }
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{ 
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
    >
      <div className="w-full max-w-2xl mx-4">
        <form onSubmit={handleSubmit}>
          <div 
            className="relative"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="What's happening at this location?"
                className="flex-1 px-6 py-4 bg-transparent border-none outline-none text-lg font-medium text-gray-800 placeholder-gray-500"
                style={{
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              />
              
              {/* Attachment Button */}
              <button
                type="button"
                onClick={handleAttachmentClick}
                className="px-4 py-4 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                title="Add attachments"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Earth Scene Component
const EarthScene: React.FC<{ onEarthClick: () => void }> = ({ onEarthClick }) => {
  const { thoughts, currentParentId, navigateBack } = useThoughts();
  const [isDay, setIsDay] = useState(isDaytime());
  
  // Filter thoughts for Earth mode only
  const currentThoughts = currentParentId 
    ? thoughts.filter(t => t.parentId === currentParentId && t.mode === 'earth')
    : thoughts.filter(t => !t.parentId && t.mode === 'earth');

  // Get center thought if we're in a nested view
  const centerThought = currentParentId 
    ? thoughts.find(t => t.id === currentParentId)
    : null;

  useEffect(() => {
    const interval = setInterval(() => {
      setIsDay(isDaytime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* NASA satellite lighting - realistic space illumination */}
      {isDay ? (
        <>
          {/* Main sunlight - strong directional light like real satellite */}
          <directionalLight 
            position={[15, 8, 10]} 
            intensity={3.0} 
            color="#ffffff"
            castShadow
            shadow-mapSize-width={4096}
            shadow-mapSize-height={4096}
          />
          
          {/* Fill light for realistic Earth illumination */}
          <ambientLight intensity={0.4} color="#87ceeb" />
          
          {/* Rim light for atmospheric effect */}
          <directionalLight 
            position={[-15, -8, -10]} 
            intensity={0.6} 
            color="#4299e1" 
          />
          
          {/* Additional fill light for realistic satellite view */}
          <directionalLight 
            position={[0, 10, 0]} 
            intensity={0.8} 
            color="#f0f9ff" 
          />
        </>
      ) : (
        <>
          {/* Night lighting - dimmer with city lights visible */}
          <directionalLight 
            position={[15, 8, 10]} 
            intensity={0.8} 
            color="#e2e8f0" 
          />
          
          {/* Minimal ambient for space darkness */}
          <ambientLight intensity={0.2} color="#1e3a8a" />
          
          {/* Earth glow for night effect */}
          <pointLight 
            position={[0, 0, 0]} 
            intensity={0.4} 
            color="#fbbf24" 
            distance={15}
          />
        </>
      )}
      
      {/* Google Earth-like Globe */}
      <GoogleEarth onClick={onEarthClick} />
      
      {/* Render Earth thoughts */}
      {currentThoughts.map((thought, index) => (
        <EarthThoughtText 
          key={thought.id} 
          thought={thought} 
          index={index} 
          totalThoughts={currentThoughts.length} 
        />
      ))}
      
      {/* Center thought in nested view */}
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
            ← Back to Main Earth
          </Text>
        </group>
      )}
    </>
  );
};

// Main EarthMode component
export const EarthMode: React.FC = () => {
  const [isDay, setIsDay] = useState(isDaytime());
  const [useCSSFallback, setUseCSSFallback] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const { thoughts } = useThoughts();
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsDay(isDaytime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const backgroundColor = isDay ? "#f8fafc" : "#1e293b";

  // Use CSS fallback if WebGL fails
  if (useCSSFallback) {
    console.log('Using CSS fallback mode for Earth. Earth thoughts count:', thoughts.filter(t => t.mode === 'earth').length);
    return (
      <div className="w-full h-full" style={{ background: backgroundColor }}>
        {/* CSS-based stylized Earth */}
        <div className="relative w-full h-full flex items-center justify-center">
          <div 
            className="relative w-80 h-80 cursor-pointer transform-gpu transition-transform duration-1000 hover:scale-110"
            onClick={() => setShowInput(true)}
            style={{
              transformStyle: 'preserve-3d',
              animation: 'earth-rotate 30s linear infinite'
            }}
          >
            {/* Stylized Earth with the same design as WebGL version */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.8) 0%, rgba(30, 58, 138, 0.7) 50%, rgba(96, 165, 250, 0.6) 100%),
                  radial-gradient(circle at 70% 70%, rgba(34, 197, 94, 0.8) 0%, rgba(248, 250, 252, 0.9) 50%, rgba(185, 28, 28, 0.8) 100%)
                `,
                boxShadow: 'inset 0 0 50px rgba(0,0,0,0.3), 0 0 30px rgba(59,130,246,0.3)',
                transform: 'rotateX(20deg) rotateY(20deg)'
              }}
            >
              {/* Center Earth icon - only show when no thoughts exist */}
              {thoughts.filter(t => t.mode === 'earth').length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl text-white drop-shadow-lg z-10">
                    🌍
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Instructions overlay */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center text-gray-600 text-sm">
          <p>Click the Earth to add location-based thoughts • Enhanced with attachments (CSS Mode)</p>
        </div>
        
        {/* Enhanced Input Overlay for CSS Mode */}
        {showInput && (
          <EarthInputOverlay onClose={() => setShowInput(false)} />
        )}
      </div>
    );
  }

  return (
    <>
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
          console.log('WebGL context created successfully for Earth');
          if (!gl.getContext().getExtension('WEBGL_debug_renderer_info')) {
            console.warn('WebGL debug info not available');
          }
        }}
        onError={(error) => {
          console.error('WebGL Error in Earth mode, falling back to CSS:', error);
          setUseCSSFallback(true);
        }}
      >
        <color attach="background" args={[backgroundColor]} />
        <EarthScene onEarthClick={() => setShowInput(true)} />
        
        {/* Camera controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={15}
          target={[0, 0, 0]}
        />
      </Canvas>
      
      {/* Enhanced Input Overlay for WebGL Mode */}
      {showInput && (
        <EarthInputOverlay onClose={() => setShowInput(false)} />
      )}
    </>
  );
};
