/**
 * Advanced Features Module
 * 
 * This module contains 7 NEW advanced features for the music player:
 * 1. Audio Visualizer - Real-time frequency visualization
 * 2. Crossfade - Smooth song transitions
 * 3. Lyrics Display - Synchronized lyrics
 * 4. Smart Recommendations - AI-based suggestions
 * 5. Voice Commands - Voice control
 * 6. Sleep Timer - Auto-stop playback
 * 7. Audio Effects - Equalizer with presets
 * 
 * Copyright 2025
 * William Cole Hanson
 */

import { NOTIFICATION_TYPES } from "./map.js";

// ========================================
// Feature 1: Audio Visualizer
// ========================================
export const audioVisualizer = {
  canvas: null,
  canvasCtx: null,
  analyser: null,
  audioContext: null,
  sourceNode: null,
  dataArray: null,
  bufferLength: null,
  animationId: null,
  isEnabled: false,
  visualizationMode: 'bars', // 'bars', 'wave', 'circular'
  colors: {
    bars: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'],
    wave: '#06b6d4',
    circular: '#ec4899'
  },

  initialize: function(audioElement) {
    if (!audioElement || this.isInitialized) return;

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      
      // Connect audio element to analyser
      this.sourceNode = this.audioContext.createMediaElementSource(audioElement);
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);

      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);
      this.isInitialized = true;

      console.log('Audio Visualizer initialized');
    } catch (error) {
      console.error('Failed to initialize audio visualizer:', error);
    }
  },

  createCanvas: function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    this.canvas = document.createElement('canvas');
    this.canvas.id = 'audio-visualizer-canvas';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '120px';
    this.canvas.style.borderRadius = '8px';
    this.canvas.style.background = 'rgba(0, 0, 0, 0.3)';
    
    container.innerHTML = '';
    container.appendChild(this.canvas);
    
    this.canvasCtx = this.canvas.getContext('2d');
    this.resizeCanvas();
    
    window.addEventListener('resize', () => this.resizeCanvas());
  },

  resizeCanvas: function() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.canvasCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
  },

  start: function(containerId = 'visualizer-container') {
    if (!this.isInitialized) return;
    
    if (!this.canvas) {
      this.createCanvas(containerId);
    }

    this.isEnabled = true;
    this.draw();
  },

  stop: function() {
    this.isEnabled = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.canvasCtx && this.canvas) {
      this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  },

  draw: function() {
    if (!this.isEnabled || !this.canvasCtx) return;

    this.animationId = requestAnimationFrame(() => this.draw());
    this.analyser.getByteFrequencyData(this.dataArray);

    const width = this.canvas.width / window.devicePixelRatio;
    const height = this.canvas.height / window.devicePixelRatio;

    this.canvasCtx.clearRect(0, 0, width, height);

    switch (this.visualizationMode) {
      case 'bars':
        this.drawBars(width, height);
        break;
      case 'wave':
        this.drawWave(width, height);
        break;
      case 'circular':
        this.drawCircular(width, height);
        break;
    }
  },

  drawBars: function(width, height) {
    const barWidth = (width / this.bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < this.bufferLength; i++) {
      const barHeight = (this.dataArray[i] / 255) * height * 0.8;
      const colorIndex = Math.floor(i / (this.bufferLength / this.colors.bars.length));
      this.canvasCtx.fillStyle = this.colors.bars[colorIndex % this.colors.bars.length];
      this.canvasCtx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
      x += barWidth;
    }
  },

  drawWave: function(width, height) {
    this.analyser.getByteTimeDomainData(this.dataArray);
    
    this.canvasCtx.lineWidth = 2;
    this.canvasCtx.strokeStyle = this.colors.wave;
    this.canvasCtx.beginPath();

    const sliceWidth = width / this.bufferLength;
    let x = 0;

    for (let i = 0; i < this.bufferLength; i++) {
      const v = this.dataArray[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        this.canvasCtx.moveTo(x, y);
      } else {
        this.canvasCtx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    this.canvasCtx.stroke();
  },

  drawCircular: function(width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    for (let i = 0; i < this.bufferLength; i++) {
      const angle = (i / this.bufferLength) * Math.PI * 2;
      const barHeight = (this.dataArray[i] / 255) * radius;
      
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barHeight);
      const y2 = centerY + Math.sin(angle) * (radius + barHeight);

      this.canvasCtx.strokeStyle = this.colors.circular;
      this.canvasCtx.lineWidth = 2;
      this.canvasCtx.beginPath();
      this.canvasCtx.moveTo(x1, y1);
      this.canvasCtx.lineTo(x2, y2);
      this.canvasCtx.stroke();
    }
  },

  setMode: function(mode) {
    if (['bars', 'wave', 'circular'].includes(mode)) {
      this.visualizationMode = mode;
    }
  }
};

// ========================================
// Feature 2: Crossfade
// ========================================
export const crossfade = {
  isEnabled: false,
  duration: 3, // seconds
  fadeOutAudio: null,
  fadeInAudio: null,
  fadeInterval: null,

  enable: function() {
    this.isEnabled = true;
  },

  disable: function() {
    this.isEnabled = false;
  },

  setDuration: function(seconds) {
    this.duration = Math.max(1, Math.min(10, seconds));
  },

  start: function(currentAudio, nextSong, playSongCallback) {
    if (!this.isEnabled || !currentAudio || !nextSong) return;

    const steps = 30;
    const stepDuration = (this.duration * 1000) / steps;
    let currentStep = 0;
    const initialVolume = currentAudio.volume;

    // Create new audio for next song
    const nextAudio = new Audio();
    nextAudio.src = nextSong.audio;
    nextAudio.volume = 0;

    // Start playing next song
    nextAudio.play().catch(err => console.error('Crossfade play error:', err));

    // Crossfade animation
    this.fadeInterval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      // Fade out current
      currentAudio.volume = initialVolume * (1 - progress);
      
      // Fade in next
      nextAudio.volume = initialVolume * progress;

      if (currentStep >= steps) {
        clearInterval(this.fadeInterval);
        currentAudio.pause();
        currentAudio.currentTime = 0;
        
        // Replace with new audio
        if (playSongCallback) {
          playSongCallback(nextSong, nextAudio);
        }
      }
    }, stepDuration);
  }
};

// ========================================
// Feature 3: Lyrics Display
// ========================================
export const lyricsDisplay = {
  currentLyrics: null,
  container: null,
  syncedLyrics: {},
  isEnabled: false,
  updateInterval: null,

  // Sample lyrics database (in real app, fetch from API)
  lyricsDatabase: {
    // Format: songId: { lines: [{time: seconds, text: "lyric line"}] }
  },

  initialize: function(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      // Create container if it doesn't exist
      this.container = document.createElement('div');
      this.container.id = containerId;
      this.container.className = 'lyrics-container';
      this.container.style.cssText = `
        max-height: 300px;
        overflow-y: auto;
        padding: 1rem;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        margin-top: 1rem;
      `;
    }
  },

  loadLyrics: function(songId) {
    // In real implementation, fetch from API
    this.currentLyrics = this.lyricsDatabase[songId] || this.generatePlaceholderLyrics(songId);
    this.render();
  },

  generatePlaceholderLyrics: function(songId) {
    return {
      lines: [
        { time: 0, text: "♪ Lyrics not available ♪" },
        { time: 5, text: "Enjoy the music!" },
        { time: 10, text: "🎵 🎶 🎵" }
      ]
    };
  },

  render: function() {
    if (!this.container || !this.currentLyrics) return;

    this.container.innerHTML = this.currentLyrics.lines.map((line, index) => 
      `<div class="lyric-line" data-time="${line.time}" data-index="${index}" style="
        padding: 0.5rem;
        margin: 0.25rem 0;
        transition: all 0.3s;
        opacity: 0.5;
        text-align: center;
      ">${line.text}</div>`
    ).join('');
  },

  syncWithAudio: function(currentTime) {
    if (!this.currentLyrics || !this.container) return;

    const lines = this.container.querySelectorAll('.lyric-line');
    let activeLine = null;

    // Find active line
    for (let i = this.currentLyrics.lines.length - 1; i >= 0; i--) {
      if (currentTime >= this.currentLyrics.lines[i].time) {
        activeLine = i;
        break;
      }
    }

    // Update styles
    lines.forEach((line, index) => {
      if (index === activeLine) {
        line.style.opacity = '1';
        line.style.transform = 'scale(1.1)';
        line.style.color = '#3b82f6';
        line.style.fontWeight = 'bold';
        line.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        line.style.opacity = '0.5';
        line.style.transform = 'scale(1)';
        line.style.color = '';
        line.style.fontWeight = 'normal';
      }
    });
  },

  startSync: function(audioElement) {
    if (!audioElement) return;
    
    this.stopSync();
    this.updateInterval = setInterval(() => {
      this.syncWithAudio(audioElement.currentTime);
    }, 100);
  },

  stopSync: function() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  },

  addLyrics: function(songId, lines) {
    this.lyricsDatabase[songId] = { lines };
  }
};

// ========================================
// Feature 4: Smart Recommendations
// ========================================
export const smartRecommendations = {
  listeningHistory: [],
  maxHistorySize: 50,
  recommendations: [],

  trackPlay: function(song) {
    if (!song) return;

    const historyItem = {
      songId: song.id,
      timestamp: Date.now(),
      artist: song.artist,
      album: song.album,
      genre: song.genre || 'unknown'
    };

    this.listeningHistory.unshift(historyItem);
    
    // Keep history size manageable
    if (this.listeningHistory.length > this.maxHistorySize) {
      this.listeningHistory.pop();
    }

    // Save to localStorage
    this.saveHistory();
  },

  saveHistory: function() {
    try {
      localStorage.setItem('listening-history', JSON.stringify(this.listeningHistory));
    } catch (e) {
      console.error('Failed to save listening history:', e);
    }
  },

  loadHistory: function() {
    try {
      const data = localStorage.getItem('listening-history');
      if (data) {
        this.listeningHistory = JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load listening history:', e);
    }
  },

  getRecommendations: function(musicLibrary, count = 10) {
    if (!musicLibrary || !Array.isArray(musicLibrary)) return [];

    // Analyze listening patterns
    const artistFrequency = {};
    const genreFrequency = {};

    this.listeningHistory.forEach(item => {
      artistFrequency[item.artist] = (artistFrequency[item.artist] || 0) + 1;
      genreFrequency[item.genre] = (genreFrequency[item.genre] || 0) + 1;
    });

    // Score songs
    const scoredSongs = [];
    const recentlyPlayedIds = new Set(this.listeningHistory.slice(0, 10).map(h => h.songId));

    musicLibrary.forEach(artist => {
      if (artist.albums) {
        artist.albums.forEach(album => {
          if (album.songs) {
            album.songs.forEach(song => {
              // Skip recently played
              if (recentlyPlayedIds.has(song.id)) return;

              let score = 0;
              
              // Artist score
              score += (artistFrequency[artist.artist] || 0) * 3;
              
              // Genre score
              score += (genreFrequency[song.genre] || 0) * 2;
              
              // Similar artists bonus
              if (this.listeningHistory.length > 0) {
                const topArtist = this.listeningHistory[0].artist;
                if (artist.similar && artist.similar.includes(topArtist)) {
                  score += 5;
                }
              }

              // Random factor for variety
              score += Math.random() * 2;

              scoredSongs.push({
                song: { ...song, artist: artist.artist, album: album.album },
                score
              });
            });
          }
        });
      }
    });

    // Sort by score and return top recommendations
    this.recommendations = scoredSongs
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(item => item.song);

    return this.recommendations;
  },

  clearHistory: function() {
    this.listeningHistory = [];
    this.saveHistory();
  }
};

// ========================================
// Feature 5: Voice Commands
// ========================================
export const voiceCommands = {
  recognition: null,
  isListening: false,
  isSupported: false,
  commands: {},

  initialize: function() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported');
      this.isSupported = false;
      return false;
    }

    this.isSupported = true;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      console.log('Voice command:', transcript);
      this.processCommand(transcript);
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    return true;
  },

  registerCommand: function(phrase, callback) {
    this.commands[phrase.toLowerCase()] = callback;
  },

  processCommand: function(transcript) {
    // Check for exact matches
    if (this.commands[transcript]) {
      this.commands[transcript]();
      return;
    }

    // Check for partial matches
    for (const [phrase, callback] of Object.entries(this.commands)) {
      if (transcript.includes(phrase)) {
        callback();
        return;
      }
    }

    console.log('Command not recognized:', transcript);
  },

  startListening: function() {
    if (!this.isSupported || this.isListening) return;
    
    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
    }
  },

  stopListening: function() {
    if (!this.isSupported || !this.isListening) return;
    
    try {
      this.recognition.stop();
      this.isListening = false;
    } catch (error) {
      console.error('Failed to stop voice recognition:', error);
    }
  },

  setupDefaultCommands: function(musicPlayerAPI) {
    if (!musicPlayerAPI) return;

    this.registerCommand('play', () => musicPlayerAPI.play());
    this.registerCommand('pause', () => musicPlayerAPI.pause());
    this.registerCommand('next', () => musicPlayerAPI.next());
    this.registerCommand('previous', () => musicPlayerAPI.previous());
    this.registerCommand('skip', () => musicPlayerAPI.next());
    this.registerCommand('shuffle', () => musicPlayerAPI.toggleShuffle());
    this.registerCommand('repeat', () => musicPlayerAPI.toggleRepeat());
    this.registerCommand('stop', () => musicPlayerAPI.stop());
  }
};

// ========================================
// Feature 6: Sleep Timer
// ========================================
export const sleepTimer = {
  timer: null,
  remainingTime: 0,
  duration: 0,
  isActive: false,
  onTimerEnd: null,
  updateCallback: null,

  start: function(minutes, onEnd, onUpdate) {
    this.stop(); // Clear any existing timer

    this.duration = minutes * 60;
    this.remainingTime = this.duration;
    this.onTimerEnd = onEnd;
    this.updateCallback = onUpdate;
    this.isActive = true;

    this.timer = setInterval(() => {
      this.remainingTime--;

      if (this.updateCallback) {
        this.updateCallback(this.formatTime(this.remainingTime));
      }

      if (this.remainingTime <= 0) {
        this.end();
      }
    }, 1000);
  },

  stop: function() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isActive = false;
    this.remainingTime = 0;
    this.duration = 0;
  },

  end: function() {
    this.stop();
    if (this.onTimerEnd) {
      this.onTimerEnd();
    }
  },

  formatTime: function(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },

  getRemainingTime: function() {
    return this.formatTime(this.remainingTime);
  },

  addTime: function(minutes) {
    if (!this.isActive) return;
    this.remainingTime += minutes * 60;
  }
};

// ========================================
// Feature 7: Audio Effects (Equalizer)
// ========================================
export const audioEffects = {
  audioContext: null,
  sourceNode: null,
  filters: [],
  gainNode: null,
  isInitialized: false,
  currentPreset: 'flat',
  
  presets: {
    flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    bassBoost: [8, 6, 4, 2, 0, 0, 0, 0, 0, 0],
    trebleBoost: [0, 0, 0, 0, 0, 0, 2, 4, 6, 8],
    vocal: [0, -2, -4, -2, 2, 4, 4, 2, 0, 0],
    rock: [6, 4, 2, 0, -2, -2, 0, 2, 4, 6],
    pop: [2, 4, 6, 4, 0, -2, -2, 0, 2, 4],
    jazz: [4, 2, 0, 2, 4, 4, 2, 0, 2, 4],
    classical: [4, 2, 0, 0, 0, 0, -2, -2, -2, -4],
    electronic: [6, 4, 2, 0, -2, 2, 0, 2, 4, 6],
    acoustic: [4, 2, 0, 0, 2, 2, 2, 0, 0, 0]
  },

  frequencyBands: [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000],

  initialize: function(audioElement) {
    if (!audioElement || this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.sourceNode = this.audioContext.createMediaElementSource(audioElement);
      this.gainNode = this.audioContext.createGain();

      // Create filters for each frequency band
      this.filters = this.frequencyBands.map((freq, index) => {
        const filter = this.audioContext.createBiquadFilter();
        
        if (index === 0) {
          filter.type = 'lowshelf';
        } else if (index === this.frequencyBands.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
        }
        
        filter.frequency.value = freq;
        filter.Q.value = 1;
        filter.gain.value = 0;
        
        return filter;
      });

      // Connect nodes
      let currentNode = this.sourceNode;
      this.filters.forEach(filter => {
        currentNode.connect(filter);
        currentNode = filter;
      });
      
      currentNode.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);

      this.isInitialized = true;
      console.log('Audio Effects initialized');
    } catch (error) {
      console.error('Failed to initialize audio effects:', error);
    }
  },

  applyPreset: function(presetName) {
    if (!this.isInitialized || !this.presets[presetName]) return;

    const gains = this.presets[presetName];
    this.currentPreset = presetName;

    this.filters.forEach((filter, index) => {
      if (gains[index] !== undefined) {
        filter.gain.value = gains[index];
      }
    });
  },

  setGain: function(bandIndex, gainValue) {
    if (!this.isInitialized || !this.filters[bandIndex]) return;
    
    // Clamp gain between -12 and 12 dB
    const clampedGain = Math.max(-12, Math.min(12, gainValue));
    this.filters[bandIndex].gain.value = clampedGain;
  },

  setMasterVolume: function(volume) {
    if (!this.isInitialized) return;
    
    // Volume should be between 0 and 1
    this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
  },

  reset: function() {
    this.applyPreset('flat');
  },

  getPresets: function() {
    return Object.keys(this.presets);
  }
};

// ========================================
// Export all features
// ========================================
export const features = {
  audioVisualizer,
  crossfade,
  lyricsDisplay,
  smartRecommendations,
  voiceCommands,
  sleepTimer,
  audioEffects,

  // Utility function to initialize all features
  initializeAll: function(audioElement, musicLibrary) {
    console.log('🎵 Initializing Advanced Features...');
    
    // Initialize features that need the audio element
    if (audioElement) {
      audioVisualizer.initialize(audioElement);
      audioEffects.initialize(audioElement);
    }

    // Initialize voice commands
    if (voiceCommands.initialize()) {
      console.log('✓ Voice Commands ready');
    }

    // Load listening history
    smartRecommendations.loadHistory();
    console.log('✓ Smart Recommendations ready');

    console.log('🎉 All features initialized!');
  }
};

export default features;
