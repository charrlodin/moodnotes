import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BackgroundImage } from '../types';

interface BackgroundSelectorProps {
  backgrounds: BackgroundImage[];
  selectedBackground: BackgroundImage;
  onSelect: (background: BackgroundImage) => void;
  onClose: () => void;
}

export default function BackgroundSelector({
  backgrounds,
  selectedBackground,
  onSelect,
  onClose,
}: BackgroundSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const index = backgrounds.findIndex(bg => bg.id === selectedBackground.id);
    if (index !== -1) {
      setSelectedIndex(index);
    }
  }, [selectedBackground, backgrounds]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        let newIndex = selectedIndex;
        
        if (e.key === 'ArrowLeft') {
          newIndex = (selectedIndex - 1 + backgrounds.length) % backgrounds.length;
        } else if (e.key === 'ArrowRight') {
          newIndex = (selectedIndex + 1) % backgrounds.length;
        } else if (e.key === 'ArrowUp') {
          newIndex = (selectedIndex - 3 + backgrounds.length) % backgrounds.length;
        } else if (e.key === 'ArrowDown') {
          newIndex = (selectedIndex + 3) % backgrounds.length;
        }
        
        setSelectedIndex(newIndex);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(backgrounds[selectedIndex]);
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [selectedIndex, backgrounds, onSelect]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 max-w-2xl w-full mx-4 border border-white/20 max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          style={{
            backdropFilter: 'blur(40px) saturate(180%)',
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-medium text-white font-sans">Select Background</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full backdrop-blur-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-200"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {backgrounds.map((bg, index) => (
              <motion.button
                key={bg.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(bg)}
                className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  selectedIndex === index
                    ? 'border-white shadow-2xl'
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                <img
                  src={bg.url}
                  alt={bg.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                  <span className="text-white text-sm font-serif italic">{bg.name}</span>
                </div>
                {selectedIndex === index && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
          
          <div className="text-center space-y-2 mt-6">
            <div className="text-white/40 text-xs">
              <kbd className="font-mono bg-white/10 px-2 py-1 rounded">←→↑↓</kbd> Navigate · <kbd className="font-mono bg-white/10 px-2 py-1 rounded">Enter</kbd> Select · <kbd className="font-mono bg-white/10 px-2 py-1 rounded">ESC</kbd> Close
            </div>
            <div className="text-white/30 text-xs">
              Images provided by <a href="https://github.com/D3Ext/aesthetic-wallpapers" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white/70 underline">D3Ext/aesthetic-wallpapers</a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
