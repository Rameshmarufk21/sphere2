import React, { useState, useCallback, useEffect } from 'react';
import { ThoughtSphere } from '@/components/ThoughtSphere';
import { InputOverlay } from '@/components/InputOverlay';
import { Menu } from '@/components/Menu';
import { ListView } from '@/components/ListView';
import { useThoughts } from '@/lib/stores/useThoughts';
import '@fontsource/inter';

// Helper function to determine if it's day or night
const isDaytime = () => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18; // Day from 6 AM to 6 PM
};

function App() {
  const { setInputMode, isInputMode } = useThoughts();
  const [isDay, setIsDay] = useState(isDaytime());
  const [currentView, setCurrentView] = useState<'sphere' | 'list'>('sphere');
  const [webglSupported, setWebglSupported] = useState(true);
  
  // Check time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setIsDay(isDaytime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Check WebGL support on mount
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        console.warn('WebGL not supported');
      }
    } catch (error) {
      setWebglSupported(false);
      console.error('WebGL check failed:', error);
    }
  }, []);
  
  // Handle sphere click to enter input mode
  const handleSphereClick = useCallback((event: any) => {
    event.stopPropagation();
    console.log('Sphere clicked, setting input mode to true');
    setInputMode(true);
  }, [setInputMode]);

  // Handle closing input overlay
  const handleCloseInput = useCallback(() => {
    setInputMode(false);
  }, [setInputMode]);

  const backgroundColor = isDay ? "#f8fafc" : "#1e293b"; // Light grey for day, dark for night
  const textColor = isDay ? "#666" : "#94a3b8"; // Dark text for day, light for night

  // Show fallback if WebGL is not supported
  if (!webglSupported) {
    console.log('WebGL not supported, showing fallback UI');
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        position: 'relative', 
        overflow: 'hidden',
        background: backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: textColor }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌐</div>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>MindSphere</h1>
          <p style={{ marginBottom: '2rem' }}>WebGL 3D rendering is not supported in your browser.</p>
          <p>Please try using a modern browser with WebGL support.</p>
        </div>
      </div>
    );
  }

  console.log('App rendering with:', {
    webglSupported,
    currentView,
    isInputMode
  });

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative', 
      overflow: 'hidden',
      background: backgroundColor,
      cursor: isInputMode ? 'default' : (currentView === 'sphere' ? 'grab' : 'default'),
      transition: 'background-color 0.5s ease'
    }}>
      {/* Menu */}
      <Menu 
        currentView={currentView as any} 
        onViewChange={(v:any)=>setCurrentView(v)} 
      />
      
      {/* Main Content */}
      {currentView === 'sphere' ? (
        <ThoughtSphere onSphereClick={handleSphereClick} />
      ) : (
        <ListView />
      )}
      
      {/* Input Overlay */}
      <InputOverlay 
        isVisible={isInputMode}
        onClose={handleCloseInput}
        currentView={currentView as any}
      />
    </div>
  );
}

export default App;
