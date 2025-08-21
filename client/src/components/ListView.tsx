import React, { useState } from 'react';
import { useThoughts, Thought } from '@/lib/stores/useThoughts';

const isDaytime = () => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18;
};

export const ListView: React.FC = () => {
  const { thoughts, removeThought, updateThought, navigateToThought } = useThoughts();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDay] = useState(isDaytime());

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
        <div className="mb-8">
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: textColor }}
          >
            Your Thoughts
          </h1>
          <p 
            className="text-sm opacity-70"
            style={{ color: textColor }}
          >
            {thoughts.length} thought{thoughts.length !== 1 ? 's' : ''} captured
          </p>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div 
            className="mb-6 p-4 rounded-lg"
            style={{ 
              backgroundColor: cardBgColor,
              border: `1px solid ${borderColor}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <div className="flex items-center justify-between">
              <span style={{ color: textColor }}>
                {selectedIds.size} thought{selectedIds.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 text-sm rounded transition-colors"
                  style={{ 
                    color: textColor,
                    backgroundColor: 'transparent',
                    border: `1px solid ${borderColor}`
                  }}
                >
                  Clear
                </button>
                <button
                  onClick={deleteSelected}
                  className="px-3 py-1 text-sm rounded transition-colors bg-red-600 text-white hover:bg-red-700"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Select All Button */}
        {thoughts.length > 0 && selectedIds.size === 0 && (
          <div className="mb-4">
            <button
              onClick={selectAll}
              className="text-sm px-4 py-2 rounded transition-colors"
              style={{ 
                color: textColor,
                backgroundColor: 'transparent',
                border: `1px solid ${borderColor}`
              }}
            >
              Select All
            </button>
          </div>
        )}

        {/* Thoughts List */}
        {thoughts.length === 0 ? (
          <div 
            className="text-center py-12"
            style={{ color: textColor }}
          >
            <div className="text-6xl mb-4 opacity-20">💭</div>
            <h3 className="text-xl font-medium mb-2">No thoughts yet</h3>
            <p className="opacity-60">Click the sphere to add your first thought</p>
          </div>
        ) : (
          <div className="space-y-4">
            {thoughts.map((thought, index) => (
              <div
                key={thought.id}
                className={`p-4 rounded-lg transition-all duration-200 ${
                  selectedIds.has(thought.id) ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{
                  backgroundColor: selectedIds.has(thought.id) 
                    ? (isDay ? '#eff6ff' : '#1e3a8a20') 
                    : cardBgColor,
                  border: `1px solid ${borderColor}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(thought.id)}
                      onChange={() => toggleSelection(thought.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div 
                        className="text-xs opacity-60 mb-1"
                        style={{ color: textColor }}
                      >
                        Thought #{thoughts.length - index}
                      </div>
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
                          className="text-base leading-relaxed"
                          style={{ color: textColor }}
                        >
                          {thought.text}
                        </p>
                      )}
                    </div>
                  </div>
                  {editingId !== thought.id && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => startEditing(thought)}
                        className="p-2 rounded transition-colors"
                        style={{ 
                          color: textColor,
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = hoverColor;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeThought(thought.id)}
                        className="p-2 rounded transition-colors text-red-600 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};