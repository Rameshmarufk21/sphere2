import React, { useState, useEffect, useRef } from 'react';
import { useThoughts } from '@/lib/stores/useThoughts';

interface MenuProps {
  currentView: 'sphere' | 'list' | 'galaxy' | 'test-x' | 'test-2' | 'mobile-dev';
  onViewChange: (view: 'sphere' | 'list' | 'galaxy' | 'test-x' | 'test-2' | 'mobile-dev') => void;
}

const isDaytime = () => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18;
};

export const Menu: React.FC<MenuProps> = ({ currentView, onViewChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDay] = useState(isDaytime());
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const menuColor = isDay ? '#1f2937' : '#f1f5f9';
  const bgColor = isDay ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)';
  const hoverColor = isDay ? 'rgba(243, 244, 246, 0.8)' : 'rgba(255, 255, 255, 0.1)';
  const borderColor = isDay ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)';

  return (
    <div className="fixed top-4 left-4 z-50" ref={menuRef}>
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 rounded-xl transition-all duration-300 hover:scale-105"
        style={{
          background: bgColor,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${borderColor}`,
          boxShadow: isDay ? '0 4px 20px rgba(0,0,0,0.1)' : '0 4px 20px rgba(0,0,0,0.3)',
          fontFamily: 'Inter, system-ui, sans-serif'
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
          className="absolute top-16 left-0 min-w-52 rounded-xl overflow-hidden"
          style={{
            background: bgColor,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${borderColor}`,
            boxShadow: isDay ? '0 8px 32px rgba(0,0,0,0.12)' : '0 8px 32px rgba(0,0,0,0.4)',
            fontFamily: 'Inter, system-ui, sans-serif'
          }}
        >
          {/* New Thought Button */}
          <button
            onClick={() => {
              useThoughts.getState().createFreshSphere();
              onViewChange('sphere');
            }}
            className="w-full px-5 py-3.5 text-left transition-all duration-200 flex items-center font-medium"
            style={{
              color: menuColor,
              backgroundColor: currentView === 'sphere' ? hoverColor : 'transparent',
              fontSize: '0.95rem'
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Thought
          </button>
          
          <button
            onClick={() => {
              onViewChange('galaxy');
              setIsOpen(false);
            }}
            className="w-full px-5 py-3.5 text-left transition-all duration-200 flex items-center font-medium"
            style={{
              color: menuColor,
              backgroundColor: currentView === 'galaxy' ? hoverColor : 'transparent',
              fontSize: '0.95rem'
            }}
            onMouseEnter={(e) => {
              if (currentView !== 'galaxy') {
                e.currentTarget.style.backgroundColor = hoverColor;
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== 'galaxy') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth={2} />
              <circle cx="12" cy="12" r="6" strokeWidth={1} />
              <circle cx="12" cy="12" r="2" strokeWidth={1} />
            </svg>
            Galaxy
          </button>
          

          
          <button
            onClick={() => {
              onViewChange('list');
              setIsOpen(false);
            }}
            className="w-full px-5 py-3.5 text-left transition-all duration-200 flex items-center font-medium"
            style={{
              color: menuColor,
              backgroundColor: currentView === 'list' ? hoverColor : 'transparent',
              fontSize: '0.95rem'
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
            onClick={() => {
              onViewChange('test-x');
              setIsOpen(false);
            }}
            className="w-full px-5 py-3.5 text-left transition-all duration-200 flex items-center font-medium"
            style={{
              color: menuColor,
              backgroundColor: currentView === 'test-x' ? hoverColor : 'transparent',
              fontSize: '0.95rem'
            }}
            onMouseEnter={(e) => {
              if (currentView !== 'test-x') {
                e.currentTarget.style.backgroundColor = hoverColor;
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== 'test-x') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            🧪 Test X
          </button>

          <button
            onClick={() => {
              onViewChange('test-2');
              setIsOpen(false);
            }}
            className="w-full px-5 py-3.5 text-left transition-all duration-200 flex items-center font-medium"
            style={{
              color: menuColor,
              backgroundColor: currentView === 'test-2' ? hoverColor : 'transparent',
              fontSize: '0.95rem'
            }}
            onMouseEnter={(e) => {
              if (currentView !== 'test-2') {
                e.currentTarget.style.backgroundColor = hoverColor;
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== 'test-2') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            🧪 Test 2
          </button>

          <button
            onClick={() => {
              onViewChange('mobile-dev');
              setIsOpen(false);
            }}
            className="w-full px-5 py-3.5 text-left transition-all duration-200 flex items-center font-medium"
            style={{
              color: menuColor,
              backgroundColor: currentView === 'mobile-dev' ? hoverColor : 'transparent',
              fontSize: '0.95rem'
            }}
            onMouseEnter={(e) => {
              if (currentView !== 'mobile-dev') {
                e.currentTarget.style.backgroundColor = hoverColor;
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== 'mobile-dev') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            📱 Mobile Dev
          </button>

        </div>
      )}
    </div>
  );
};