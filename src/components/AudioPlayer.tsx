import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioTrack } from '../types';

interface AudioPlayerProps {
  tracks: AudioTrack[];
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  onTrackChange: (track: AudioTrack | null) => void;
  onPlayingChange: (playing: boolean) => void;
  onClose: () => void;
}

export default function AudioPlayer({ 
  tracks, 
  currentTrack, 
  isPlaying, 
  onTrackChange, 
  onPlayingChange, 
  onClose 
}: AudioPlayerProps) {
  const [volume, setVolume] = useState(0.25);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const index = tracks.findIndex(t => t.id === currentTrack?.id);
    if (index !== -1) {
      setSelectedIndex(index);
    } else if (!currentTrack && tracks.length > 0) {
      onTrackChange(tracks[0]);
      setSelectedIndex(0);
    }
  }, [currentTrack, tracks]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
      
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const newIndex = e.key === 'ArrowUp' 
          ? (selectedIndex - 1 + tracks.length) % tracks.length
          : (selectedIndex + 1) % tracks.length;
        setSelectedIndex(newIndex);
        onTrackChange(tracks[newIndex]);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onPlayingChange(!isPlaying);
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [selectedIndex, tracks, isPlaying, onClose]);

  const togglePlay = () => {
    if (!currentTrack) return;
    onPlayingChange(!isPlaying);
  };

  const handleTrackSelect = (track: AudioTrack) => {
    if (currentTrack?.id === track.id) return;
    onTrackChange(track);
  };

  const handleStop = () => {
    onPlayingChange(false);
  };

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
          className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full mx-4 border border-white/20"
          onClick={(e) => e.stopPropagation()}
          style={{
            backdropFilter: 'blur(40px) saturate(180%)',
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-medium text-white font-sans">Ambient Sounds</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full backdrop-blur-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-200"
            >
              ×
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {tracks.map((track) => (
              <button
                key={track.id}
                onClick={() => handleTrackSelect(track)}
                className={`w-full px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  currentTrack?.id === track.id
                    ? 'bg-white/20 border-2 border-white/40'
                    : 'bg-white/10 border-2 border-white/20 hover:bg-white/15'
                }`}
              >
                <span className="text-white font-serif italic">{track.name}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={togglePlay}
              disabled={!currentTrack}
              className="w-14 h-14 rounded-full backdrop-blur-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              onClick={handleStop}
              disabled={!currentTrack}
              className="w-14 h-14 rounded-full backdrop-blur-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z" />
              </svg>
            </button>

            <div className="flex-1 flex items-center gap-3">
              <svg className="w-5 h-5 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => {
                  const newVolume = parseFloat(e.target.value);
                  setVolume(newVolume);
                  const audio = document.querySelector('audio');
                  if (audio) {
                    audio.volume = newVolume;
                  }
                }}
                className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.5) ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`,
                }}
              />
            </div>
          </div>

          {isPlaying && currentTrack && (
            <div className="text-center text-white/70 text-sm font-serif italic">
              Now playing: {currentTrack.name}
            </div>
          )}

          <div className="text-center text-white/40 text-xs mt-4">
            <kbd className="font-mono bg-white/10 px-2 py-1 rounded">↑↓</kbd> Navigate · <kbd className="font-mono bg-white/10 px-2 py-1 rounded">Enter</kbd> Play/Pause · <kbd className="font-mono bg-white/10 px-2 py-1 rounded">ESC</kbd> Close
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
