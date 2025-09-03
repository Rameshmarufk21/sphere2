import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useThoughts } from '../lib/stores/useThoughts';
import { ThoughtSphere } from './ThoughtSphere';
import { ListView } from './ListView';
import Galaxy from './Galaxy';

// Mobile-optimized Galaxy wrapper
const MobileGalaxy: React.FC = () => {
  return (
    <div style={{ 
      height: '100%', 
      padding: '20px', 
      backgroundColor: '#ffffff',
      overflow: 'auto'
    }}>
      <Galaxy />
    </div>
  );
};

// Mobile-optimized ListView wrapper
const MobileListView: React.FC = () => {
  return (
    <div style={{ 
      height: '100%', 
      padding: '20px', 
      backgroundColor: '#ffffff',
      overflow: 'auto'
    }}>
      <ListView />
    </div>
  );
};


// Real 3D Sphere Component
const RevolvingSphere: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const shadowRef = useRef<THREE.Mesh>(null);

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

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 0, 5]} intensity={1.0} color="#ffffff" />
      <group>
        <mesh ref={shadowRef} position={[0.1, -0.1, -0.1]} renderOrder={0}>
          <sphereGeometry args={[2.2, 20, 20]} />
          <meshBasicMaterial transparent opacity={0.2} color="#64748b" wireframe={true} wireframeLinewidth={0.8} depthWrite={false} />
        </mesh>
        <mesh ref={meshRef} position={[0, 0, 0]} renderOrder={1}>
          <sphereGeometry args={[2.2, 32, 32]} />
          <meshBasicMaterial transparent opacity={0.6} color="#94a3b8" wireframe={true} wireframeLinewidth={1.0} depthWrite={false} />
        </mesh>
      </group>
    </>
  );
};

const MobileDev: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'shelf' | 'list'>('home');

  const { setInputMode, setViewMode } = useThoughts();

  const handleAddNew = () => {
    setInputMode(true);
  };



  const handleSphereClick = () => {
    // Handle sphere click if needed
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Code Editor Side */}
      <div style={{
        width: '50%',
        height: '100vh',
        background: '#1a1a1a',
        color: '#ffffff',
        padding: '20px',
        overflow: 'auto',
        borderRight: '2px solid #333'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#00ff88' }}>🚀 Mobile UI Development</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#ff6b6b', margin: '0 0 10px 0' }}>Current View: {currentView}</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setCurrentView('home')}
              style={{
                padding: '8px 16px',
                background: currentView === 'home' ? '#007AFF' : '#333',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentView('shelf')}
              style={{
                padding: '8px 16px',
                background: currentView === 'shelf' ? '#007AFF' : '#333',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Shelf
            </button>
            <button
              onClick={() => setCurrentView('list')}
              style={{
                padding: '8px 16px',
                background: currentView === 'list' ? '#007AFF' : '#333',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              List
            </button>
          </div>
        </div>

        <div style={{
          background: '#2a2a2a',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#ffd93d' }}>📝 Development Notes:</h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>YouTube-style bottom navigation</li>
            <li>Galaxy (Home) with "Soon" badge</li>
            <li>Shelf, List, + (Create), You</li>
            <li>Side-by-side live preview</li>
          </ul>
        </div>

        <div style={{
          background: '#2a2a2a',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#ffd93d' }}>🎯 Next Steps:</h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Create basic mobile layout</li>
            <li>Add slide-in navigation</li>
            <li>Style components</li>
            <li>Test on different devices</li>
          </ul>
        </div>

        <div style={{
          background: '#2a2a2a',
          padding: '15px',
          borderRadius: '8px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#ffd93d' }}>📱 Device Info:</h4>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>Preview: iPhone 12/13/14 (375×812)</p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>Network: http://192.168.1.159:5174/</p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>Status: 🟢 Live Development</p>
        </div>
      </div>

      {/* Mobile Preview Side */}
      <div style={{
        width: '50%',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        {/* Mobile Device Frame */}
        <div style={{
          width: '375px',
          height: '812px',
          background: '#000',
          borderRadius: '40px',
          padding: '8px',
          boxShadow: '0 0 0 2px #333, 0 20px 40px rgba(0,0,0,0.3)',
          position: 'relative'
        }}>
          {/* Device Screen */}
          <div style={{
            width: '100%',
            height: '100%',
            background: '#ffffff',
            borderRadius: '32px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Status Bar */}
            <div style={{
              height: '44px',
              background: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 20px',
              fontSize: '17px',
              fontWeight: '600',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <span>9:41</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{ width: '18px', height: '12px', background: '#000', borderRadius: '2px' }}></div>
                <div style={{ width: '18px', height: '12px', background: '#000', borderRadius: '2px' }}></div>
                <div style={{ width: '18px', height: '12px', background: '#000', borderRadius: '2px' }}></div>
              </div>
            </div>

            {/* Main Content */}
            <div style={{
              height: 'calc(100% - 44px - 84px)',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {currentView === 'home' && (
                <div 
                  style={{ flex: 1, height: '100%', position: 'relative', cursor: 'pointer' }}
                  onClick={() => setInputMode(true)}
                >
                  {/* THOUGHTS ? Text */}
                  <div style={{
                    position: 'absolute',
                    top: '60px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    textAlign: 'center'
                  }}>
                    <h1 style={{
                      fontSize: '28px',
                      fontWeight: '900',
                      color: 'transparent',
                      WebkitTextStroke: '2px #000000',
                      margin: '0',
                      letterSpacing: '2px',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      whiteSpace: 'nowrap'
                    }}>
                      THOUGHTS ?
                    </h1>
                  </div>
                  <ThoughtSphere onSphereClick={handleSphereClick} />
                </div>
              )}

              {currentView === 'shelf' && (
                <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Shelf Header */}
                  <div style={{
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 20px',
                    background: '#ffffff',
                    borderBottom: '1px solid #f0f0f0',
                    zIndex: 10
                  }}>
                    <h1 style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#000000',
                      margin: '0'
                    }}>
                      Shelf
                    </h1>
                    <button 
                      onClick={() => setCurrentView('home')}
                      style={{
                        width: '40px',
                        height: '40px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        color: '#000000'
                      }}
                    >
                      →
                    </button>
                  </div>
                  {/* Galaxy Content */}
                  <div style={{ flex: 1, height: 'calc(100% - 60px)', overflow: 'hidden' }}>
                    <MobileGalaxy />
                  </div>
                </div>
              )}

              {currentView === 'list' && (
                <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* List Header */}
                  <div style={{
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 20px',
                    background: '#ffffff',
                    borderBottom: '1px solid #f0f0f0',
                    zIndex: 10
                  }}>
                    <h1 style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#000000',
                      margin: '0'
                    }}>
                      List
                    </h1>
                    <button 
                      onClick={() => setCurrentView('home')}
                      style={{
                        width: '40px',
                        height: '40px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        color: '#000000'
                      }}
                    >
                      →
                    </button>
                  </div>
                  {/* List Content */}
                  <div style={{ flex: 1, height: 'calc(100% - 60px)', overflow: 'hidden' }}>
                    <MobileListView />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Navigation - YouTube Style */}
            <div style={{
              height: '84px',
              background: '#ffffff',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-around',
              padding: '8px 0 0 0',
              position: 'relative',
              zIndex: 1000
            }}>
              {/* Galaxy (Home) */}
              <button
                onClick={() => setCurrentView('home')}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  color: currentView === 'home' ? '#000000' : '#666666',
                  fontWeight: currentView === 'home' ? '600' : '400',
                  position: 'relative',
                  minHeight: '60px'
                }}
              >
                {/* Galaxy Icon */}
                <div style={{
                  width: '24px',
                  height: '24px',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <span style={{ fontSize: '10px', fontWeight: '400', lineHeight: '1.2' }}>Galaxy</span>
                <div style={{
                  position: 'absolute',
                  top: '0px',
                  right: '4px',
                  color: '#ff0000',
                  fontSize: '8px',
                  fontWeight: '600'
                }}>
                  Soon
                </div>
              </button>

              {/* Shelf */}
              <button
                onClick={() => setCurrentView('shelf')}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  color: currentView === 'shelf' ? '#000000' : '#666666',
                  fontWeight: currentView === 'shelf' ? '600' : '400',
                  minHeight: '60px'
                }}
              >
                {/* Shelf Icon - Target-like (three concentric circles) */}
                <div style={{
                  width: '24px',
                  height: '24px',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="6"/>
                    <circle cx="12" cy="12" r="2"/>
                  </svg>
                </div>
                <span style={{ fontSize: '10px', fontWeight: '400', lineHeight: '1.2' }}>Shelf</span>
              </button>
              
              {/* Create Button (+ in circle) */}
              <button 
                onClick={handleAddNew}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: currentView === 'home' ? '#000000' : '#f0f0f0',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: currentView === 'home' ? '#ffffff' : '#000000',
                  fontSize: '18px',
                  fontWeight: '300',
                  marginTop: '2px',
                  transition: 'all 0.3s ease'
                }}
              >
                +
              </button>
              
              {/* List */}
              <button
                onClick={() => setCurrentView('list')}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  color: currentView === 'list' ? '#000000' : '#666666',
                  fontWeight: currentView === 'list' ? '600' : '400',
                  minHeight: '60px'
                }}
              >
                {/* List Icon - Hamburger menu (three horizontal lines) */}
                <div style={{
                  width: '24px',
                  height: '24px',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                </div>
                <span style={{ fontSize: '10px', fontWeight: '400', lineHeight: '1.2' }}>List</span>
              </button>

              {/* Profile/You placeholder */}
              <button
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  color: '#666666',
                  fontWeight: '400',
                  minHeight: '60px'
                }}
              >
                {/* Profile Icon */}
                <div style={{
                  width: '24px',
                  height: '24px',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#4CAF50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    U
                  </div>
                </div>
                <span style={{ fontSize: '10px', fontWeight: '400', lineHeight: '1.2' }}>You</span>
              </button>
            </div>

            {/* Home Indicator */}
            <div style={{
              position: 'absolute',
              bottom: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '134px',
              height: '5px',
              background: '#000',
              borderRadius: '3px'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDev;
