import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import * as THREE from "three";

export interface Thought {
  id: string;
  text: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  createdAt: Date;
  parentId?: string;
  mode: 'sphere' | 'earth'; // Add mode to separate sphere and earth thoughts
  attachments?: {
    images?: string[];
    links?: string[];
    files?: string[];
  };
  geolocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

interface ThoughtsState {
  thoughts: Thought[];
  isInputMode: boolean;
  sphereCenter: THREE.Vector3;
  targetRotation: { x: number; y: number } | null;
  currentParentId: string | null;
  viewMode: 'sphere' | 'list' | 'earth';
  isEarthMode: boolean;
  userLocation: { latitude: number; longitude: number } | null;
  
  // Actions
      addThought: (text: string, mode: 'sphere' | 'earth', attachments?: any, useGeolocation?: boolean) => void;
  removeThought: (id: string) => void;
  updateThought: (id: string, text: string) => void;
  setInputMode: (mode: boolean) => void;
  setSphereCenter: (center: THREE.Vector3) => void;
  focusOnThought: (thoughtPosition: THREE.Vector3) => void;
  clearTargetRotation: () => void;
  navigateToThought: (thoughtId: string) => void;
  navigateBack: () => void;
  setViewMode: (mode: 'sphere' | 'list' | 'earth') => void;
  setUserLocation: (location: { latitude: number; longitude: number }) => void;
  generateThoughtPosition: (useGeolocation?: boolean) => { position: THREE.Vector3; rotation: THREE.Euler };
}

// Enhanced spherical distribution similar to word cloud reference
const generateRandomSpherePosition = (radius: number = 2.3, existingPositions: THREE.Vector3[] = []) => {
  let bestPosition: THREE.Vector3 | null = null;
  let bestDistance = 0;
  let attempts = 0;
  const maxAttempts = 50;
  
  // Try multiple positions and pick the one with best spacing
  while (attempts < maxAttempts) {
    // Generate uniform distribution on sphere surface
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.acos(2 * Math.random() - 1);
    
    // Slight radius variation for organic look
    const actualRadius = radius + (Math.random() - 0.5) * 0.4;
    
    const x = actualRadius * Math.sin(theta) * Math.cos(phi);
    const y = actualRadius * Math.sin(theta) * Math.sin(phi);
    const z = actualRadius * Math.cos(theta);
    
    const candidatePosition = new THREE.Vector3(x, y, z);
    
    // Calculate minimum distance to existing positions
    let minDistance = Infinity;
    for (const existingPos of existingPositions) {
      const distance = candidatePosition.distanceTo(existingPos);
      if (distance < minDistance) {
        minDistance = distance;
      }
    }
    
    // Keep the position with best separation
    if (minDistance > bestDistance) {
      bestDistance = minDistance;
      bestPosition = candidatePosition.clone();
    }
    
    attempts++;
    
    // Good enough spacing found
    if (minDistance > 1.5) break;
  }
  
  const position = bestPosition || new THREE.Vector3(radius, 0, 0);
  
  // Calculate rotation to face outward
  const rotation = new THREE.Euler();
  rotation.setFromVector3(position.clone().normalize());
  
  return { position, rotation };
};

export const useThoughts = create<ThoughtsState>()(
  subscribeWithSelector((set, get) => ({
    thoughts: [],
    isInputMode: false,
    sphereCenter: new THREE.Vector3(0, 0, 0),
    targetRotation: null,
    currentParentId: null,
    viewMode: 'sphere',
    isEarthMode: false,
    userLocation: null,
    
    addThought: (text: string, mode: 'sphere' | 'earth', attachments?: any, useGeolocation?: boolean) => {
      const state = get();
      const { position, rotation } = state.generateThoughtPosition(useGeolocation, mode);
      const newThought: Thought = {
        id: Math.random().toString(36).substr(2, 9),
        text: text.trim(),
        position,
        rotation,
        createdAt: new Date(),
        parentId: state.currentParentId || undefined,
        mode,
        attachments,
      };

      // Add geolocation if in Earth mode and location available
      if (useGeolocation && state.userLocation && mode === 'earth') {
        newThought.geolocation = state.userLocation;
      }
      
      set((prevState) => ({
        thoughts: [...prevState.thoughts, newThought],
        isInputMode: false
      }));
    },
    
    removeThought: (id: string) => {
      set((state) => ({
        thoughts: state.thoughts.filter(thought => thought.id !== id)
      }));
    },
    
    updateThought: (id: string, text: string) => {
      set((state) => ({
        thoughts: state.thoughts.map(thought =>
          thought.id === id ? { ...thought, text: text.trim() } : thought
        )
      }));
    },
    
    setInputMode: (mode: boolean) => {
      set({ isInputMode: mode });
    },
    
    setSphereCenter: (center: THREE.Vector3) => {
      set({ sphereCenter: center });
    },
    
    focusOnThought: (thoughtPosition: THREE.Vector3) => {
      // Calculate rotation needed to bring thought to front
      const direction = thoughtPosition.clone().normalize();
      const targetX = Math.asin(direction.y);
      const targetY = Math.atan2(-direction.x, -direction.z);
      
      set({ targetRotation: { x: targetX, y: targetY } });
    },

    clearTargetRotation: () => {
      set({ targetRotation: null });
    },

    navigateToThought: (thoughtId: string) => {
      set({ currentParentId: thoughtId });
    },

    navigateBack: () => {
      const state = get();
      const currentThought = state.thoughts.find(t => t.id === state.currentParentId);
      set({ currentParentId: currentThought?.parentId || null });
    },

    setViewMode: (mode: 'sphere' | 'list' | 'earth') => {
      set({ viewMode: mode, isEarthMode: mode === 'earth' });
    },

    setUserLocation: (location: { latitude: number; longitude: number }) => {
      set({ userLocation: location });
    },

    generateThoughtPosition: (useGeolocation?: boolean, mode?: 'sphere' | 'earth') => {
      const state = get();
      // Filter existing positions by mode to avoid conflicts
      const existingPositions = state.thoughts
        .filter(t => t.mode === mode)
        .map(t => t.position);
      
      if (useGeolocation && state.userLocation && mode === 'earth') {
        // Convert lat/lng to sphere position for Earth mode
        const lat = (state.userLocation.latitude * Math.PI) / 180;
        const lng = (state.userLocation.longitude * Math.PI) / 180;
        const radius = 2.3;
        
        const x = radius * Math.cos(lat) * Math.cos(lng);
        const y = radius * Math.sin(lat);
        const z = radius * Math.cos(lat) * Math.sin(lng);
        
        const position = new THREE.Vector3(x, y, z);
        const rotation = new THREE.Euler();
        rotation.setFromVector3(position.clone().normalize());
        
        return { position, rotation };
      }
      
      // Calculate dynamic sphere radius based on thought count for sphere mode
      // Expand sphere when we have many thoughts to maintain spacing
      const baseRadius = 3.5; // Increased from 2.3 to ensure thoughts are always visible
      const sphereThoughts = state.thoughts.filter(t => t.mode === 'sphere');
      const expansionFactor = Math.max(1, Math.sqrt(sphereThoughts.length / 8)); // Start expanding after 8 thoughts
      const dynamicRadius = baseRadius * expansionFactor;
      
      return generateRandomSpherePosition(dynamicRadius, existingPositions);
    }
  }))
);
