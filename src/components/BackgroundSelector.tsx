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
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 12;
  
  const totalPages = Math.ceil(backgrounds.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentBackgrounds = backgrounds.slice(startIndex, endIndex);

  useEffect(() => {
    const index = backgrounds.findIndex(bg => bg.id === selectedBackground.id);
    if (index !== -1) {
      setSelectedIndex(index);
      // Set page to where the selected background is
      setCurrentPage(Math.floor(index / ITEMS_PER_PAGE));
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

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {currentBackgrounds.map((bg, index) => (
              <motion.button
                key={bg.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
                whileHover={{ scale: 1.08, y: -4 }}
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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mb-4">
              <motion.button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                whileHover={currentPage > 0 ? { scale: 1.05 } : {}}
                whileTap={currentPage > 0 ? { scale: 0.95 } : {}}
                className={`px-4 py-2 rounded-full backdrop-blur-xl bg-white/10 text-white font-sans transition-all duration-200 border border-white/20 ${
                  currentPage === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'
                }`}
              >
                ← Previous
              </motion.button>
              
              <span className="text-white/70 font-sans text-sm">
                Page {currentPage + 1} of {totalPages}
              </span>
              
              <motion.button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                whileHover={currentPage < totalPages - 1 ? { scale: 1.05 } : {}}
                whileTap={currentPage < totalPages - 1 ? { scale: 0.95 } : {}}
                className={`px-4 py-2 rounded-full backdrop-blur-xl bg-white/10 text-white font-sans transition-all duration-200 border border-white/20 ${
                  currentPage === totalPages - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'
                }`}
              >
                Next →
              </motion.button>
            </div>
          )}
          
          <div className="text-center space-y-2">
            <div className="text-white/40 text-xs">
              <kbd className="font-mono bg-white/10 px-2 py-1 rounded">←→↑↓</kbd> Navigate · <kbd className="font-mono bg-white/10 px-2 py-1 rounded">Enter</kbd> Select · <kbd className="font-mono bg-white/10 px-2 py-1 rounded">ESC</kbd> Close
            </div>
            <div className="text-white/40 text-xs font-serif italic">
              Wallpapers from{' '}
              <a href="https://github.com/D3Ext/aesthetic-wallpapers" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white/80 underline transition-colors">
                D3Ext/aesthetic-wallpapers
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
