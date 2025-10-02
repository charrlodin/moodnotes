import { useState, useCallback, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { motion, AnimatePresence } from 'framer-motion';
import Note from './components/Note';
import BackgroundSelector from './components/BackgroundSelector';
import AudioPlayer from './components/AudioPlayer';
import ShortcutsMenu from './components/ShortcutsMenu';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useUndoRedo } from './hooks/useUndoRedo';
import { Note as NoteType, BackgroundImage, AudioTrack } from './types';

const DEFAULT_BACKGROUNDS: BackgroundImage[] = [
  {
    id: '1',
    name: 'Acrylic Art',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/acrylic.jpg',
  },
  {
    id: '2',
    name: 'Abstract',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/abstract.jpg',
  },
  {
    id: '3',
    name: 'Abandoned',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/abandoned.jpg',
  },
  {
    id: '4',
    name: 'Tokyo Simplistic',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/TokyoSimplistic.jpg',
  },
  {
    id: '5',
    name: 'Alien Planet',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/alien_planet.jpeg',
  },
  {
    id: '6',
    name: 'Android Sakura',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/android-sakura.jpg',
  },
  {
    id: '7',
    name: '4K Mountain',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/4k-ai-mountain.jpg',
  },
  {
    id: '8',
    name: 'Doodle Space Nord',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/Doodle_Space_Nord.png',
  },
  {
    id: '9',
    name: 'Nepal',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/Nepal_5160x2160.png',
  },
  {
    id: '10',
    name: 'House on Cliff',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/a_cartoon_of_a_house_on_a_cliff.png',
  },
  {
    id: '11',
    name: 'Black Panther',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/Black-panther.jpg',
  },
  {
    id: '12',
    name: 'Android Dark Lines',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/android-dark-lines.jpg',
  },
  {
    id: '13',
    name: 'T-Rex Moon',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/Trex-moon.jpg',
  },
  {
    id: '14',
    name: 'Groot',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/Groot.jpg',
  },
  {
    id: '15',
    name: 'Spider-Man',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/Spider-man.jpg',
  },
  {
    id: '16',
    name: '3 Squares',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/3squares.png',
  },
  {
    id: '17',
    name: 'Ant-Man',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/Antman.jpg',
  },
  {
    id: '18',
    name: 'Lain',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/36592_serial_experiments_lain.png',
  },
  {
    id: '19',
    name: 'Kratos',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/Kratos-gow-red.jpg',
  },
  {
    id: '20',
    name: 'Luffy One Piece',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/Luffy_from_One_Piece_5160x2160.jpeg',
  },
  {
    id: '21',
    name: 'Jurassic Dino',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/Jurassic-dino.jpg',
  },
  {
    id: '22',
    name: '4K Keyboard',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/4k-keyboard.jpg',
  },
  {
    id: '23',
    name: 'Computerized Art',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/Computerized_Art_3440x1440_7.jpg',
  },
  {
    id: '24',
    name: 'T-Rex',
    url: 'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/Trex.jpg',
  },
  // Atmospheric Mood Wallpapers - 8K/4K Quality from Unsplash (Verified URLs)
  // Space & Cosmos
  { id: 'space-01', name: 'Milky Way', url: 'https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?q=80&w=3840' },
  { id: 'space-02', name: 'Starry Night', url: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?q=80&w=3840' },
  { id: 'space-03', name: 'Northern Lights', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=3840' },
  { id: 'space-04', name: 'Purple Nebula', url: 'https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?q=80&w=3840' },
  { id: 'space-05', name: 'Deep Space', url: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=3840' },
  // Water & Ocean
  { id: 'water-01', name: 'Calm Waves', url: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?q=80&w=3840' },
  { id: 'water-02', name: 'Misty Lake', url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=3840' },
  { id: 'water-03', name: 'Ocean Sunset', url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=3840' },
  { id: 'water-04', name: 'Blue Ocean', url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=3840' },
  { id: 'water-05', name: 'Peaceful Sea', url: 'https://images.unsplash.com/photo-1484821582734-6c6c9f99a672?q=80&w=3840' },
  // Rain & Storms
  { id: 'rain-01', name: 'Rain Window', url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=3840' },
  { id: 'rain-02', name: 'Dark Clouds', url: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?q=80&w=3840' },
  { id: 'rain-03', name: 'Storm Sky', url: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?q=80&w=3840' },
  // Snow & Winter
  { id: 'snow-01', name: 'Snowy Peak', url: 'https://images.unsplash.com/photo-1457269449834-928af64c684d?q=80&w=3840' },
  { id: 'snow-02', name: 'Winter Trees', url: 'https://images.unsplash.com/photo-1477601263568-180e2c6d046e?q=80&w=3840' },
  { id: 'snow-03', name: 'Frozen Forest', url: 'https://images.unsplash.com/photo-1517299321609-52687d1bc55a?q=80&w=3840' },
  { id: 'snow-04', name: 'Icy Mountain', url: 'https://images.unsplash.com/photo-1421091242698-34f6ad7fc088?q=80&w=3840' },
  { id: 'snow-05', name: 'White Landscape', url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=3840' },
  // Seasons - Autumn
  { id: 'autumn-01', name: 'Fall Colors', url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=3840' },
  { id: 'autumn-02', name: 'Autumn Forest', url: 'https://images.unsplash.com/photo-1505820013142-f86a3439c5b2?q=80&w=3840' },
  { id: 'autumn-03', name: 'Golden Hour', url: 'https://images.unsplash.com/photo-1508615263227-e68d0496e1a5?q=80&w=3840' },
  // Seasons - Spring/Summer
  { id: 'spring-01', name: 'Green Valley', url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=3840' },
  { id: 'spring-02', name: 'Flower Field', url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=3840' },
  { id: 'summer-01', name: 'Lake Reflection', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=3840' },
  // Atmospheric/Moody
  { id: 'mood-01', name: 'Forest Mist', url: 'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=3840' },
  { id: 'mood-02', name: 'Mountain Haze', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=3840' },
  { id: 'mood-03', name: 'Twilight Sky', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=3840' },
  { id: 'mood-04', name: 'Dreamy Clouds', url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=3840' },
];

const AUDIO_TRACKS: AudioTrack[] = [
  {
    id: '1',
    name: 'Distant Horizons',
    url: '/distant-horizons.mp3',
  },
  {
    id: '2',
    name: 'Ocean Calm',
    url: '/ocean-calm.mp3',
  },
  {
    id: '3',
    name: 'Shadows We Keep',
    url: '/Shadows-We-Keep.mp3',
  },
  {
    id: '4',
    name: 'Weightless Whispers',
    url: '/weightless-whispers.mp3',
  },
  {
    id: '5',
    name: "Winter's Breath",
    url: '/winters-breath.mp3',
  },
];

function App() {
  const [notes, setNotes] = useLocalStorage<NoteType[]>('ambient-notes', []);
  const { saveState, undo, redo } = useUndoRedo(notes);
  const [selectedBackground, setSelectedBackground] = useLocalStorage<BackgroundImage>(
    'ambient-background',
    DEFAULT_BACKGROUNDS[0]
  );
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [showShortcutsMenu, setShowShortcutsMenu] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [currentTrack, setCurrentTrack] = useLocalStorage<AudioTrack | null>('current-track', AUDIO_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedTrackRef = useRef<string | null>(null);

  const transformStateRef = useRef({ scale: 1, positionX: 0, positionY: 0 });

  const createNote = useCallback((x?: number, y?: number) => {
    setNotes((prev) => {
      let canvasX, canvasY;
      
      if (x !== undefined && y !== undefined) {
        // Use provided coordinates (from double-click)
        canvasX = x;
        canvasY = y;
      } else {
        // Calculate viewport center in canvas coordinates
        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;
        
        // Convert viewport coordinates to canvas coordinates accounting for zoom and pan
        canvasX = (viewportCenterX - transformStateRef.current.positionX) / transformStateRef.current.scale;
        canvasY = (viewportCenterY - transformStateRef.current.positionY) / transformStateRef.current.scale;
        
        // Add small offset for multiple notes
        const offset = (prev.length % 10) * 30;
        canvasX += offset;
        canvasY += offset;
      }
      
      const newNote: NoteType = {
        id: Date.now().toString(),
        content: '',
        x: canvasX - 200, // Center the note (400px width / 2)
        y: canvasY - 150, // Center the note (300px height / 2)
        width: 400,
        height: 300,
        createdAt: Date.now(),
        color: 'default',
      };
      
      const newNotes = [...prev, newNote];
      saveState(newNotes, 'create');
      return newNotes;
    });
  }, [setNotes, saveState]);

  const updateNote = useCallback(
    (id: string, updates: Partial<NoteType>) => {
      setNotes((prev) => {
        const newNotes = prev.map((note) => (note.id === id ? { ...note, ...updates } : note));
        // Only save to history if it's a significant change (not just typing)
        if (updates.x !== undefined || updates.y !== undefined || updates.width !== undefined || updates.height !== undefined || updates.color !== undefined) {
          saveState(newNotes, 'update');
        }
        return newNotes;
      });
    },
    [setNotes, saveState]
  );

  const deleteNote = useCallback(
    (id: string) => {
      setNotes((prev) => {
        const newNotes = prev.filter((note) => note.id !== id);
        saveState(newNotes, 'delete');
        return newNotes;
      });
    },
    [setNotes, saveState]
  );

  const handleUndo = useCallback(() => {
    const prevState = undo();
    if (prevState) {
      setNotes(prevState);
    }
  }, [undo, setNotes]);

  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      setNotes(nextState);
    }
  }, [redo, setNotes]);

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
      audio.volume = 0;
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

  // Audio fade in/out effect for seamless looping
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isPlaying) return;

    const FADE_IN_DURATION = 3; // 3 seconds fade in
    const TARGET_VOLUME = 0.25;

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;

      if (currentTime < FADE_IN_DURATION) {
        // Fade in at start only
        audio.volume = (currentTime / FADE_IN_DURATION) * TARGET_VOLUME;
      } else {
        // Normal volume for rest of track (loop handles seamless transition)
        audio.volume = TARGET_VOLUME;
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [isPlaying]);

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
    onNewNote: () => createNote(),
    onToggleBackground: () => setShowBackgroundSelector((prev) => !prev),
    onToggleAudio: () => setShowAudioPlayer((prev) => !prev),
    onToggleFocus: toggleFocusMode,
    onToggleShortcuts: () => setShowShortcutsMenu((prev) => !prev),
    onUndo: handleUndo,
    onRedo: handleRedo,
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
          velocityDisabled: false,
          excluded: ['note-container', 'textarea', 'button', 'resize-handle']
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
        {({ zoomIn, zoomOut, resetTransform, instance }) => {
          // Track transform state for note creation
          if (instance) {
            const state = instance.transformState;
            transformStateRef.current = {
              scale: state.scale,
              positionX: state.positionX,
              positionY: state.positionY
            };
          }

          // Handle double-click on canvas
          const handleCanvasDoubleClick = (e: React.MouseEvent) => {
            // Don't create note if clicking on existing note
            if ((e.target as HTMLElement).closest('.note-container')) {
              return;
            }
            // Convert screen coordinates to canvas coordinates
            const canvasX = (e.clientX - transformStateRef.current.positionX) / transformStateRef.current.scale;
            const canvasY = (e.clientY - transformStateRef.current.positionY) / transformStateRef.current.scale;
            createNote(canvasX, canvasY);
          };
          
          return (
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
              <div 
                className="relative" 
                style={{ width: '10000px', height: '10000px' }}
                onDoubleClick={handleCanvasDoubleClick}
              >
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
        );
        }}
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
          onClick={() => createNote()}
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

      {/* Shortcuts button - bottom right */}
      {!focusMode && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          onClick={() => setShowShortcutsMenu(true)}
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.25)" }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full backdrop-blur-xl bg-white/10 text-white font-sans font-bold border border-white/20 flex items-center justify-center text-xl shadow-lg"
          title="Shortcuts (Ctrl+/)"
        >
          ?
        </motion.button>
      )}

      <AnimatePresence>
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
      </AnimatePresence>

      <AnimatePresence>
        {showAudioPlayer && (
          <AudioPlayer
            tracks={AUDIO_TRACKS}
            audioRef={audioRef}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onTrackChange={setCurrentTrack}
            onPlayingChange={setIsPlaying}
            onClose={() => setShowAudioPlayer(false)}
          />
        )}
      </AnimatePresence>

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

      {/* Shortcuts menu - outside main container for proper positioning */}
      <ShortcutsMenu
        isOpen={showShortcutsMenu}
        onClose={() => setShowShortcutsMenu(false)}
      />
    </div>
  );
}

export default App;
