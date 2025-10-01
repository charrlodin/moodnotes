# Ambient Notes ✨

A beautiful, minimal note-taking app inspired by OmmWriter. Create notes on an infinite canvas with stunning backgrounds and calming ambient music.

![Ambient Notes](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **Infinite Canvas**: Pan and zoom freely across an unlimited workspace with your notes
- **Glass Morphism Design**: Beautiful frosted glass effect notes with backdrop blur
- **Aesthetic Backgrounds**: 10 stunning 4K wallpapers from [D3Ext/aesthetic-wallpapers](https://github.com/D3Ext/aesthetic-wallpapers)
- **Ambient Audio**: Calming background music to help you focus (add your own tracks!)
- **Focus Mode**: True fullscreen distraction-free writing environment
- **Full Keyboard Support**: Navigate and control everything with keyboard shortcuts
- **Beautiful Typography**: Quicksand and PT Serif fonts for elegant note-taking
- **Drag & Resize**: Move and resize notes freely with intuitive controls
- **Auto-Save**: Notes automatically save to localStorage
- **Export Notes**: Download all your notes as JSON for backup
- **Responsive Design**: Works beautifully on desktop and tablet

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/charrlodin/moodnotes.git
cd moodnotes

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview  # Preview the production build
```

## ⌨️ Keyboard Shortcuts

### Global Shortcuts
- `Ctrl+N` / `Cmd+N` - Create new note
- `Ctrl+B` / `Cmd+B` - Open background selector
- `Ctrl+M` / `Cmd+M` - Open audio player
- `Ctrl+F` / `Cmd+F` - Enter focus mode
- `ESC` - Exit focus mode or close modals

### In Modals
- `↑` `↓` `←` `→` - Navigate through options
- `Enter` / `Space` - Select/Confirm
- `ESC` - Close modal

## 🎵 Adding Your Own Audio

1. Place your MP3/WAV files in the `public/` folder
2. Update the `AUDIO_TRACKS` array in `src/App.tsx`:

```typescript
const AUDIO_TRACKS: AudioTrack[] = [
  {
    id: '1',
    name: 'Your Track Name',
    url: '/your-audio-file.mp3',
  },
  // Add more tracks...
];
```

## 🛠️ Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Zoom Pan Pinch** - Infinite canvas functionality

## 📁 Project Structure

```
ambient-notes/
├── src/
│   ├── components/
│   │   ├── Note.tsx              # Individual note component
│   │   ├── AudioPlayer.tsx       # Audio player modal
│   │   └── BackgroundSelector.tsx # Background selector modal
│   ├── hooks/
│   │   ├── useKeyboardShortcuts.ts # Global keyboard shortcuts
│   │   └── useLocalStorage.ts     # localStorage persistence
│   ├── types.ts                  # TypeScript type definitions
│   ├── App.tsx                   # Main application component
│   └── main.tsx                  # Application entry point
├── public/                       # Static assets (audio files)
└── index.html                    # HTML template
```

## 🎨 Customization

### Change Background Images

Edit the `DEFAULT_BACKGROUNDS` array in `src/App.tsx` with your preferred image URLs.

### Adjust Audio Volume

The default volume is set to 25%. You can adjust this in `src/App.tsx`:

```typescript
audioRef.current.volume = 0.25; // Change to your preferred volume (0.0 to 1.0)
```

### Modify Color Scheme

Edit the Tailwind classes in components to match your preferred aesthetic. The glass morphism effect is achieved with:

```css
backdrop-blur-2xl bg-white/20 border border-white/20
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

- Background images from [D3Ext/aesthetic-wallpapers](https://github.com/D3Ext/aesthetic-wallpapers)
- Fonts from [Google Fonts](https://fonts.google.com/)
- Inspired by [OmmWriter](https://ommwriter.com/)

## 💖 Support

If you find this project helpful, consider supporting the development:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/looplaps)

---

Made with ❤️ by the open-source community
