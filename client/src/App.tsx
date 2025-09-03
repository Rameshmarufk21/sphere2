import React, { useState, useCallback, useEffect } from 'react';
import { ThoughtSphere } from '@/components/ThoughtSphere';
import { InputOverlay } from '@/components/InputOverlay';
import { Menu } from '@/components/Menu';
import { ListView } from '@/components/ListView';
import Galaxy from '@/components/Galaxy';
import TestX from '@/components/TestX';
import Test2 from '@/components/Test2';
import MobileDev from '@/components/MobileDev';

import { useThoughts } from '@/lib/stores/useThoughts';
import '@fontsource/inter';


// Helper function to determine if it's day or night
const isDaytime = () => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18; // Day from 6 AM to 6 PM
};

function App() {
  const { setInputMode, isInputMode, viewMode, setViewMode } = useThoughts();
  const [isDay, setIsDay] = useState(isDaytime());
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

  // Handle new thought creation
  const handleNewThought = useCallback(() => {
    setInputMode(true);
  }, [setInputMode]);

  const backgroundColor = isDay ? "#f8fafc" : "#0f172a"; // Light grey for day, darker slate for night
  const textColor = isDay ? "#1f2937" : "#f1f5f9"; // Better contrast colors

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
        <div style={{ 
          textAlign: 'center', 
          color: textColor,
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <div style={{ fontSize: '5rem', marginBottom: '2rem', opacity: 0.8 }}>🌐</div>
          <h1 style={{ 
            fontSize: '3rem', 
            marginBottom: '1.5rem',
            fontWeight: '700',
            letterSpacing: '-0.02em'
          }}>MindSphere</h1>
          <p style={{ 
            marginBottom: '1.5rem',
            fontSize: '1.125rem',
            opacity: 0.8,
            fontWeight: '500'
          }}>WebGL 3D rendering is not supported in your browser.</p>
          <p style={{
            fontSize: '1rem',
            opacity: 0.7
          }}>Please try using a modern browser with WebGL support.</p>
        </div>
      </div>
    );
  }

  console.log('App rendering with:', {
    webglSupported,
    viewMode,
    isInputMode
  });

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative', 
      overflow: 'hidden',
      background: backgroundColor,
      cursor: isInputMode ? 'default' : (viewMode === 'sphere' ? 'grab' : 'default'),
      transition: 'background-color 0.5s ease',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Menu */}
      <Menu 
        currentView={viewMode} 
        onViewChange={setViewMode}
      />
      
      {/* Main Content */}
      {viewMode === 'mobile-dev' ? (
        <MobileDev />
      ) : viewMode === 'sphere' ? (
        <ThoughtSphere onSphereClick={handleSphereClick} />
      ) : viewMode === 'galaxy' ? (
        <Galaxy />
      ) : viewMode === 'test-x' ? (
        <TestX />
      ) : viewMode === 'test-2' ? (
        <Test2 />
      ) : (
        <ListView />
      )}
      
      {/* Input Overlay */}
      <InputOverlay 
        isVisible={isInputMode}
        onClose={handleCloseInput}
        currentView={viewMode}
      />
    </div>
  );
}

export default App;
