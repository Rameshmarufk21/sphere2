import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, OrbitControls, useTexture, Stars, Cloud } from '@react-three/drei';
import * as THREE from 'three';
import { useThoughts, Thought } from '@/lib/stores/useThoughts';

const isDaytime = () => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18;
};

// Realistic Earth Globe Component
const EarthGlobe: React.FC<{ onClick: (event: any) => void }> = ({ onClick }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const [isDay, setIsDay] = useState(isDaytime());
  
  // Create beautiful stylized Earth texture like the reference image
  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    
    // Dark blue starry background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 2048, 1024);
    
    // Add stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 2048;
      const y = Math.random() * 1024;
      const size = 1 + Math.random() * 2;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Create the stylized planet circle
    const centerX = 1024;
    const centerY = 512;
    const radius = 400;
    
    // Base ocean layer with faceted, overlapping shapes
    ctx.fillStyle = 'rgba(59, 130, 246, 0.8)'; // Medium blue
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Add overlapping faceted ocean shapes for depth
    ctx.fillStyle = 'rgba(30, 58, 138, 0.7)'; // Darker blue
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * (radius * 0.3);
      const y = centerY + Math.sin(angle) * (radius * 0.3);
      const size = radius * (0.4 + Math.random() * 0.3);
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Add lighter blue overlapping shapes
    ctx.fillStyle = 'rgba(96, 165, 250, 0.6)'; // Lighter blue
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * (radius * 0.2);
      const y = centerY + Math.sin(angle) * (radius * 0.2);
      const size = radius * (0.5 + Math.random() * 0.2);
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Large white/light grey landmass (upper-left)
    ctx.fillStyle = 'rgba(248, 250, 252, 0.9)';
    ctx.beginPath();
    ctx.ellipse(centerX - 150, centerY - 100, 180, 120, -0.3, 0, 2 * Math.PI);
    ctx.fill();
    
    // Large green landmass (lower-center)
    ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
    ctx.beginPath();
    ctx.ellipse(centerX + 50, centerY + 150, 160, 140, 0.2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Green landmass (upper-right)
    ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
    ctx.beginPath();
    ctx.ellipse(centerX + 200, centerY - 80, 140, 100, 0.1, 0, 2 * Math.PI);
    ctx.fill();
    
    // Green landmass (mid-left)
    ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
    ctx.beginPath();
    ctx.ellipse(centerX - 200, centerY + 50, 120, 90, -0.2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Brown/dark red landmass (bottom-right)
    ctx.fillStyle = 'rgba(185, 28, 28, 0.8)';
    ctx.beginPath();
    ctx.ellipse(centerX + 180, centerY + 180, 100, 60, 0.4, 0, 2 * Math.PI);
    ctx.fill();
    
    // Small green dot (top-center)
    ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
    ctx.beginPath();
    ctx.arc(centerX, centerY - 200, 25, 0, 2 * Math.PI);
    ctx.fill();
    
    // Add subtle faceted highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * (radius * 0.6);
      const y = centerY + Math.sin(angle) * (radius * 0.6);
      const size = radius * 0.2;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Create Google Earth-like cloud texture
  const cloudTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Create multiple cloud layers for depth
    // High-altitude cirrus clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const size = 30 + Math.random() * 80;
      const opacity = 0.1 + Math.random() * 0.2;
      
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Mid-altitude cumulus clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.globalAlpha = 1;
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const size = 40 + Math.random() * 100;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Low-altitude stratus clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const size = 60 + Math.random() * 120;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
    return new THREE.CanvasTexture(canvas);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsDay(isDaytime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001; // Slow Earth rotation
    }
  });

  return (
    <group>
      {/* Stars background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Earth sphere */}
    <mesh ref={earthRef} onClick={onClick} position={[0, 0, 0]}>
      <sphereGeometry args={[2.3, 64, 32]} />
      <meshPhongMaterial 
        map={earthTexture}
          shininess={20}
          transparent
          opacity={0.95}
        />
      </mesh>
      
      {/* Cloud layer */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[2.35, 64, 32]} />
        <meshBasicMaterial 
          map={cloudTexture}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Atmospheric glow */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[2.5, 32, 16]} />
        <meshBasicMaterial 
          color={isDay ? '#87ceeb' : '#1e3a8a'}
        transparent
          opacity={0.1}
          side={THREE.BackSide}
      />
    </mesh>
    </group>
  );
};

// Enhanced Earth Thought Text Component
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

// Enhanced Input Component for Earth Mode
const EarthInputOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [attachments, setAttachments] = useState<{images: string[], links: string[], files: string[]}>({
    images: [],
    links: [],
    files: []
  });
  const [linkInput, setLinkInput] = useState('');
  const { addThought, userLocation } = useThoughts();
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const hasAttachments = attachments.images.length || attachments.links.length || attachments.files.length;
      addThought(
        inputValue, 
        'earth',
        hasAttachments ? attachments : undefined, 
        true // Always use geolocation in Earth mode
      );
      setInputValue('');
      setAttachments({images: [], links: [], files: []});
      setShowAttachmentMenu(false);
      onClose();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles = files.map(file => URL.createObjectURL(file));
    setAttachments(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const newImages = imageFiles.map(file => URL.createObjectURL(file));
    setAttachments(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const handleAddLink = () => {
    if (linkInput.trim()) {
      setAttachments(prev => ({
        ...prev,
        links: [...prev.links, linkInput.trim()]
      }));
      setLinkInput('');
    }
  };

  const removeAttachment = (type: 'images' | 'links' | 'files', index: number) => {
    setAttachments(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add Location Thought</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="What's happening at this location?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Attachment Menu Toggle */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-800"
            >
              <span className="mr-2">📎</span>
              Add Attachments
            </button>
          </div>
          
          {/* Attachment Menu */}
          {showAttachmentMenu && (
            <div className="mb-4 space-y-3">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Files
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              
              {/* Link Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Links
                </label>
                <div className="flex">
                  <input
                    type="url"
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Show Current Attachments */}
          {(attachments.images.length > 0 || attachments.links.length > 0 || attachments.files.length > 0) && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments:</h4>
              <div className="space-y-2">
                {attachments.images.map((img, index) => (
                  <div key={`img-${index}`} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-600">🖼️ Image {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment('images', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {attachments.links.map((link, index) => (
                  <div key={`link-${index}`} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-600">🔗 {link}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment('links', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {attachments.files.map((file, index) => (
                  <div key={`file-${index}`} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-600">📄 File {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment('files', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Location Info */}
          {userLocation && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                📍 Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
              </p>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Thought
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Earth Scene Component
const EarthScene: React.FC<{ onSphereClick: (event: any) => void }> = ({ onSphereClick }) => {
  const { thoughts, currentParentId, navigateBack } = useThoughts();
  const [isDay, setIsDay] = useState(isDaytime());
  const [showInput, setShowInput] = useState(false);
  
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
      
      {/* Earth Globe */}
      <EarthGlobe onClick={() => setShowInput(true)} />
      
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
      
      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={15}
        target={[0, 0, 0]}
      />
      
    </>
  );
};

// CSS-based Earth Component (Fallback)
const CSSEarth: React.FC<{ onClick: (event: any) => void }> = ({ onClick }) => {
  const [isDay, setIsDay] = useState(isDaytime());
  const { thoughts, currentParentId } = useThoughts();
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsDay(isDaytime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Filter thoughts for Earth mode only
  const currentThoughts = currentParentId 
    ? thoughts.filter(t => t.parentId === currentParentId && t.mode === 'earth')
    : thoughts.filter(t => !t.parentId && t.mode === 'earth');

  // Get center thought if we're in a nested view
  const centerThought = currentParentId 
    ? thoughts.find(t => t.id === currentParentId)
    : null;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* CSS 3D Earth Globe */}
      <div 
        className="relative w-80 h-80 cursor-pointer transform-gpu transition-transform duration-1000 hover:scale-110"
        onClick={onClick}
        style={{
          transformStyle: 'preserve-3d',
          animation: 'earth-rotate 30s linear infinite'
        }}
      >
        {/* Earth sphere with realistic appearance */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, #1e40af 0%, #1e3a8a 50%, #1e293b 100%),
              radial-gradient(circle at 70% 70%, #059669 0%, #047857 50%, #065f46 100%)
            `,
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.3), 0 0 30px rgba(59,130,246,0.3)',
            transform: 'rotateX(20deg) rotateY(20deg)'
          }}
        >
          {/* Continents using CSS */}
          <div className="absolute inset-0">
            {/* Africa */}
            <div className="absolute w-16 h-24 bg-green-600 rounded-full opacity-80" style={{ top: '30%', left: '25%' }}></div>
            {/* South America */}
            <div className="absolute w-12 h-28 bg-green-600 rounded-full opacity-80" style={{ top: '50%', left: '65%' }}></div>
            {/* North America */}
            <div className="absolute w-20 h-16 bg-green-600 rounded-full opacity-80" style={{ top: '20%', left: '15%' }}></div>
            {/* Europe */}
            <div className="absolute w-14 h-10 bg-green-600 rounded-full opacity-80" style={{ top: '25%', left: '40%' }}></div>
            {/* Asia */}
            <div className="absolute w-24 h-20 bg-green-600 rounded-full opacity-80" style={{ top: '25%', left: '70%' }}></div>
            {/* Australia */}
            <div className="absolute w-12 h-8 bg-green-600 rounded-full opacity-80" style={{ top: '70%', left: '80%' }}></div>
          </div>

          {/* Center Earth icon - only show when no thoughts exist */}
          {currentThoughts.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl text-white drop-shadow-lg z-10">
                🌍
              </div>
            </div>
          )}

          {/* Center thought in nested view */}
          {centerThought && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl font-bold text-white mb-2">
                  {centerThought.text}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Render thoughts around the Earth using CSS positioning */}
      {currentThoughts.map((thought, index) => {
        // Calculate position around the Earth with better spacing
        const angle = (index / currentThoughts.length) * 2 * Math.PI;
        const radius = 200; // Increased distance from center to avoid overlap
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        // Calculate font size based on thought count
        const baseSize = 14;
        const minSize = 10;
        const maxSize = 20;
        const fontSize = Math.max(minSize, Math.min(maxSize, baseSize - (currentThoughts.length * 0.4)));

        return (
          <div
            key={thought.id}
            className="absolute cursor-pointer hover:scale-110 transition-transform duration-200"
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
              fontSize: `${fontSize}px`,
              color: '#f1f5f9',
              textShadow: '0 0 6px rgba(0,0,0,0.9)',
              zIndex: 30,
              maxWidth: '120px',
              textAlign: 'center',
              wordBreak: 'break-word',
              fontWeight: '500',
              backgroundColor: 'rgba(0,0,0,0.2)',
              padding: '4px 8px',
              borderRadius: '4px',
              backdropFilter: 'blur(2px)'
            }}
            onClick={(e) => {
              e.stopPropagation();
              console.log('Earth thought clicked:', thought.text);
            }}
          >
            {thought.text}
            {/* Show attachment indicator */}
            {thought.attachments && (
              <div className="text-xs text-yellow-400 mt-1">📎</div>
            )}
          </div>
        );
      })}

      {/* Back button for nested navigation */}
      {currentParentId && (
        <div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer text-red-400 hover:text-red-300 transition-colors"
          onClick={() => {
            console.log('Back to main Earth');
          }}
        >
          ← Back to Main Earth
        </div>
      )}
    </div>
  );
};

// Main EarthSphere component with CSS fallback
export const EarthSphere: React.FC<{ onSphereClick: (event: any) => void; forceCSSMode?: boolean }> = ({ onSphereClick, forceCSSMode = false }) => {
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

  // Use CSS fallback if WebGL fails or if forced
  if (useCSSFallback || forceCSSMode) {
    console.log('Using CSS fallback mode for Earth. Earth thoughts count:', thoughts.filter(t => t.mode === 'earth').length);
    return (
      <div className="w-full h-full" style={{ background: backgroundColor }}>
        <CSSEarth onClick={() => setShowInput(true)} />
        
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
        <EarthScene onSphereClick={() => setShowInput(true)} />
        
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