import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Note as NoteType } from '../types';

interface NoteProps {
  note: NoteType;
  onUpdate: (id: string, updates: Partial<NoteType>) => void;
  onDelete: (id: string) => void;
  focusMode: boolean;
}

const NOTE_COLORS = {
  default: 'bg-white/20 border-white/20',
  blue: 'bg-blue-500/20 border-blue-400/30',
  purple: 'bg-purple-500/20 border-purple-400/30',
  amber: 'bg-amber-500/20 border-amber-400/30',
  emerald: 'bg-emerald-500/20 border-emerald-400/30',
};

export default function Note({ note, onUpdate, onDelete, focusMode }: NoteProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ width: 0, height: 0 });
  const hasFocusedRef = useRef(false);

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const day = date.getDate();
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' :
                   day === 2 || day === 22 ? 'nd' :
                   day === 3 || day === 23 ? 'rd' : 'th';
    const month = date.toLocaleString('en-GB', { month: 'short' });
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}${suffix} ${month} ${year}, ${hours}:${minutes}`;
  };

  useEffect(() => {
    if (!hasFocusedRef.current && textareaRef.current && note.content === '') {
      setTimeout(() => {
        textareaRef.current?.focus();
        hasFocusedRef.current = true;
      }, 100);
    }
  }, [note.content]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Allow textarea to be clicked and focused normally
    if (target.tagName === 'TEXTAREA') {
      return;
    }
    
    // Allow buttons to work
    if (target.tagName === 'BUTTON') {
      return;
    }
    
    // Don't start drag on resize handle
    if (target.classList.contains('resize-handle')) {
      return;
    }
    
    // Start dragging only on the note background/border area
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    // Store the offset from cursor to note's top-left corner in screen coordinates
    if (noteRef.current) {
      const rect = noteRef.current.getBoundingClientRect();
      dragStartPos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDragging && noteRef.current) {
      // Get the transform wrapper (grandparent with the zoom/pan transform)
      let transformContainer = noteRef.current.parentElement?.parentElement;
      
      // Navigate up to find the actual TransformComponent wrapper
      while (transformContainer && !transformContainer.style.transform && transformContainer.parentElement) {
        transformContainer = transformContainer.parentElement;
      }
      
      if (transformContainer) {
        // Get the transform values
        const transform = window.getComputedStyle(transformContainer).transform;
        let scale = 1;
        let translateX = 0;
        let translateY = 0;
        
        if (transform && transform !== 'none') {
          const matrix = new DOMMatrix(transform);
          scale = matrix.a; // scale
          translateX = matrix.e; // translateX
          translateY = matrix.f; // translateY
        }
        
        // Calculate position in canvas coordinates
        const canvasX = (e.clientX - translateX) / scale - dragStartPos.current.x;
        const canvasY = (e.clientY - translateY) / scale - dragStartPos.current.y;
        
        onUpdate(note.id, { x: canvasX, y: canvasY });
      }
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStartPos.current.x;
      const deltaY = e.clientY - resizeStartPos.current.y;
      const newWidth = Math.max(250, resizeStartSize.current.width + deltaX);
      const newHeight = Math.max(150, resizeStartSize.current.height + deltaY);
      onUpdate(note.id, { width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, note.id, onUpdate]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove, true);
      window.addEventListener('mouseup', handleMouseUp, true);
      window.addEventListener('contextmenu', handleMouseUp, true);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove, true);
        window.removeEventListener('mouseup', handleMouseUp, true);
        window.removeEventListener('contextmenu', handleMouseUp, true);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setIsFocused(false);
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    resizeStartSize.current = { width: note.width, height: note.height };
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(note.id);
  };

  return (
    <motion.div
      ref={noteRef}
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 25
        }
      }}
      exit={{ 
        opacity: 0, 
        scale: 0.9,
        transition: { duration: 0.15 }
      }}
      whileHover={!isDragging && !isResizing ? { 
        scale: 1.01,
        transition: { duration: 0.2 }
      } : {}}
      className={`absolute group note-container ${isDragging ? 'cursor-grabbing' : isResizing ? 'cursor-nwse-resize' : focusMode ? 'cursor-default' : 'cursor-grab'}`}
      style={{
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        pointerEvents: 'auto',
        zIndex: isFocused ? 100 : 10,
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <div
        className={`relative w-full h-full rounded-2xl backdrop-blur-2xl border transition-all duration-300 ease-out ${
          NOTE_COLORS[note.color || 'default']
        } ${
          isFocused ? 'shadow-2xl ring-2 ring-white/10' : 'shadow-xl'
        }`}
        style={{
          backdropFilter: 'blur(40px) saturate(180%)',
        }}
      >
        {/* Drag handle area - top bar */}
        <div 
          className="absolute top-0 left-0 right-0 h-8 rounded-t-2xl cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          style={{ zIndex: 5 }}
        />
        
        {/* Timestamp */}
        <div className="absolute top-3 left-3 pointer-events-none z-10">
          <span className="text-white/40 text-xs font-serif italic">
            {formatTimestamp(note.createdAt)}
          </span>
        </div>

        {/* Color picker - shows on hover at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.15 }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2 p-2 rounded-full backdrop-blur-xl bg-black/40 border border-white/20 opacity-0 group-hover:opacity-100"
        >
          {(Object.keys(NOTE_COLORS) as Array<keyof typeof NOTE_COLORS>).map((color) => (
            <button
              key={color}
              onClick={(e) => {
                e.stopPropagation();
                onUpdate(note.id, { color });
              }}
              className={`w-5 h-5 rounded-full transition-all duration-200 ${NOTE_COLORS[color]} hover:scale-125 ${
                note.color === color || (color === 'default' && !note.color) ? 'ring-2 ring-white/60' : ''
              }`}
              title={color}
            />
          ))}
        </motion.div>

        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2 z-10">
          <button
            onClick={handleDelete}
            className="w-6 h-6 rounded-full backdrop-blur-xl bg-red-500/30 hover:bg-red-500/50 text-white flex items-center justify-center text-xs transition-all duration-200"
          >
            ×
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={note.content}
          onChange={(e) => onUpdate(note.id, { content: e.target.value })}
          onFocus={(e) => {
            e.stopPropagation();
            setIsFocused(true);
          }}
          onBlur={() => {
            setTimeout(() => setIsFocused(false), 100);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          placeholder="Start writing..."
          className="w-full h-full pt-10 px-6 pb-6 bg-transparent border-none outline-none resize-none text-white placeholder-white/50 font-serif text-lg cursor-text pointer-events-auto"
          style={{
            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }}
        />

        <div
          className="resize-handle absolute bottom-0 right-0 w-12 h-12 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onMouseDown={handleResizeStart}
        >
          <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-white/60 rounded-br" />
        </div>
      </div>
    </motion.div>
  );
}
