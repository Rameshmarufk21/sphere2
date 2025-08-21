import React, { useState } from 'react';
import { useThoughts } from '@/lib/stores/useThoughts';

interface MenuProps {
  currentView: 'sphere' | 'list' | 'earth' | 'earthTest';
  onViewChange: (view: 'sphere' | 'list' | 'earth' | 'earthTest') => void;
  forceCSSMode?: boolean;
  onToggleCSSMode?: () => void;
}

const isDaytime = () => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18;
};

export const Menu: React.FC<MenuProps> = ({ currentView, onViewChange, forceCSSMode, onToggleCSSMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDay] = useState(isDaytime());
  const { setViewMode, setUserLocation } = useThoughts();

  const menuColor = isDay ? '#374151' : '#e5e7eb';
  const bgColor = isDay ? 'rgba(248, 250, 252, 0.3)' : 'rgba(30, 41, 59, 0.3)'; // Much more transparent
  const hoverColor = isDay ? 'rgba(243, 244, 246, 0.5)' : 'rgba(71, 85, 105, 0.5)';

  return (
    <div className="fixed top-4 left-4 z-50">
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 rounded-lg transition-all duration-200 hover:scale-105"
        style={{
          background: bgColor,
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          border: `1px solid ${isDay ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`,
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}
      >
        <div className="flex flex-col justify-center items-center w-5 h-5">
          <div
            className={`w-5 h-0.5 transition-all duration-300 ${
              isOpen ? 'rotate-45 translate-y-1.5' : 'mb-1'
            }`}
            style={{ backgroundColor: menuColor }}
          />
          <div
            className={`w-5 h-0.5 transition-all duration-300 ${
              isOpen ? 'opacity-0' : 'mb-1'
            }`}
            style={{ backgroundColor: menuColor }}
          />
          <div
            className={`w-5 h-0.5 transition-all duration-300 ${
              isOpen ? '-rotate-45 -translate-y-1.5' : ''
            }`}
            style={{ backgroundColor: menuColor }}
          />
        </div>
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <div
          className="absolute top-16 left-0 min-w-48 rounded-lg overflow-hidden"
          style={{
            background: isDay ? 'rgba(248, 250, 252, 0.85)' : 'rgba(30, 41, 59, 0.85)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            border: `1px solid ${isDay ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`,
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          }}
        >
          <button
            onClick={() => {
              onViewChange('sphere');
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 text-left transition-colors duration-200 flex items-center"
            style={{
              color: menuColor,
              backgroundColor: currentView === 'sphere' ? hoverColor : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (currentView !== 'sphere') {
                e.currentTarget.style.backgroundColor = hoverColor;
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== 'sphere') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth={2} />
              <circle cx="12" cy="12" r="6" strokeWidth={1} />
              <circle cx="12" cy="12" r="2" strokeWidth={1} />
            </svg>
            Sphere View
          </button>
          
          <button
            onClick={() => {
              onViewChange('list');
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 text-left transition-colors duration-200 flex items-center"
            style={{
              color: menuColor,
              backgroundColor: currentView === 'list' ? hoverColor : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (currentView !== 'list') {
                e.currentTarget.style.backgroundColor = hoverColor;
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== 'list') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            List View
          </button>

          <button
            onClick={async () => {
              // Request location permission for Earth mode
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    setUserLocation({
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude
                    });
                    setViewMode('earth');
                    onViewChange('earth');
                    setIsOpen(false);
                  },
                  (error) => {
                    console.warn('Geolocation permission denied, using default location');
                    // Use a default location (New York) if permission denied
                    setUserLocation({
                      latitude: 40.7128,
                      longitude: -74.0060
                    });
                    setViewMode('earth');
                    onViewChange('earth');
                    setIsOpen(false);
                  }
                );
              } else {
                // Fallback for browsers without geolocation
                setUserLocation({
                  latitude: 40.7128,
                  longitude: -74.0060
                });
                setViewMode('earth');
                onViewChange('earth');
                setIsOpen(false);
              }
            }}
            className="w-full px-4 py-3 text-left transition-colors duration-200 flex items-center"
            style={{
              color: menuColor,
              backgroundColor: currentView === 'earth' ? hoverColor : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (currentView !== 'earth') {
                e.currentTarget.style.backgroundColor = hoverColor;
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== 'earth') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth={2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            Earth Mode
          </button>

          <button
            onClick={() => {
              onViewChange('earthTest');
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 text-left transition-colors duration-200 flex items-center"
            style={{
              color: menuColor,
              backgroundColor: currentView === 'earthTest' ? hoverColor : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (currentView !== 'earthTest') {
                e.currentTarget.style.backgroundColor = hoverColor;
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== 'earthTest') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth={2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 12h16M12 4v16" />
            </svg>
            NASA Earth Test
          </button>
          
          {/* CSS Mode Toggle */}
          {onToggleCSSMode && (
            <button
              onClick={() => {
                onToggleCSSMode();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left transition-colors duration-200 flex items-center border-t border-gray-200"
              style={{
                color: menuColor,
                backgroundColor: forceCSSMode ? hoverColor : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!forceCSSMode) {
                  e.currentTarget.style.backgroundColor = hoverColor;
                }
              }}
              onMouseLeave={(e) => {
                if (!forceCSSMode) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
              {forceCSSMode ? 'CSS Mode (ON)' : 'CSS Mode (OFF)'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};