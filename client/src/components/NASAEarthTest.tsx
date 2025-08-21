import React, { useState, useEffect } from 'react';

interface NASAEarthTestProps {
  onClose?: () => void;
}

export const NASAEarthTest: React.FC<NASAEarthTestProps> = ({ onClose }) => {
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Auto-rotation effect
  useEffect(() => {
    if (!isAutoRotating) return;
    
    const interval = setInterval(() => {
      setRotationY(prev => prev + 0.5);
    }, 50);
    
    return () => clearInterval(interval);
  }, [isAutoRotating]);

  const handleEarthClick = () => {
    setIsAutoRotating(!isAutoRotating);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isAutoRotating) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    setRotationY(prev => prev + deltaX * 0.3);
    setRotationX(prev => Math.max(-45, Math.min(45, prev + deltaY * 0.2)));
  };

  const resetRotation = () => {
    setRotationX(0);
    setRotationY(0);
  };

  // Create curved segments for 3D effect
  const createCurvedSegments = () => {
    const segments = [];
    const numSegments = 12;
    
    for (let i = 0; i < numSegments; i++) {
      const angle = (i / numSegments) * 360;
      const nextAngle = ((i + 1) / numSegments) * 360;
      const radius = 192; // Half of w-96 (384px)
      const curve = 20; // Curvature amount
      
      segments.push(
        <div
          key={i}
          className="absolute bg-gradient-to-br from-blue-500 via-blue-400 to-blue-300"
          style={{
            width: `${(2 * Math.PI * radius) / numSegments}px`,
            height: `${radius}px`,
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${curve}px)`,
            transformOrigin: 'center center',
            borderRadius: '50% 50% 0 0',
            opacity: 0.9,
            transformStyle: 'preserve-3d'
          }}
        />
      );
    }
    
    return segments;
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-900 via-blue-800 to-black overflow-hidden">
      {/* 3D Earth Container */}
      <div className="absolute inset-0 flex items-center justify-center perspective-3000">
        <div 
          className="relative cursor-pointer transition-transform duration-300 ease-out"
          style={{
            transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
            transformStyle: 'preserve-3d'
          }}
          onClick={handleEarthClick}
          onMouseMove={handleMouseMove}
        >
          {/* 3D Earth using curved segments */}
          <div 
            className="w-96 h-96 relative"
            style={{
              transform: 'translateZ(0px)',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Curved segments that create 3D sphere effect */}
            {createCurvedSegments()}
            
            {/* Central sphere core */}
            <div 
              className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400"
              style={{
                transform: 'translateZ(0px)',
                boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)'
              }}
            >
              {/* Continents overlay */}
              <div className="absolute inset-0">
                {/* North America */}
                <div className="absolute top-1/4 left-1/4 w-20 h-16 bg-green-600 rounded-full opacity-80 transform -rotate-12"></div>
                {/* South America */}
                <div className="absolute bottom-1/4 left-1/4 w-16 h-24 bg-green-600 rounded-full opacity-80 transform rotate-12"></div>
                {/* Europe */}
                <div className="absolute top-1/3 right-1/3 w-18 h-12 bg-green-600 rounded-full opacity-80"></div>
                {/* Africa */}
                <div className="absolute top-1/2 right-1/3 w-18 h-20 bg-green-600 rounded-full opacity-80 transform rotate-6"></div>
                {/* Asia */}
                <div className="absolute top-1/4 right-1/6 w-24 h-18 bg-green-600 rounded-full opacity-80"></div>
                {/* Australia */}
                <div className="absolute bottom-1/4 right-1/6 w-20 h-16 bg-green-600 rounded-full opacity-80"></div>
                {/* Polar ice caps */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-10 bg-white rounded-full opacity-90"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-40 h-10 bg-white rounded-full opacity-90"></div>
              </div>
            </div>
            
            {/* Cloud layer with 3D depth */}
            <div className="absolute inset-0 opacity-50" style={{ transform: 'translateZ(25px) scale(1.08)' }}>
              <div className="absolute top-1/4 left-1/3 w-20 h-16 bg-white rounded-full blur-sm"></div>
              <div className="absolute top-1/2 right-1/4 w-16 h-12 bg-white rounded-full blur-sm"></div>
              <div className="absolute bottom-1/3 left-1/2 w-18 h-14 bg-white rounded-full blur-sm"></div>
              <div className="absolute top-1/3 left-1/6 w-14 h-10 bg-white rounded-full blur-sm"></div>
              <div className="absolute top-1/4 right-1/6 w-12 h-8 bg-white rounded-full blur-sm"></div>
            </div>
            
            {/* Atmosphere glow */}
            <div 
              className="absolute inset-0 rounded-full opacity-20"
              style={{
                background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)',
                transform: 'translateZ(-40px) scale(1.4)',
                filter: 'blur(50px)'
              }}
            ></div>
          </div>
          
          {/* Instructions */}
          <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-center text-white">
            <p className="text-lg font-semibold mb-2">3D Earth (Curved Segments)</p>
            <p className="text-sm text-gray-300">
              {isAutoRotating ? 'Click to stop auto-rotation • Drag to rotate manually' : 'Click to start auto-rotation • Drag to rotate manually'}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="absolute top-6 right-6 text-white bg-black bg-opacity-95 p-6 rounded-2xl backdrop-blur-xl border border-blue-500 border-opacity-30 shadow-2xl min-w-56">
          <div className="text-lg font-semibold text-blue-400 mb-5">🌍 Earth Controls</div>
          
          <div className="mb-5 pb-4 border-b border-white border-opacity-10">
            <h4 className="text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wider">3D Controls</h4>
            <div className="text-xs text-gray-300">
              <p>• Click Earth to toggle auto-rotation</p>
              <p>• Drag to rotate manually</p>
              <p>• Curved segments create 3D effect</p>
            </div>
          </div>
          
          <div className="mb-5 pb-4 border-b border-white border-opacity-10">
            <h4 className="text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wider">Auto-rotation</h4>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Status:</span>
              <span className={`text-xs px-2 py-1 rounded ${isAutoRotating ? 'bg-green-600' : 'bg-red-600'}`}>
                {isAutoRotating ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
          
          <button
            onClick={resetRotation}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
          >
            Reset Rotation
          </button>
        </div>
      )}

      {/* Info Panel */}
      {showInfo && (
        <div className="absolute bottom-6 left-6 text-white bg-black bg-opacity-95 p-5 rounded-2xl backdrop-blur-xl border border-blue-500 border-opacity-30 shadow-2xl max-w-80">
          <div className="text-lg font-semibold text-blue-400 mb-2 flex items-center gap-2">
            🌍 3D Earth (Curved Segments)
          </div>
          <div className="text-xs text-gray-400 mb-4 leading-relaxed">
            Built with curved segments for real 3D effect<br/>
            Each segment has depth and curvature<br/>
            CSS 3D transforms with preserve-3d
          </div>
          <div className="pt-3 border-t border-white border-opacity-10 text-xs leading-relaxed">
            <div className="mb-1">🖱️ <strong>Click:</strong> Toggle auto-rotation</div>
            <div className="mb-1">🖱️ <strong>Drag:</strong> Manual rotation</div>
            <div className="mb-1">⌨️ <strong>H:</strong> Toggle controls</div>
            <div>⌨️ <strong>I:</strong> Toggle info</div>
          </div>
        </div>
      )}

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 left-6 z-10 bg-black bg-opacity-80 text-white p-3 rounded-full hover:bg-opacity-100 transition-all duration-200"
        >
          ✕
        </button>
      )}

      {/* Control Toggle Buttons */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="absolute top-6 right-6 z-10 bg-black bg-opacity-80 text-white p-3 rounded-lg hover:bg-opacity-100 transition-all duration-200"
      >
        ⚙️
      </button>

      <button
        onClick={() => setShowInfo(!showInfo)}
        className="absolute bottom-6 right-6 z-10 bg-black bg-opacity-80 text-white p-3 rounded-lg hover:bg-opacity-100 transition-all duration-200"
      >
        ℹ️
      </button>
    </div>
  );
};
