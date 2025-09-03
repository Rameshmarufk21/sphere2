import React, { useState } from 'react';
import { useThoughts, Thought } from '@/lib/stores/useThoughts';

const isDaytime = () => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18;
};

export const ListView: React.FC = () => {
  const { thoughts, removeThought, updateThought, navigateToThought, getSpheres, getSphereThoughts, addThought } = useThoughts();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDay] = useState(isDaytime());
  const [addingToSphere, setAddingToSphere] = useState<string | null>(null);
  const [newThoughtText, setNewThoughtText] = useState('');

  const bgColor = isDay ? '#f8fafc' : '#1e293b';
  const cardBgColor = isDay ? '#ffffff' : '#334155';
  const textColor = isDay ? '#1f2937' : '#f1f5f9';
  const borderColor = isDay ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
  const hoverColor = isDay ? '#f9fafb' : '#475569';

  const startEditing = (thought: Thought) => {
    setEditingId(thought.id);
    setEditText(thought.text);
  };

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      updateThought(editingId, editText.trim());
    }
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const startAddingToSphere = (sphereId: string) => {
    setAddingToSphere(sphereId);
    setNewThoughtText('');
  };

  const saveNewThought = () => {
    if (addingToSphere && newThoughtText.trim()) {
      // Capitalize first letter
      const capitalizedText = newThoughtText.charAt(0).toUpperCase() + newThoughtText.slice(1);
      addThought(capitalizedText, undefined, addingToSphere);
      setNewThoughtText('');
      setAddingToSphere(null);
    }
  };

  const cancelAddingToSphere = () => {
    setAddingToSphere(null);
    setNewThoughtText('');
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const deleteSelected = () => {
    selectedIds.forEach(id => removeThought(id));
    setSelectedIds(new Set());
  };

  const selectAll = () => {
    setSelectedIds(new Set(thoughts.map(t => t.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Create hierarchical structure: spheres with their thoughts
  const hierarchicalData = React.useMemo(() => {
    const spheres = getSpheres();
    const mainSphere = spheres.find(s => s.isMainSphere);
    const otherSpheres = spheres.filter(s => !s.isMainSphere);
    
    const result = [];
    
    // Add main sphere first if it exists
    if (mainSphere) {
      const mainSphereThoughts = getSphereThoughts(mainSphere.sphereId!);
      result.push({
        type: 'sphere' as const,
        sphere: mainSphere,
        thoughts: mainSphereThoughts
      });
    }
    
    // Add other spheres
    otherSpheres.forEach(sphere => {
      const sphereThoughts = getSphereThoughts(sphere.sphereId!);
      result.push({
        type: 'sphere' as const,
        sphere: sphere,
        thoughts: sphereThoughts
      });
    });
    
    return result;
  }, [thoughts, getSpheres, getSphereThoughts]);

  // Component for rendering a single thought with indentation
  const ThoughtItem: React.FC<{ 
    thought: Thought; 
    isIndented: boolean; 
    isSphere: boolean;
  }> = ({ thought, isIndented, isSphere }) => (
    <div
      className={`transition-all duration-300 ${
                  selectedIds.has(thought.id) ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{
                  backgroundColor: selectedIds.has(thought.id) 
                    ? (isDay ? '#eff6ff' : '#1e3a8a20') 
                    : cardBgColor,
                  border: `1px solid ${borderColor}`,
        boxShadow: isSphere 
          ? '0 4px 20px rgba(0,0,0,0.08)' 
          : '0 2px 12px rgba(0,0,0,0.04)',
        borderRadius: isSphere ? '16px' : '12px',
        marginLeft: isIndented ? '2.5rem' : '0',
        marginTop: isIndented ? '0.25rem' : '0.5rem',
        padding: isSphere ? '0.5rem' : '0.375rem',
        borderLeft: isSphere ? `4px solid ${isDay ? '#3b82f6' : '#60a5fa'}` : 'none',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(thought.id)}
                      onChange={() => toggleSelection(thought.id)}
            className="flex-shrink-0"
                    />
                    <div className="flex-1">
                      {editingId === thought.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full p-2 border rounded resize-none"
                            style={{
                              backgroundColor: isDay ? '#ffffff' : '#475569',
                              color: textColor,
                              border: `1px solid ${borderColor}`,
                              minHeight: '80px'
                            }}
                            rows={3}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={saveEdit}
                              className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1 text-sm rounded"
                              style={{ 
                                backgroundColor: 'transparent',
                                color: textColor,
                                border: `1px solid ${borderColor}`
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p 
                className={`${isSphere ? 'text-lg font-semibold' : 'text-base font-normal'}`}
                style={{ 
                  color: textColor,
                  fontFamily: isSphere ? 'Inter, system-ui, sans-serif' : 'Inter, system-ui, sans-serif',
                  lineHeight: isSphere ? '1.4' : '1.5',
                  margin: 0
                }}
                        >
                          {thought.text}
                        </p>
                      )}
                    </div>
                  </div>
                  {editingId !== thought.id && (
          <div className="flex gap-1 ml-4 items-center">
                      {/* Add button for spheres */}
                      {isSphere && (
                        <button
                          onClick={() => startAddingToSphere(thought.sphereId || thought.id)}
                          className="p-2.5 rounded-lg transition-all duration-200 hover:scale-105"
                          style={{ 
                            color: isDay ? '#10b981' : '#34d399',
                            backgroundColor: 'transparent',
                            border: `1px solid ${isDay ? '#d1fae5' : '#065f46'}`
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDay ? '#ecfdf5' : '#064e3b';
                            e.currentTarget.style.color = isDay ? '#059669' : '#6ee7b7';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = isDay ? '#10b981' : '#34d399';
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => startEditing(thought)}
              className="p-2.5 rounded-lg transition-all duration-200 hover:scale-105"
                        style={{ 
                color: isDay ? '#6b7280' : '#9ca3af',
                backgroundColor: 'transparent',
                border: `1px solid ${isDay ? '#e5e7eb' : '#374151'}`
                        }}
                        onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDay ? '#f3f4f6' : '#374151';
                e.currentTarget.style.color = isDay ? '#374151' : '#d1d5db';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = isDay ? '#6b7280' : '#9ca3af';
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeThought(thought.id)}
              className="p-2.5 rounded-lg transition-all duration-200 hover:scale-105"
              style={{
                color: '#ef4444',
                backgroundColor: 'transparent',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fef2f2';
                e.currentTarget.style.color = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#ef4444';
              }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
    </div>
  );

  return (
    <div 
      className="w-full h-full p-6 overflow-auto"
      style={{ 
        backgroundColor: bgColor,
        transition: 'background-color 0.5s ease'
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 
            className="text-4xl font-bold mb-3 tracking-tight"
            style={{ 
              color: textColor,
              fontFamily: 'Inter, system-ui, sans-serif',
              fontWeight: '700'
            }}
          >
            Your Thoughts
          </h1>
          <p 
            className="text-base opacity-75 font-medium"
            style={{ 
              color: textColor,
              fontFamily: 'Inter, system-ui, sans-serif'
            }}
          >
            {thoughts.length} thought{thoughts.length !== 1 ? 's' : ''} captured across {hierarchicalData.length} sphere{hierarchicalData.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div 
            className="mb-8 p-5 rounded-xl"
            style={{ 
              backgroundColor: cardBgColor,
              border: `1px solid ${borderColor}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              borderRadius: '16px'
            }}
          >
            <div className="flex items-center justify-between">
              <span 
                className="font-medium"
                style={{ 
                  color: textColor,
                  fontFamily: 'Inter, system-ui, sans-serif'
                }}
              >
                {selectedIds.size} thought{selectedIds.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-3">
                <button
                  onClick={clearSelection}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105"
                  style={{ 
                    color: textColor,
                    backgroundColor: 'transparent',
                    border: `1px solid ${borderColor}`,
                    fontFamily: 'Inter, system-ui, sans-serif'
                  }}
                >
                  Clear
                </button>
                <button
                  onClick={deleteSelected}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 bg-red-600 text-white hover:bg-red-700"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Select All Button */}
        {thoughts.length > 0 && selectedIds.size === 0 && (
          <div className="mb-6">
            <button
              onClick={selectAll}
              className="text-sm px-5 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-105"
              style={{ 
                color: textColor,
                backgroundColor: 'transparent',
                border: `1px solid ${borderColor}`,
                fontFamily: 'Inter, system-ui, sans-serif',
                borderRadius: '12px'
              }}
            >
              Select All
            </button>
          </div>
        )}

        {/* Hierarchical Thoughts List */}
        {hierarchicalData.length === 0 ? (
          <div 
            className="text-center py-12"
            style={{ color: textColor }}
          >
            <div className="text-6xl mb-4 opacity-20">💭</div>
            <h3 className="text-xl font-medium mb-2">No thoughts yet</h3>
            <p className="opacity-60">Click the sphere to add your first thought</p>
          </div>
        ) : (
          <div className="space-y-0">
            {hierarchicalData.map((item, sphereIndex) => (
              <div key={item.sphere.id}>
                {/* Sphere Title */}
                <ThoughtItem 
                  thought={item.sphere} 
                  isIndented={false} 
                  isSphere={true}
                />
                
                {/* Add Thought Input for this sphere */}
                {addingToSphere === item.sphere.id && (
                  <div 
                    className="ml-8 mt-2 mb-2 p-3 rounded-lg"
                    style={{
                      backgroundColor: cardBgColor,
                      border: `1px solid ${borderColor}`,
                      borderRadius: '12px'
                    }}
                  >
                    <div className="space-y-2">
                      <textarea
                        value={newThoughtText}
                        onChange={(e) => setNewThoughtText(e.target.value)}
                        placeholder="Add a new thought to this sphere..."
                        className="w-full p-2 border rounded resize-none"
                        style={{
                          backgroundColor: isDay ? '#ffffff' : '#475569',
                          color: textColor,
                          border: `1px solid ${borderColor}`,
                          minHeight: '60px'
                        }}
                        rows={2}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveNewThought}
                          className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700 transition-colors"
                        >
                          Add Thought
                        </button>
                        <button
                          onClick={cancelAddingToSphere}
                          className="px-3 py-1 text-sm rounded transition-colors"
                          style={{ 
                            backgroundColor: 'transparent',
                            color: textColor,
                            border: `1px solid ${borderColor}`
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Sphere Thoughts (indented) */}
                {item.thoughts.map((thought) => (
                  <ThoughtItem 
                    key={thought.id} 
                    thought={thought} 
                    isIndented={true} 
                    isSphere={false}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};