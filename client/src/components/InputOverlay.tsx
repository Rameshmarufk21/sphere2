import React, { useState, useEffect, useRef } from 'react';
import { useThoughts } from '@/lib/stores/useThoughts';

interface InputOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  currentView?: 'sphere' | 'list' | 'earth' | 'earthTest';
}

export const InputOverlay: React.FC<InputOverlayProps> = ({ isVisible, onClose, currentView = 'sphere' }) => {
  const [inputValue, setInputValue] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [attachments, setAttachments] = useState<{images: string[], links: string[], files: string[]}>({
    images: [],
    links: [],
    files: []
  });
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addThought } = useThoughts();

  // Blinking cursor effect
  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 530);
      
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  // Auto-focus when visible
  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const hasAttachments = attachments.images.length || attachments.links.length || attachments.files.length;
      console.log('Adding thought:', {
        text: inputValue,
        mode: 'sphere',
        attachments: hasAttachments ? attachments : undefined
      });
      
      addThought(
        inputValue, 
        hasAttachments ? attachments : undefined
      );
      setInputValue('');
      setAttachments({images: [], links: [], files: []});
      setShowAttachmentMenu(false);
      // Keep input open for more entries
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles = files.map(file => URL.createObjectURL(file));
    setAttachments(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));
  };

  // Handle image upload  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const newImages = imageFiles.map(file => URL.createObjectURL(file));
    setAttachments(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  // Handle link addition
  const handleAddLink = () => {
    if (linkInput.trim()) {
      setAttachments(prev => ({
        ...prev,
        links: [...prev.links, linkInput.trim()]
      }));
      setLinkInput('');
    }
  };

  // Remove attachment
  const removeAttachment = (type: 'images' | 'links' | 'files', index: number) => {
    setAttachments(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  // Handle click outside to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  console.log('InputOverlay render - isVisible:', isVisible, 'currentView:', currentView);
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleOverlayClick}
      style={{ 
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
    >
      <div className="w-full max-w-2xl mx-4">
        <form onSubmit={handleSubmit}>
          <div 
            className="relative"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full px-6 py-4 bg-transparent border-none outline-none text-lg font-medium text-gray-800 placeholder-gray-500"
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            />
            
            {/* Animated cursor */}
            {inputValue === '' && (
              <div 
                className="absolute left-6 top-4 pointer-events-none"
                style={{
                  height: '24px',
                  width: '2px',
                  backgroundColor: '#000',
                  opacity: showCursor ? 1 : 0,
                  transition: 'opacity 0.1s ease',
                  marginLeft: '0px',
                }}
              />
            )}
          </div>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-white opacity-75">
            Press Enter to add thought • Click outside to close
          </p>
        </div>
      </div>
    </div>
  );
};
