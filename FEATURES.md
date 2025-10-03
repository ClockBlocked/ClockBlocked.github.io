# Advanced Music Player Features

This document describes the 7 NEW advanced features added to the music player application.

## 🎨 Feature 1: Audio Visualizer

Real-time audio frequency visualization with three different visualization modes.

### Features:
- **Bars Mode**: Colorful frequency bars showing audio spectrum
- **Wave Mode**: Smooth waveform visualization
- **Circular Mode**: Circular radial visualization

### Usage:
```javascript
// Toggle visualizer on/off
toggleVisualizer();

// Set specific visualization mode
setVisualizerMode('bars');    // Bar visualization
setVisualizerMode('wave');    // Waveform visualization
setVisualizerMode('circular'); // Circular visualization

// Direct API access
audioVisualizer.start('visualizer-container');
audioVisualizer.stop();
audioVisualizer.setMode('wave');
```

### Requirements:
- Requires a DOM container with id `visualizer-container`
- Uses Web Audio API

---

## 🎵 Feature 2: Crossfade

Smooth transitions between songs with configurable fade duration.

### Features:
- Configurable fade duration (1-10 seconds)
- Smooth volume transitions
- Automatic song switching

### Usage:
```javascript
// Enable/disable crossfade
toggleCrossfade();

// Set fade duration (in seconds)
setCrossfadeDuration(5); // 5-second crossfade

// Direct API access
crossfade.enable();
crossfade.disable();
crossfade.setDuration(3);
```

---

## 📝 Feature 3: Lyrics Display

Synchronized lyrics display that highlights the current line based on playback position.

### Features:
- Time-synchronized lyrics
- Auto-scrolling to current line
- Smooth animations
- Support for custom lyrics

### Usage:
```javascript
// Toggle lyrics display
toggleLyrics();

// Add custom lyrics for a song
addSongLyrics('song-id-123', [
    { time: 0, text: "First line of lyrics" },
    { time: 5, text: "Second line at 5 seconds" },
    { time: 10, text: "Third line at 10 seconds" }
]);

// Direct API access
lyricsDisplay.loadLyrics(songId);
lyricsDisplay.startSync(audioElement);
lyricsDisplay.stopSync();
```

---

## 🤖 Feature 4: Smart Recommendations

AI-powered song recommendations based on your listening history.

### Features:
- Tracks listening patterns
- Analyzes artist and genre preferences
- Provides personalized recommendations
- Stores up to 50 recent plays

### Usage:
```javascript
// Get recommendations (default 10)
const recommendations = getRecommendations(10);

// Show recommendations in UI
showRecommendations();

// Clear listening history
clearListeningHistory();

// Direct API access
smartRecommendations.getRecommendations(musicLibrary, 10);
smartRecommendations.trackPlay(song);
smartRecommendations.loadHistory();
smartRecommendations.clearHistory();
```

---

## 🎤 Feature 5: Voice Commands

Control playback using voice commands (requires browser support).

### Supported Commands:
- "play" - Start playback
- "pause" - Pause playback
- "next" / "skip" - Next track
- "previous" - Previous track
- "shuffle" - Toggle shuffle mode
- "repeat" - Toggle repeat mode
- "stop" - Stop playback

### Usage:
```javascript
// Toggle voice control on/off
toggleVoiceControl();

// Direct API access
voiceCommands.startListening();
voiceCommands.stopListening();

// Register custom commands
voiceCommands.registerCommand('volume up', () => {
    // Custom volume up logic
});
```

### Browser Compatibility:
- Chrome/Edge: ✅ Full support
- Firefox: ⚠️ Limited support
- Safari: ⚠️ Limited support

---

## ⏰ Feature 6: Sleep Timer

Automatically stop playback after a specified duration.

### Features:
- Configurable duration
- Real-time countdown display
- Add time to running timer
- Auto-pause when timer expires

### Usage:
```javascript
// Start sleep timer (in minutes)
startSleepTimer(30); // Stop playback after 30 minutes

// Add more time to running timer
addSleepTime(15); // Add 15 more minutes

// Stop/cancel timer
stopSleepTimer();

// Direct API access
sleepTimer.start(minutes, onEnd, onUpdate);
sleepTimer.stop();
sleepTimer.addTime(minutes);
sleepTimer.getRemainingTime();
```

---

## 🎛️ Feature 7: Audio Effects (Equalizer)

10-band equalizer with multiple presets for different music styles.

### Available Presets:
- **Flat**: No modifications (default)
- **Bass Boost**: Enhanced low frequencies
- **Treble Boost**: Enhanced high frequencies
- **Vocal**: Optimized for vocals
- **Rock**: Rock music preset
- **Pop**: Pop music preset
- **Jazz**: Jazz music preset
- **Classical**: Classical music preset
- **Electronic**: Electronic/EDM preset
- **Acoustic**: Acoustic music preset

### Usage:
```javascript
// Apply preset
setEqualizerPreset('bassBoost');

// Get list of available presets
const presets = getEqualizerPresets();

// Reset to flat
resetEqualizer();

// Direct API access
audioEffects.applyPreset('rock');
audioEffects.setGain(bandIndex, gainValue); // -12 to +12 dB
audioEffects.setMasterVolume(0.8); // 0 to 1
audioEffects.reset();
```

### Frequency Bands:
1. 60 Hz (Sub-bass)
2. 170 Hz (Bass)
3. 310 Hz (Low midrange)
4. 600 Hz (Midrange)
5. 1 kHz (Midrange)
6. 3 kHz (Upper midrange)
7. 6 kHz (Presence)
8. 12 kHz (Brilliance)
9. 14 kHz (High brilliance)
10. 16 kHz (Air)

---

## 🚀 Quick Start Guide

### Initial Setup

All features are automatically initialized when the page loads. To see available features:

```javascript
// Show feature info in console
advancedFeatures.showFeaturesInfo();
```

### Example Usage Flow

```javascript
// 1. Start playing a song (normal player operation)
musicPlayer.ui.playSong(someSong);

// 2. Enable visualizer
toggleVisualizer();

// 3. Apply equalizer preset
setEqualizerPreset('bassBoost');

// 4. Enable crossfade for smooth transitions
toggleCrossfade();

// 5. Set a sleep timer for 1 hour
startSleepTimer(60);

// 6. View recommendations
showRecommendations();

// 7. Enable voice control
toggleVoiceControl();
// Say "next" to skip to next song
```

---

## 🔧 Technical Details

### Dependencies
- Web Audio API (for visualizer and equalizer)
- Speech Recognition API (for voice commands)
- Local Storage API (for smart recommendations)

### Browser Support
- Chrome/Edge: Full support for all features
- Firefox: Most features supported (limited voice commands)
- Safari: Most features supported (limited voice commands)

### Performance
- Audio Visualizer: Uses requestAnimationFrame for smooth 60fps rendering
- Smart Recommendations: Lightweight scoring algorithm
- All features are optimized for minimal performance impact

---

## 🐛 Troubleshooting

### Visualizer not showing
- Ensure audio is playing
- Check that container element exists
- Verify Web Audio API is supported

### Voice commands not working
- Check browser compatibility
- Ensure microphone permissions are granted
- Speak clearly and use supported commands

### Equalizer not affecting sound
- Ensure audio is initialized
- Check that audio is playing through the Web Audio API chain
- Try a different preset

---

## 📝 Notes

- All features are optional and can be used independently
- Features are designed to work seamlessly with existing player functionality
- Smart recommendations improve over time as you listen to more music
- Voice commands require microphone permission from the browser

---

## 🎉 Credits

Developed by William Cole Hanson
Copyright 2025

For support: Chevrolay@Outlook.com
