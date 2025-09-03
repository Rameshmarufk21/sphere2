import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import * as THREE from "three";

export interface Thought {
  id: string;
  text: string;
  title: string; // First word becomes the title
  position: THREE.Vector3;
  rotation: THREE.Euler;
  createdAt: Date;
  parentId?: string;
  mode: 'sphere'; // Simplified to just sphere mode
  attachments?: {
    images?: string[];
    links?: string[];
    files?: string[];
  };
  // Fields for sphere hierarchy
  isMainSphere?: boolean; // True for the main sphere, false for sub-spheres
  sphereId?: string; // ID of the sphere this thought belongs to
  thoughtType?: 'sphere' | 'thought'; // Whether this creates a sphere or is just a thought
  isComplete?: boolean; // Flag to indicate if a sphere has been completed
}

interface ThoughtsState {
  thoughts: Thought[];
  isInputMode: boolean;
  sphereCenter: THREE.Vector3;
  targetRotation: { x: number; y: number } | null;
  currentParentId: string | null;
  currentSphereId: string | null; // Current sphere being viewed
  viewMode: 'sphere' | 'list' | 'galaxy' | 'test-x' | 'test-2' | 'mobile-dev';
  previousViewMode: 'sphere' | 'list' | 'galaxy' | 'test-x' | 'test-2' | 'mobile-dev' | null; // Track previous view for back navigation
  
  // Actions
  addThought: (text: string, attachments?: any, sphereId?: string) => void;
  removeThought: (id: string) => void;
  updateThought: (id: string, text: string) => void;
  setInputMode: (mode: boolean) => void;
  setSphereCenter: (center: THREE.Vector3) => void;
  focusOnThought: (thoughtPosition: THREE.Vector3) => void;
  clearTargetRotation: () => void;
  navigateToThought: (thoughtId: string) => void;
  navigateBack: () => void;
  setViewMode: (mode: 'sphere' | 'list' | 'galaxy' | 'test-x' | 'test-2') => void;
  navigateToSphere: (sphereId: string) => void; // Navigate to a specific sphere
  setPreviousViewMode: (mode: 'sphere' | 'list' | 'galaxy' | 'test-x' | 'test-2' | null) => void; // Set previous view mode
  backToPreviousView: () => void; // Go back to previous view mode
  generateThoughtPosition: () => { position: THREE.Vector3; rotation: THREE.Euler };
  getMainSphereTitle: () => string | null;
  getSphereThoughts: (sphereId: string) => Thought[]; // Get thoughts for a specific sphere
  getSpheres: () => Thought[]; // Get all sphere-creating thoughts
  resetToMainSphere: () => void;
  createFreshSphere: () => string;
  createSubsphere: (originalThought: Thought) => string;
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
    currentSphereId: null,
    viewMode: 'sphere',
    previousViewMode: null,
    
    addThought: (text: string, attachments?: any, sphereId?: string) => {
      const state = get();
      
      // Extract first word as title
      const words = text.trim().split(' ');
      const title = words[0] || text.trim();
      
      // Determine if this thought creates a new sphere
      const isFirstThought = state.thoughts.length === 0;
      const isSphereThought = isFirstThought || text.length > 25; // Long thoughts become spheres
      
      let newThought: Thought;
      
      if (isFirstThought) {
        // First thought becomes the main sphere
        newThought = {
          id: Math.random().toString(36).substr(2, 9),
          text: text.trim(),
          title,
          position: new THREE.Vector3(0, 0, 0),
          rotation: new THREE.Euler(0, 0, 0),
          createdAt: new Date(),
          parentId: undefined,
          mode: 'sphere',
          attachments,
          isMainSphere: true,
          sphereId: Math.random().toString(36).substr(2, 9),
          thoughtType: 'sphere'
        };
        
        // Set this as the current sphere
        set({ currentSphereId: newThought.sphereId });
      } else if (isSphereThought) {
        // Long thoughts become new spheres (subspheres)
        const { position, rotation } = state.generateThoughtPosition();
        newThought = {
          id: Math.random().toString(36).substr(2, 9),
          text: text.trim(),
          title,
          position,
          rotation,
          createdAt: new Date(),
          parentId: sphereId || state.currentSphereId || state.thoughts.find(t => t.isMainSphere)?.sphereId,
          mode: 'sphere',
          attachments,
          isMainSphere: false,
          sphereId: Math.random().toString(36).substr(2, 9),
          thoughtType: 'sphere'
        };
      } else {
        // Regular thoughts within a sphere
        const { position, rotation } = state.generateThoughtPosition();
        const targetSphereId = sphereId || state.currentSphereId || state.thoughts.find(t => t.isMainSphere)?.sphereId;
        
        // Check if this is the first thought in a fresh sphere (no sphere structure exists yet)
        const isFirstThoughtInFreshSphere = targetSphereId && !state.thoughts.some(t => t.thoughtType === 'sphere' && t.sphereId === targetSphereId);
        
        if (isFirstThoughtInFreshSphere) {
          // This is the first thought in a fresh sphere - create ONLY the sphere structure
          // Don't create a separate thought - the sphere structure IS the first thought
          newThought = {
            id: Math.random().toString(36).substr(2, 9),
            text: text.trim(), // The actual content becomes the sphere's text
            title, // This will be the sphere title
            position: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            createdAt: new Date(),
            parentId: undefined,
            mode: 'sphere',
            attachments,
            isMainSphere: false,
            sphereId: targetSphereId,
            thoughtType: 'sphere' // This is both the sphere structure AND the first thought
          };
        } else {
          // Regular thoughts within an existing sphere
          newThought = {
            id: Math.random().toString(36).substr(2, 9),
            text: text.trim(),
            title,
            position,
            rotation,
            createdAt: new Date(),
            parentId: targetSphereId,
            mode: 'sphere',
            attachments,
            isMainSphere: false,
            sphereId: targetSphereId,
            thoughtType: 'thought'
          };
        }
      }
      
      set((prevState) => ({
        thoughts: [...prevState.thoughts, newThought],
        isInputMode: false
      }));
      
      console.log('Added thought:', newThought);
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

    setViewMode: (mode: 'sphere' | 'list' | 'galaxy' | 'test-x' | 'test-2') => {
      const currentState = get();
      set({ 
        viewMode: mode,
        previousViewMode: currentState.viewMode !== mode ? currentState.viewMode : currentState.previousViewMode
      });
    },

    generateThoughtPosition: () => {
      const state = get();
      // Get all existing positions for spacing
      const existingPositions = state.thoughts.map(t => t.position);
      
      // Calculate dynamic sphere radius based on thought count
      // Expand sphere when we have many thoughts to maintain spacing
      const baseRadius = 3.5; // Increased from 2.3 to ensure thoughts are always visible
      const expansionFactor = Math.max(1, Math.sqrt(state.thoughts.length / 8)); // Start expanding after 8 thoughts
      const dynamicRadius = baseRadius * expansionFactor;
      
      return generateRandomSpherePosition(dynamicRadius, existingPositions);
    },
    
    navigateToSphere: (sphereId: string) => {
      console.log('🧭 navigateToSphere called with sphereId:', sphereId);
      const currentState = get();
      console.log('🧭 Current state before navigation:', {
        currentSphereId: currentState.currentSphereId,
        totalThoughts: currentState.thoughts.length
      });
      
      set({ currentSphereId: sphereId });
      
      const newState = get();
      console.log('🧭 State after navigation:', {
        currentSphereId: newState.currentSphereId,
        totalThoughts: newState.thoughts.length
      });
    },
    
    getSphereThoughts: (sphereId: string) => {
      const state = get();
      const filteredThoughts = state.thoughts.filter(t => t.sphereId === sphereId && t.thoughtType === 'thought');
      console.log('🔍 getSphereThoughts:', {
        sphereId,
        totalThoughts: state.thoughts.length,
        filteredThoughts: filteredThoughts.length,
        allThoughts: state.thoughts.map(t => ({ id: t.id, sphereId: t.sphereId, thoughtType: t.thoughtType, title: t.title }))
      });
      return filteredThoughts;
    },
    
    getSpheres: () => {
      const state = get();
      // Get all sphere-creating thoughts
      return state.thoughts.filter(t => t.thoughtType === 'sphere');
    },
    
    getMainSphereTitle: () => {
      const state = get();
      // Get the first thought in sphere mode (main sphere) to use as title
      const mainSphereThoughts = state.thoughts.filter(t => !t.parentId && t.mode === 'sphere');
      return mainSphereThoughts.length > 0 ? mainSphereThoughts[0].title : null;
    },
    
    resetToMainSphere: () => {
      const state = get();
      const mainSphere = state.thoughts.find(t => t.isMainSphere);
      if (mainSphere) {
        set({ currentSphereId: mainSphere.sphereId });
      }
    },
    
    createFreshSphere: () => {
      const state = get();
      // Create a new sphere ID
      const newSphereId = Math.random().toString(36).substr(2, 9);
      // Set input mode to true so user can input the first thought
      set({ 
        currentSphereId: newSphereId,
        isInputMode: true 
      });
      return newSphereId;
    },
    
    setPreviousViewMode: (mode: 'sphere' | 'list' | 'galaxy' | 'test-x' | 'test-2' | null) => {
      set({ previousViewMode: mode });
    },
    
    backToPreviousView: () => {
      const state = get();
      if (state.previousViewMode) {
        set({ 
          viewMode: state.previousViewMode,
          previousViewMode: null // Clear previous view mode after going back
        });
      }
    },
    
    createSubsphere: (originalThought: Thought) => {
      const state = get();
      // Create a new sphere ID for the subsphere
      const newSphereId = Math.random().toString(36).substr(2, 9);
      
      // Create the sphere structure with the original thought as title
      const sphereThought: Thought = {
        id: Math.random().toString(36).substr(2, 9),
        text: originalThought.text,
        title: originalThought.title,
        position: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
        createdAt: new Date(),
        parentId: originalThought.sphereId, // Link back to parent sphere
        mode: 'sphere',
        attachments: undefined,
        isMainSphere: false,
        sphereId: newSphereId,
        thoughtType: 'sphere'
      };
      
      // Add the sphere structure and set as current
      set((prevState) => ({
        thoughts: [...prevState.thoughts, sphereThought],
        currentSphereId: newSphereId
      }));
      
      return newSphereId;
    }
  }))
);
