import { motion, AnimatePresence } from 'framer-motion';

interface ShortcutsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { key: 'Ctrl/Cmd + N', description: 'New note' },
  { key: 'Ctrl/Cmd + Z', description: 'Undo' },
  { key: 'Ctrl/Cmd + Shift + Z', description: 'Redo' },
  { key: 'Ctrl/Cmd + B', description: 'Backgrounds' },
  { key: 'Ctrl/Cmd + M', description: 'Music' },
  { key: 'Ctrl/Cmd + F', description: 'Focus mode' },
  { key: 'Double-click', description: 'Create note at position' },
  { key: 'Hover note', description: 'Show color swatches' },
  { key: 'ESC', description: 'Close / Exit focus' },
];

export default function ShortcutsMenu({ isOpen, onClose }: ShortcutsMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />

          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[340px] max-h-[90vh] overflow-y-auto rounded-2xl backdrop-blur-2xl bg-white/10 border border-white/20 shadow-2xl p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-sans font-semibold text-lg">Shortcuts</h3>
              <button
                onClick={onClose}
                className="w-6 h-6 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Shortcuts List */}
            <div className="space-y-2">
              {shortcuts.map((shortcut, index) => (
                <motion.div
                  key={shortcut.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors duration-200"
                >
                  <span className="text-white/60 text-sm font-serif italic">
                    {shortcut.description}
                  </span>
                  <kbd className="px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-xs font-mono font-medium">
                    {shortcut.key}
                  </kbd>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
