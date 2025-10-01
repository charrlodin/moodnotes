import { useState, useCallback, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { motion } from 'framer-motion';
import Note from './components/Note';
import BackgroundSelector from './components/BackgroundSelector';
import AudioPlayer from './components/AudioPlayer';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Note as NoteType, BackgroundImage, AudioTrack } from './types';

const DEFAULT_BACKGROUNDS: BackgroundImage[] = [
  {
    id: '1',
    name: 'Epic Waterfall',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/beautiful.jpg',
  },
  {
    id: '2', 
    name: 'Nord Knight',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/black.jpg',
  },
  {
    id: '3',
    name: 'Colorful Planets',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/colorful-planets.jpg',
  },
  {
    id: '4',
    name: 'Abstract Colors',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/colors.jpg',
  },
  {
    id: '5',
    name: 'Ocean Clouds',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/ocean_with_cloud.png',
  },
  {
    id: '6',
    name: 'Fantasy Forest',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/forest.png',
  },
  {
    id: '7',
    name: 'Fantasy Woods',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/fantasy-woods.jpg',
  },
  {
    id: '8',
    name: 'Space Orbit',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/orbit.png',
  },
  {
    id: '9',
    name: 'Light Ring',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/light-ring.jpg',
  },
  {
    id: '10',
    name: 'Kyoto Sunset',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/yellow_kyoto.jpg',
  },
];

const AUDIO_TRACKS: AudioTrack[] = [
  {
    id: '1',
    name: 'Distant Horizons',
    url: '/Distant Horizons.mp3',
  },
  {
    id: '2',
    name: 'Ocean Calm',
    url: '/Ocean Calm.mp3',
  },
  {
    id: '3',
    name: 'Shadows We Keep',
    url: '/Shadows-We-Keep.mp3',
  },
  {
    id: '4',
    name: 'Weightless Whispers',
    url: '/Weightless Whispers.mp3',
  },
  {
    id: '5',
    name: "Winter's Breath",
    url: "/Winter's Breath.mp3",
  },
];

function App() {
  const [notes, setNotes] = useLocalStorage<NoteType[]>('ambient-notes', []);
  const [selectedBackground, setSelectedBackground] = useLocalStorage<BackgroundImage>(
    'ambient-background',
    DEFAULT_BACKGROUNDS[0]
  );
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [currentTrack, setCurrentTrack] = useLocalStorage<AudioTrack | null>('current-track', AUDIO_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedTrackRef = useRef<string | null>(null);

  const createNote = useCallback(() => {
    setNotes((prev) => {
      let x = window.innerWidth / 2 - 200;
      let y = window.innerHeight / 2 - 150;
      
      if (prev.length > 0) {
        const offset = (prev.length % 10) * 30;
        x = x + offset;
        y = y + offset;
      }
      
      const newNote: NoteType = {
        id: Date.now().toString(),
        content: '',
        x,
        y,
        width: 400,
        height: 300,
        createdAt: Date.now(),
      };
      
      return [...prev, newNote];
    });
  }, [setNotes]);

  const updateNote = useCallback((id: string, updates: Partial<NoteType>) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, ...updates } : note))
    );
  }, [setNotes]);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }, [setNotes]);

  const exportNotes = useCallback(() => {
    const dataStr = JSON.stringify(notes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ambient-notes-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [notes]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    // Load track if needed
    if (loadedTrackRef.current !== currentTrack.id) {
      audio.pause();
      audio.src = currentTrack.url;
      audio.volume = 0.25;
      audio.loop = true;
      loadedTrackRef.current = currentTrack.id;
      audio.load();
    }

    // Control playback
    if (isPlaying) {
      audio.play().catch(() => {
        // Autoplay blocked - wait for first user interaction
        const startOnInteraction = () => {
          audio.play();
        };
        document.addEventListener('click', startOnInteraction, { once: true });
        document.addEventListener('keydown', startOnInteraction, { once: true });
      });
    } else {
      audio.pause();
    }
  }, [currentTrack, isPlaying]);

  const toggleFocusMode = useCallback(async () => {
    if (!focusMode) {
      if (containerRef.current) {
        try {
          await containerRef.current.requestFullscreen();
          setFocusMode(true);
        } catch (err) {
          console.log('Fullscreen failed:', err);
          setFocusMode(true);
        }
      }
    } else {
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
          // Refocus the window after exiting fullscreen to allow shortcuts
          setTimeout(() => window.focus(), 100);
        } catch (err) {
          console.log('Exit fullscreen failed:', err);
        }
      }
      setFocusMode(false);
    }
  }, [focusMode]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && focusMode) {
        setFocusMode(false);
        // Refocus window when exiting fullscreen
        setTimeout(() => window.focus(), 100);
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [focusMode]);

  useKeyboardShortcuts({
    onNewNote: createNote,
    onToggleBackground: () => setShowBackgroundSelector((prev) => !prev),
    onToggleAudio: () => setShowAudioPlayer((prev) => !prev),
    onToggleFocus: toggleFocusMode,
    focusMode,
  });

  return (
    <div ref={containerRef} className="w-screen h-screen overflow-hidden relative bg-black">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: `url(${selectedBackground.url})` }}
      />
      
      <div className="absolute inset-0 bg-black/10" />

      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={3}
        centerOnInit
        limitToBounds={false}
        panning={{ 
          disabled: false,
          velocityDisabled: false
        }}
        wheel={{ 
          disabled: focusMode,
          smoothStep: 0.005,
          step: 0.1
        }}
        doubleClick={{ disabled: true }}
        velocityAnimation={{
          sensitivity: 1,
          animationTime: 400,
          animationType: "easeOutQuart",
          disabled: false
        }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {!focusMode && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="absolute left-6 top-6 z-50 flex gap-2"
              >
                <motion.button
                  onClick={() => zoomIn()}
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.25)" }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="w-11 h-11 rounded-full backdrop-blur-xl bg-white/10 text-white flex items-center justify-center border border-white/20"
                  title="Zoom In"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </motion.button>
                <motion.button
                  onClick={() => zoomOut()}
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.25)" }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="w-11 h-11 rounded-full backdrop-blur-xl bg-white/10 text-white flex items-center justify-center border border-white/20"
                  title="Zoom Out"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </motion.button>
                <motion.button
                  onClick={() => resetTransform()}
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.25)" }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="w-11 h-11 rounded-full backdrop-blur-xl bg-white/10 text-white flex items-center justify-center border border-white/20"
                  title="Reset View"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </motion.button>
              </motion.div>
            )}
            
            <TransformComponent
              wrapperClass="!w-full !h-full"
              contentClass="!w-full !h-full"
            >
              <div className="relative" style={{ width: '10000px', height: '10000px' }}>
                {notes.map((note) => (
                  <Note
                    key={note.id}
                    note={note}
                    onUpdate={updateNote}
                    onDelete={deleteNote}
                    focusMode={focusMode}
                  />
                ))}
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>

      {!focusMode && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="absolute top-6 right-6 flex flex-col gap-3 z-50"
        >
        <motion.button
          onClick={() => setShowBackgroundSelector((prev) => !prev)}
          whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.25)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="px-4 py-2 rounded-full backdrop-blur-xl bg-white/10 text-white font-sans font-medium border border-white/20"
        >
          Background
        </motion.button>
        <motion.button
          onClick={() => setShowAudioPlayer((prev) => !prev)}
          whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.25)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="px-4 py-2 rounded-full backdrop-blur-xl bg-white/10 text-white font-sans font-medium border border-white/20"
        >
          Audio
        </motion.button>
        <motion.button
          onClick={createNote}
          whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.25)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="px-4 py-2 rounded-full backdrop-blur-xl bg-white/10 text-white font-sans font-medium border border-white/20"
        >
          + Note
        </motion.button>
        <motion.button
          onClick={exportNotes}
          disabled={notes.length === 0}
          whileHover={notes.length > 0 ? { scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.25)" } : {}}
          whileTap={notes.length > 0 ? { scale: 0.95 } : {}}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="px-4 py-2 rounded-full backdrop-blur-xl bg-white/10 text-white font-sans font-medium border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Export notes as JSON"
        >
          Export
        </motion.button>
        <motion.button
          onClick={toggleFocusMode}
          whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.25)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="px-4 py-2 rounded-full backdrop-blur-xl bg-white/10 text-white font-sans font-medium border border-white/20"
        >
          Focus
        </motion.button>
      </motion.div>
      )}

      {showBackgroundSelector && (
        <BackgroundSelector
          backgrounds={DEFAULT_BACKGROUNDS}
          selectedBackground={selectedBackground}
          onSelect={(bg) => {
            setSelectedBackground(bg);
            setShowBackgroundSelector(false);
          }}
          onClose={() => setShowBackgroundSelector(false)}
        />
      )}

      {showAudioPlayer && (
        <AudioPlayer
          tracks={AUDIO_TRACKS}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onTrackChange={setCurrentTrack}
          onPlayingChange={setIsPlaying}
          onClose={() => setShowAudioPlayer(false)}
        />
      )}

      <audio 
        ref={audioRef} 
        loop 
        preload="auto"
      />

      {focusMode && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="text-white/60 text-xs text-center font-serif italic bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
            Press <kbd className="font-mono not-italic bg-white/10 px-1 py-0.5 rounded text-xs">ESC</kbd> to exit focus mode
          </div>
        </div>
      )}

      {!focusMode && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="px-4 py-2 rounded-full backdrop-blur-xl bg-white/10 text-white/70 text-sm border border-white/20 font-serif italic">
            <kbd className="font-mono not-italic">Ctrl+N</kbd> New Note · <kbd className="font-mono not-italic">Ctrl+B</kbd> Background · <kbd className="font-mono not-italic">Ctrl+M</kbd> Audio · <kbd className="font-mono not-italic">Ctrl+F</kbd> Focus
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
