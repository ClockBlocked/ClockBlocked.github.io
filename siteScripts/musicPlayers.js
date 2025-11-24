/**
 *  © 2025
 *      Created by:
 *     Wm. Cole Hanson
 * 
 * 
 *  Chevrolay@Outlook.com
 * 
 *     m.me/Chevrolay
 */

// Import statements should be at the top if this is a module
import {
    MUSIC_PLAYER,
    QUERY,
    QUERY_ALL,
    $byId,
    REPEAT_MODES,
    CLASSES,
    STORAGE_KEYS,
    utils,
    appState,
    storage,
    PubSub,
    PLAYER_EVENTS,
    notificationPlayer,
    listRenderer
} from './index.js';

const musicPlayer = {

  mainPlayer: {
    inactivityTimer: null,
    lastInteractionTime: null,
    
    // Music Player Drawer
    open: () => {
      const drawer = QUERY(MUSIC_PLAYER.root);
      if (!drawer) {
        console.warn("Music player drawer not found");
        return;
      }
      if (appState.currentSong) {
        musicPlayer.ui.updateNowPlaying();
      }
      drawer.classList.remove("closing");
      drawer.classList.add("open");
      appState.isPopupVisible = true;
      musicPlayer.mainPlayer.switchTab(MUSIC_PLAYER.tabs.playing);
      musicPlayer.mainPlayer.updateTabContent(MUSIC_PLAYER.tabs.playing);
      document.body.style.overflow = "hidden";
      musicPlayer.mainPlayer.startInactivityTimer();
      musicPlayer.state.collapsibles.init();
    },
    close: () => {
      const drawer = QUERY(MUSIC_PLAYER.root);
      if (!drawer) {
        console.warn("Music player drawer not found");
        return;
      }
      musicPlayer.mainPlayer.stopInactivityTimer();
      drawer.classList.add("closing");
      drawer.classList.remove("open");
      setTimeout(() => {
        drawer.classList.remove("closing");
        appState.isPopupVisible = false;
        document.body.style.overflow = "";
        musicPlayer.mainPlayer.switchTab(MUSIC_PLAYER.tabs.playing);
      }, 550);
    },
    toggle: () => {
      const drawer = QUERY(MUSIC_PLAYER.root);
      if (!drawer) return;
      const isOpen = drawer.classList.contains("open");
      if (isOpen) {
        musicPlayer.mainPlayer.close();
      }
      else {
        musicPlayer.mainPlayer.open();
      }
    },
    
    
    // MP Drawer Tabs ( see musicPlayer.state )
    switchTab: (tabName) => {
      appState.currentTab = tabName;
      QUERY_ALL(".player .dotIndicator").forEach((dot) => {
        dot.classList.toggle("active", dot.dataset.tab === tabName);
      });
      QUERY_ALL(".player .panel").forEach((content) => {
        content.classList.toggle("active", content.dataset.tab === tabName);
      });
      musicPlayer.mainPlayer.updateTabContent(tabName);
      musicPlayer.mainPlayer.resetInactivityTimer();
      musicPlayer.state.handleTabChange(tabName);
    },
    
    // Brings user back to 'Now Playing' Tab (state)
    startInactivityTimer: () => {
      musicPlayer.mainPlayer.stopInactivityTimer();
      musicPlayer.mainPlayer.lastInteractionTime = Date.now();
      musicPlayer.mainPlayer.inactivityTimer = setTimeout(() => {
        if (appState.currentTab !== MUSIC_PLAYER.tabs.playing) {
          musicPlayer.mainPlayer.switchTab(MUSIC_PLAYER.tabs.playing);
        }
      }, 30000);
    },
    stopInactivityTimer: () => {
      if (musicPlayer.mainPlayer.inactivityTimer) {
        clearTimeout(musicPlayer.mainPlayer.inactivityTimer);
        musicPlayer.mainPlayer.inactivityTimer = null;
      }
    },
    resetInactivityTimer: () => {
      const drawer = QUERY(MUSIC_PLAYER.root);
      if (drawer && drawer.classList.contains("open")) {
        if (appState.currentTab !== MUSIC_PLAYER.tabs.playing) {
          musicPlayer.mainPlayer.startInactivityTimer();
        }
      }
    },
    
    updateTabContent: (tabName) => {
      if (tabName === MUSIC_PLAYER.tabs.recent) musicPlayer.mainPlayer.updateRecentTab();
      else if (tabName === MUSIC_PLAYER.tabs.queue) musicPlayer.mainPlayer.updateQueueTab();
    },
    updateQueueTab: () => {
      const queueList = QUERY(MUSIC_PLAYER.queueList);
      const queueCount = QUERY(MUSIC_PLAYER.queueCount);
      listRenderer.renderList(queueList, appState.queue.items, {
        source: "queue",
        type: "song",
        showCountEl: queueCount,
        emptyText: "Queue is empty",
        subtext: "Add songs to your queue",
        onPlay: (_, index) => appState.queue.playAt(index),
        onRemove: (_, index) => {
          appState.queue.remove(index);
          musicPlayer.mainPlayer.updateQueueTab();
          ui.updateCounts?.();
        },
      });
    },
    updateRecentTab: () => {
      const recentList = QUERY(MUSIC_PLAYER.recentList);
      const recentCount = QUERY(MUSIC_PLAYER.recentCount);
      listRenderer.renderList(recentList, appState.recentlyPlayed.slice(0, 20), {
        source: "recent",
        type: "song",
        showCountEl: recentCount,
        emptyText: "No recently played songs",
        subtext: "Start playing music to see them here",
        onPlay: (song) => musicPlayer.ui.playSong(song),
        onQueue: (song) => appState.queue.add(song),
      });
    },
    
    
    // Interactions & Setup
    init: () => {
      const closeBtn = QUERY(MUSIC_PLAYER.close);
      if (closeBtn) {
        closeBtn.addEventListener("click", () => musicPlayer.mainPlayer.close());
      }
      QUERY_ALL(`${MUSIC_PLAYER.root} .tab`).forEach((tab) => {
        tab.addEventListener("click", () => {
          const tabName = tab.dataset.tab;
          if (tabName) musicPlayer.mainPlayer.switchTab(tabName);
        });
      });
      const queueBtn = QUERY(MUSIC_PLAYER.queueBtn);
      if (queueBtn) {
        queueBtn.addEventListener("click", () => musicPlayer.mainPlayer.switchTab(MUSIC_PLAYER.tabs.queue));
      }
      musicPlayer.mainPlayer.preventHorizontalScroll();
      musicPlayer.mainPlayer.initDrawerDrag();
      const favoriteBtn = QUERY(MUSIC_PLAYER.favoriteBtn);
      if (favoriteBtn) {
        favoriteBtn.addEventListener("click", () => {
          favoriteBtn.classList.toggle("favorited");
        });
      }
      const scrollEl = QUERY(`${MUSIC_PLAYER.root} .scrollableContent`);
      const coverEl = QUERY(MUSIC_PLAYER.albumArtwork);
      const compactHeader = document.getElementById("compactHeader");
      const compactCover = document.getElementById("compactCover");
      const compactTitle = document.getElementById("compactTitle");
      const compactArtist = document.getElementById("compactArtist");
      const contentCard = QUERY(`${MUSIC_PLAYER.root} .contentCard`);
      let coverRect = null;
      let targetLeft = 16;
      let targetTop = 12;
      let targetSize = 56;

      function recalc() {
        if (!coverEl) return;
        coverRect = coverEl.getBoundingClientRect();
      }

      function onScroll() {
        if (!scrollEl || !coverEl || !compactHeader) return;
        const s = scrollEl.scrollTop;
        const start = 20;
        const end = 180;
        let t = (s - start) / (end - start);
        t = Math.max(0, Math.min(1, t));
        if (!coverRect) recalc();
        const cRect = coverRect;
        const parentRect = QUERY(`${MUSIC_PLAYER.root} .inner`).getBoundingClientRect();
        const initLeft = cRect.left - parentRect.left;
        const initTop = cRect.top - parentRect.top;
        const deltaX = targetLeft - initLeft;
        const deltaY = targetTop - initTop;
        const scaleTarget = targetSize / cRect.width;
        const scale = 1 - (1 - scaleTarget) * t;
        const translateX = deltaX * t;
        const translateY = deltaY * t - s * t * 0.06;
        coverEl.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        compactHeader.style.opacity = `${t}`;
        compactHeader.style.pointerEvents = t > 0.5 ? "auto" : "none";
        if (t > 0.99) {
          contentCard.classList.add("collapsed");
        }
        else {
          contentCard.classList.remove("collapsed");
        }
      }
      if (scrollEl) {
        scrollEl.addEventListener("scroll", onScroll, {
          passive: true
        });
        window.addEventListener("resize", () => {
          recalc();
          onScroll();
        });
        $byId("music-player-cover")?.addEventListener("load", () => {
          recalc();
          onScroll();
        });
        recalc();
        onScroll();
      }
      const compactClickArea = document.getElementById("compactHeader");
      if (compactClickArea) {
        compactClickArea.addEventListener("click", () => {
          QUERY(`${MUSIC_PLAYER.root} .scroller`)?.scrollTo({
            top: 0,
            behavior: "smooth"
          });
        });
      }
      musicPlayer.state.init();
    },
    preventHorizontalScroll: () => {
      const scroller = QUERY(MUSIC_PLAYER.scroller);
      if (!scroller) return;
      let startX = 0;
      let scrollLeft = 0;
      scroller.addEventListener("touchstart", (e) => {
        startX = e.touches[0].pageX - scroller.offsetLeft;
        scrollLeft = scroller.scrollLeft;
      });
      scroller.addEventListener("touchmove", (e) => {
        if (!startX) return;
        const x = e.touches[0].pageX - scroller.offsetLeft;
        const walk = (x - startX) * 2;
        if (Math.abs(walk) > 5) {
          e.preventDefault();
          scroller.scrollLeft = scrollLeft;
        }
      });
      scroller.addEventListener("touchend", () => {
        startX = 0;
        scrollLeft = 0;
      });
      scroller.addEventListener("wheel", (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          e.preventDefault();
        }
      });
    },
    initDrawerDrag: () => {
      const drawer = QUERY(MUSIC_PLAYER.root);
      if (!drawer) return;
      const handle = drawer.querySelector(".dragHandle");
      if (!handle) return;
      let dragging = false;
      let startY = 0;
      let lastTranslate = 0;
      const onPointerDown = (e) => {
        dragging = true;
        startY = e.clientY ?? (e.touches && e.touches[0].clientY) ?? 0;
        drawer.style.transition = "none";
        window.addEventListener("pointermove", onPointerMove, {
          passive: false
        });
        window.addEventListener("pointerup", onPointerUp, {
          once: true
        });
        window.addEventListener("touchmove", onPointerMove, {
          passive: false
        });
        window.addEventListener("touchend", onPointerUp, {
          once: true
        });
      };
      const onPointerMove = (e) => {
        if (!dragging) return;
        const y = e.clientY ?? (e.touches && e.touches[0].clientY) ?? 0;
        const delta = Math.max(0, y - startY);
        lastTranslate = delta;
        drawer.style.transform = `translateY(${delta}px)`;
        drawer.style.opacity = `${Math.max(0, 1 - delta / 400)}`;
        e.preventDefault();
      };
      const onPointerUp = () => {
        dragging = false;
        drawer.style.transition = "";
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("touchmove", onPointerMove);
        if (lastTranslate > 120) {
          musicPlayer.mainPlayer.close();
        }
        else {
          drawer.style.transform = "";
          drawer.style.opacity = "";
        }
        lastTranslate = 0;
      };
      handle.addEventListener("pointerdown", onPointerDown);
      handle.addEventListener("touchstart", onPointerDown, {
        passive: false
      });
    },
    initialize: () => {
      window.addEventListener("playerstatechange", (event) => {
        if (event.detail.song) {
          musicPlayer.ui.updateNowPlaying();
          musicPlayer.ui.updateNavbar();
        }
      });
    },
  },
  
  
  playback: {
    
    // Status & Metadata of CURRENT song
    dispatchPlayerStateChange: () => {
      const detail = {
        song: appState.currentSong,
        artist: appState.currentArtist,
        album: appState.currentAlbum,
        isPlaying: appState.isPlaying,
        duration: appState.duration,
        currentTime: appState.audio?.currentTime ?? 0,
        totalTime: appState.audio?.duration ?? 0,
      };
      window.dispatchEvent(new CustomEvent("playerstatechange", {
        detail
      }));
    },
    
    // Playback Controls
    togglePlayPause: () => {
      if (!appState.audio) return;
      if (appState.isPlaying) {
        musicPlayer.playback.pause();
      }
      else {
        musicPlayer.playback.play();
      }
    },
    
    play: () => {
      if (!appState.currentSong || !appState.audio) return;
      appState.audio.play().catch((err) => {
        console.error("Playback error:", err);
      });
    },
    pause: () => {
      if (!appState.audio) return;
      appState.audio.pause();
    },
    
    next: () => {
      const nextSong = appState.queue.getNext();
      if (nextSong) {
        musicPlayer.ui.playSong(nextSong);
        return;
      }
      const nextInAlbum = musicPlayer.ui.getNextInAlbum();
      if (nextInAlbum) {
        musicPlayer.ui.playSong(nextInAlbum);
      }
      else {
        if (appState.currentSong) {
          musicPlayer.ui.addToRecentlyPlayed(appState.currentSong);
        }
      }
    },
    previous: () => {
      if (appState.audio && appState.audio.currentTime > 3) {
        appState.audio.currentTime = 0;
        return;
      }
      if (appState.currentSong) {
        musicPlayer.ui.addToRecentlyPlayed(appState.currentSong);
      }
      if (appState.recentlyPlayed.length > 0) {
        const prevSong = appState.recentlyPlayed.shift();
        musicPlayer.ui.playSong(prevSong);
        return;
      }
      const prevInAlbum = musicPlayer.ui.getPreviousInAlbum();
      if (prevInAlbum) {
        musicPlayer.ui.playSong(prevInAlbum);
      }
    },
    
    seekTo: (time) => {
      if (!appState.audio || isNaN(time) || time < 0) return;
      if (!isFinite(time)) return;
      const safeTime = Math.max(0, Math.min(appState.duration || 0, time));
      appState.audio.currentTime = safeTime;
      musicPlayer.ui.updateProgress();
      if (window.notificationPlayer && notificationPlayer.positionState) {
        notificationPlayer.positionState.update();
      }
    },
    skip: (seconds) => {
      if (!appState.audio) return;
      const newTime = appState.audio.currentTime + seconds;
      musicPlayer.playback.seekTo(newTime);
    },
    
    shuffle: {
      toggle: () => {
        appState.shuffleMode = !appState.shuffleMode;
        if (window.ui && ui.updateShuffleButton) {
          ui.updateShuffleButton();
        }
        if (window.notifications) {
          notifications.notify({
            message: `Shuffle ${appState.shuffleMode ? "enabled" : "disabled"}`
          });
        }
      },
      all: () => {
        if (!window.music || window.music.length === 0) {
          if (window.notifications) {
            notifications.notify({
              type: window.NOTIFICATION_TYPES?.WARNING,
              message: "No music library found"
            });
          }
          return;
        }
        const allSongs = [];
        window.music.forEach((artist) => {
          artist.albums.forEach((album) => {
            album.songs.forEach((song) => {
              allSongs.push({
                ...song,
                artist: artist.artist,
                album: album.album,
                cover: utils.getAlbumImageUrl(album.album),
              });
            });
          });
        });
        if (allSongs.length === 0) {
          if (window.notifications) {
            notifications.notify({
              type: window.NOTIFICATION_TYPES?.WARNING,
              message: "No songs found"
            });
          }
          return;
        }
        for (let i = allSongs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allSongs[i], allSongs[j]] = [allSongs[j], allSongs[i]];
        }
        appState.queue.clear();
        allSongs.slice(1).forEach((song) => appState.queue.add(song));
        musicPlayer.ui.playSong(allSongs[0]);
        appState.shuffleMode = true;
        if (window.ui && ui.updateShuffleButton) {
          ui.updateShuffleButton();
        }
        if (window.notifications) {
          notifications.notify({
            message: "Playing all songs shuffled"
          });
        }
      },
    },
    repeat: {
      toggle: () => {
        if (appState.repeatMode === window.REPEAT_MODES?.OFF) {
          appState.repeatMode = window.REPEAT_MODES?.ALL;
        }
        else if (appState.repeatMode === window.REPEAT_MODES?.ALL) {
          appState.repeatMode = window.REPEAT_MODES?.ONE;
        }
        else {
          appState.repeatMode = window.REPEAT_MODES?.OFF;
        }
        if (window.ui && ui.updateRepeatButton) {
          ui.updateRepeatButton();
        }
        const modeText = appState.repeatMode === window.REPEAT_MODES?.OFF ? "disabled" : appState.repeatMode === window.REPEAT_MODES?.ALL ? "all songs" : "current song";
        if (window.notifications) {
          notifications.notify({
            message: `Repeat ${modeText}`
          });
        }
      },
    },
  },
  
  
  ui: {
    isScrubbing: false,
    wasPlayingBeforeScrub: false,
    rafId: null,
    
    
    initialize: () => {
      if (appState.audio) return;
      appState.audio = new Audio();
      musicPlayer.ui.setupSubscriptions();
      const events = {
        timeupdate: musicPlayer.ui.updateProgress,
        ended: musicPlayer.ui.onEnded,
        loadedmetadata: musicPlayer.ui.onMetadataLoaded,
        play: musicPlayer.ui.onPlay,
        pause: musicPlayer.ui.onPause,
        error: musicPlayer.ui.onError,
      };
      Object.entries(events).forEach(([event, handler]) => appState.audio.addEventListener(event, handler));
      musicPlayer.ui.bindSeekBar();
      if (window.notificationPlayer) {
        notificationPlayer.setup();
      }
    },
    setupSubscriptions: () => {
      PubSub.subscribe(PLAYER_EVENTS.PLAYBACK_STATE, (data) => {
        musicPlayer.ui.updatePlayPauseUI(data.isPlaying);
      });
      PubSub.subscribe(PLAYER_EVENTS.CURRENT_SONG, (data) => {
        musicPlayer.ui.updateNowPlayingUI(data.currentSong);
        musicPlayer.ui.updateNavbarUI(data.currentSong);
      });
      PubSub.subscribe(PLAYER_EVENTS.TIME_UPDATE, (data) => {
        musicPlayer.ui.updateProgressUI(data.currentTime, data.duration);
      });
      PubSub.subscribe(PLAYER_EVENTS.SHUFFLE_MODE, (data) => {
        musicPlayer.ui.updateShuffleUI(data.shuffleMode);
      });
      PubSub.subscribe(PLAYER_EVENTS.REPEAT_MODE, (data) => {
        musicPlayer.ui.updateRepeatUI(data.repeatMode);
      });
      PubSub.subscribe(PLAYER_EVENTS.RECENTLY_PLAYED_CHANGED, (data) => {
        if (appState.currentTab === MUSIC_PLAYER.tabs.recent) {
          musicPlayer.mainPlayer.updateRecentTab();
        }
        musicPlayer.ui.updateHomeBentoGrid();
      });
      PubSub.subscribe(PLAYER_EVENTS.STATE_CHANGE, (data) => {
        musicPlayer.playback.dispatchPlayerStateChange();
      });
    },
    
    // Load metadata
    playSong: async (songData) => {
      if (!songData) return;
      musicPlayer.ui.initialize();
      if (window.ui && ui.setLoadingState) {
        ui.setLoadingState(true);
      }
      if (appState.currentSong && appState.currentSong.id !== songData.id) {
        musicPlayer.ui.addToRecentlyPlayed(appState.currentSong);
      }
      appState.setCurrentSong(songData);
      musicPlayer.ui.updateNavbar();
      musicPlayer.ui.updateNowPlaying();
      if (window.ui) {
        if (ui.updateCounts) ui.updateCounts();
      }
      const success = await musicPlayer.ui.loadAudioFile(songData);
      if (success) {
        if (window.notificationPlayer && notificationPlayer.metadata) {
          notificationPlayer.metadata.update(songData);
        }
        if (window.notificationPlayer && notificationPlayer.events) {
          notificationPlayer.events.bind();
        }
        setTimeout(() => {
          if (window.clickables && clickables.musicPlayer) {
            clickables.musicPlayer();
          }
          musicPlayer.ui.bindSeekBar();
        }, 100);
        musicPlayer.playback.dispatchPlayerStateChange();
      }
      else {
        musicPlayer.ui.addToRecentlyPlayed(songData);
        appState.setPlayingState(false);
        if (window.ui && ui.updatePlayPauseButtons) {
          ui.updatePlayPauseButtons();
        }
        if (window.notificationPlayer && notificationPlayer.playbackState) {
          notificationPlayer.playbackState.onPause();
        }
        musicPlayer.playback.dispatchPlayerStateChange();
      }
      if (window.ui && ui.setLoadingState) {
        ui.setLoadingState(false);
      }
    },
    loadAudioFile: async (songData) => {
      if (!songData || !songData.id) return false;
      const songFileName = songData.id;
      if (!songFileName) return false;
      for (const format of window.AUDIO_FORMATS) {
        try {
          const audioUrl = `https://pub-54216af4fb1549ff95a6cb5f8d63fe2d.r2.dev/${songFileName}.${format}`;
          appState.audio.src = audioUrl;
          appState.audio.preload = 'auto';
          await new Promise((resolve, reject) => {
            const loadHandler = () => {
              appState.audio.removeEventListener('canplaythrough', loadHandler);
              appState.audio.removeEventListener('error', errorHandler);
              resolve();
            };
            const errorHandler = (e) => {
              appState.audio.removeEventListener('canplaythrough', loadHandler);
              appState.audio.removeEventListener('error', errorHandler);
              reject(e);
            };
            appState.audio.addEventListener('canplaythrough', loadHandler, {
              once: true
            });
            appState.audio.addEventListener('error', errorHandler, {
              once: true
            });
            if (appState.audio.readyState >= 3) {
              loadHandler();
            }
          });
          await appState.audio.play();
          return true;
        }
        catch (error) {
          continue;
        }
      }
      return false;
    },
    onMetadataLoaded() {
      const audio = appState.audio;
      if (!audio) return;
      appState.duration = audio.duration;
      const totalTimeElement = QUERY(MUSIC_PLAYER.totalTime);
      if (totalTimeElement) {
        totalTimeElement.textContent = utils.formatTime(audio.duration);
      }
      musicPlayer.ui.updateProgress();
    },
    updateBufferDisplay: () => {
      const buffer = QUERY(MUSIC_PLAYER.progressBuffer);
      if (!buffer || !appState.audio) return;
      if (!appState.audio.buffered || appState.audio.buffered.length === 0) {
        buffer.style.width = "0%";
        return;
      }
      const duration = appState.audio.duration || 0;
      if (duration === 0) {
        buffer.style.width = "0%";
        return;
      }
      let bufferedEnd = 0;
      for (let i = 0; i < appState.audio.buffered.length; i++) {
        const end = appState.audio.buffered.end(i);
        if (end > bufferedEnd) bufferedEnd = end;
      }
      const bufferProgress = Math.min(1, bufferedEnd / duration);
      buffer.style.width = (bufferProgress * 100).toFixed(2) + "%";
    },
    
    // Progress Slider (seeking)
    handleProgressBarKeyDown: (e) => {
      const audio = appState.audio;
      if (!audio || !audio.duration) return;
      const duration = audio.duration;
      let timeChange = 0;
      switch (e.key) {
        case "ArrowRight":
          timeChange = MUSIC_PLAYER.skipTimes.forward;
          break;
        case "ArrowLeft":
          timeChange = MUSIC_PLAYER.skipTimes.rewind;
          break;
        case "PageUp":
          timeChange = 10;
          break;
        case "PageDown":
          timeChange = -10;
          break;
        case "Home":
          audio.currentTime = 0;
          if (window.notificationPlayer && notificationPlayer.positionState) {
            notificationPlayer.positionState.update();
          }
          e.preventDefault();
          return;
        case "End":
          audio.currentTime = duration;
          if (window.notificationPlayer && notificationPlayer.positionState) {
            notificationPlayer.positionState.update();
          }
          e.preventDefault();
          return;
        default:
          return;
      }
      if (timeChange !== 0) {
        const newTime = Math.max(0, Math.min(duration, audio.currentTime + timeChange));
        audio.currentTime = newTime;
        if (window.notificationPlayer && notificationPlayer.positionState) {
          notificationPlayer.positionState.update();
        }
        e.preventDefault();
      }
    },
    bindSeekBar: () => {
      const bar = $byId(IDS.progressBar);
      const thumb = $byId(IDS.progressThumb);
      const ui = musicPlayer.ui;
      if (!bar || !thumb) return;
      const onPointerDown = (e) => {
        e.preventDefault();
        bar.setPointerCapture?.(e.pointerId ?? 1);
        ui.isScrubbing = true;
        ui.wasPlayingBeforeScrub = !!appState.isPlaying;
        if (ui.wasPlayingBeforeScrub) appState.audio.pause();
        ui.seekFromEvent(e, bar);
        bar.classList.add('is-dragging');
        const moveTarget = bar;
        moveTarget.addEventListener('pointermove', onPointerMove, {
          passive: false
        });
        moveTarget.addEventListener('pointerup', onPointerUp, {
          once: true
        });
        window.addEventListener('pointercancel', onPointerUp, {
          once: true
        });
      };
      const onPointerMove = (e) => {
        if (!ui.isScrubbing) return;
        e.preventDefault();
        ui.seekFromEvent(e, bar);
      };
      const onPointerUp = (e) => {
        ui.seekFromEvent(e, bar, true);
        ui.isScrubbing = false;
        bar.classList.remove('is-dragging', 'is-hovering');
        if (ui.wasPlayingBeforeScrub) appState.audio.play();
        bar.releasePointerCapture?.(e.pointerId ?? 1);
        bar.removeEventListener('pointermove', onPointerMove);
      };
      const onEnter = () => bar.classList.add('is-hovering');
      const onLeave = () => {
        if (!ui.isScrubbing) bar.classList.remove('is-hovering');
      };
      bar.addEventListener('pointerdown', onPointerDown, {
        passive: false
      });
      bar.addEventListener('pointerenter', onEnter);
      bar.addEventListener('pointerleave', onLeave);
    },
    seekFromEvent(e, bar, finalize = false) {
      const rect = bar.getBoundingClientRect();
      const x = e.clientX !== undefined ? e.clientX : e.touches && e.touches[0] ? e.touches[0].clientX : 0;
      let pct = ((x - rect.left) / rect.width) * 100;
      if (!isFinite(pct)) pct = 0;
      pct = Math.max(0, Math.min(100, pct));
      const duration = appState.duration || appState.audio?.duration || 0;
      const time = (duration * pct) / 100;
      musicPlayer.ui.setProgressUI(pct, time);
      if (finalize) {
        if (isFinite(time) && appState.audio) {
          appState.audio.currentTime = time;
          if (window.notificationPlayer?.positionState) {
            notificationPlayer.positionState.update();
          }
        }
      }
    },
    
    // Progress Slider Updates
    setProgressUI(percent, currentTime) {
      const fill = QUERY(MUSIC_PLAYER.progressFill);
      const thumb = QUERY(MUSIC_PLAYER.progressThumb);
      const currentTimeElement = QUERY(MUSIC_PLAYER.currentTime);
      const bar = QUERY(MUSIC_PLAYER.progressBar);
      if (fill) {
        fill.style.width = `${percent}%`;
      }
      if (thumb) {
        thumb.style.left = `${percent}%`;
      }
      if (bar) {
        bar.setAttribute('aria-valuenow', Math.round(percent));
      }
      if (currentTimeElement && isFinite(currentTime)) {
        currentTimeElement.textContent = utils.formatTime(currentTime);
      }
    },
    updateProgress() {
      if (musicPlayer.ui.isScrubbing) return;
      const audio = appState.audio;
      if (!audio || !audio.duration) return;
      const currentTime = audio.currentTime;
      const duration = audio.duration;
      const percent = (currentTime / duration) * 100;
      musicPlayer.ui.setProgressUI(percent, currentTime);
      const totalTimeElement = QUERY(MUSIC_PLAYER.totalTime);
      if (totalTimeElement) {
        totalTimeElement.textContent = utils.formatTime(duration);
      }
      if (window.notificationPlayer?.positionState) {
        notificationPlayer.positionState.update();
      }
    },
    updateProgressUI: (currentTime, duration) => {
      if (musicPlayer.ui.isScrubbing) return;
      const percent = duration > 0 ? (currentTime / duration) * 100 : 0;
      musicPlayer.ui.setProgressUI(percent, currentTime);
      const totalTimeElement = QUERY(MUSIC_PLAYER.totalTime);
      if (totalTimeElement) {
        totalTimeElement.textContent = utils.formatTime(duration);
      }
    },
    
    // Playback Events
    onPlay: () => {
      appState.setPlayingState(true);
    },
    onPause: () => {
      appState.setPlayingState(false);
    },
    onError: (error) => {
      console.error("Audio error:", error);
    },
    onEnded: () => {
      if (appState.repeatMode === window.REPEAT_MODES?.ONE) {
        appState.audio.currentTime = 0;
        appState.audio.play();
        return;
      }
      musicPlayer.playback.next();
    },
    
    
    
    // UI Updates
    updateNowPlaying: () => {
      if (!appState.currentSong) return;
      const coverUrl = appState.currentSong.cover || utils.getAlbumImageUrl(appState.currentSong.album);
      const cover = QUERY(MUSIC_PLAYER.albumArtwork);
      if (cover && coverUrl) {
        cover.src = coverUrl;
      }
      const titleEl = QUERY(MUSIC_PLAYER.songName);
      const artistEl = QUERY(MUSIC_PLAYER.artistName);
      const albumEl = QUERY(MUSIC_PLAYER.albumName);
      if (titleEl && appState.currentSong.title) {
        titleEl.textContent = appState.currentSong.title;
      }
      if (artistEl && appState.currentArtist) {
        artistEl.textContent = appState.currentArtist;
      }
      if (albumEl && appState.currentAlbum) {
        albumEl.textContent = appState.currentAlbum;
      }
      const compactCover = document.getElementById("compactCover");
      const compactTitle = document.getElementById("compactTitle");
      const compactArtist = document.getElementById("compactArtist");
      if (compactCover && coverUrl) compactCover.src = coverUrl;
      if (compactTitle && appState.currentSong.title) compactTitle.textContent = appState.currentSong.title;
      if (compactArtist && appState.currentArtist) compactArtist.textContent = appState.currentArtist;
      const playBtn = QUERY(MUSIC_PLAYER.play);
      const drawer = QUERY(MUSIC_PLAYER.root);
      if (playBtn) {
        const playIcon = playBtn.querySelector(".playIcon");
        const pauseIcon = playBtn.querySelector(".pauseIcon");
        if (appState.isPlaying) {
          playIcon?.style.setProperty("display", "none");
          pauseIcon?.style.setProperty("display", "block");
          drawer?.classList.add(MUSIC_PLAYER.classes.playing);
        }
        else {
          playIcon?.style.setProperty("display", "block");
          pauseIcon?.style.setProperty("display", "none");
          drawer?.classList.remove(MUSIC_PLAYER.classes.playing);
        }
      }
      musicPlayer.ui.updateNavbar();
      musicPlayer.state.updateMiniHeaderElements();
    },
    updateNowPlayingUI: (song) => {
      if (!song) return;
      const coverUrl = song.cover || utils.getAlbumImageUrl(song.album);
      const cover = QUERY(MUSIC_PLAYER.albumArtwork);
      if (cover && coverUrl) cover.src = coverUrl;
      const updateText = (selector, text) => {
        const el = QUERY(selector);
        if (el && text) el.textContent = text;
      };
      updateText(MUSIC_PLAYER.songName, song.title);
      updateText(MUSIC_PLAYER.artistName, song.artist);
      updateText(MUSIC_PLAYER.albumName, song.album);
      const compactCover = document.getElementById("compactCover");
      const compactTitle = document.getElementById("compactTitle");
      const compactArtist = document.getElementById("compactArtist");
      if (compactCover && coverUrl) compactCover.src = coverUrl;
      if (compactTitle && song.title) compactTitle.textContent = song.title;
      if (compactArtist && song.artist) compactArtist.textContent = song.artist;
    },
    
    updateNavbar: () => {
      if (!appState.currentSong) return;
      const navbarNowPlaying = QUERY(NAVBAR.nowPlaying);
      const navbarAlbumArt = QUERY(`${NAVBAR.nowPlaying} .albumArtwork img`);
      const navbarSongName = QUERY(`${NAVBAR.nowPlaying} .songName`);
      const navbarArtistName = QUERY(`${NAVBAR.nowPlaying} .artistName`);
      if (!navbarNowPlaying) {
        return;
      }
      navbarNowPlaying.classList.add(CLASSES.hasSong);
      const coverUrl = appState.currentSong.cover || utils.getAlbumImageUrl(appState.currentSong.album);
      if (navbarAlbumArt) {
        navbarAlbumArt.src = coverUrl;
        navbarAlbumArt.style.opacity = "1";
        const svgPlaceholder = QUERY(`${NAVBAR.nowPlaying} .albumArtwork svg`);
        if (svgPlaceholder) {
          svgPlaceholder.style.opacity = "0";
        }
      }
      if (navbarSongName && appState.currentSong.title) {
        navbarSongName.textContent = appState.currentSong.title;
      }
      if (navbarArtistName && appState.currentArtist) {
        navbarArtistName.textContent = appState.currentArtist;
      }
    },
    updateNavbarUI: (song) => {
      if (!song) {
        QUERY(NAVBAR.nowPlaying)?.classList.remove(CLASSES.hasSong);
        return;
      }
      const navbarNowPlaying = QUERY(NAVBAR.nowPlaying);
      const navbarAlbumArt = QUERY(`${NAVBAR.nowPlaying} .albumArtwork img`);
      const navbarSongName = QUERY(`${NAVBAR.nowPlaying} .songName`);
      const navbarArtistName = QUERY(`${NAVBAR.nowPlaying} .artistName`);
      if (!navbarNowPlaying) return;
      navbarNowPlaying.classList.add(CLASSES.hasSong);
      const coverUrl = song.cover || utils.getAlbumImageUrl(song.album);
      if (navbarAlbumArt) {
        navbarAlbumArt.src = coverUrl;
        navbarAlbumArt.style.opacity = "1";
        const svgPlaceholder = QUERY(`${NAVBAR.nowPlaying} .albumArtwork svg`);
        if (svgPlaceholder) svgPlaceholder.style.opacity = "0";
      }
      if (navbarSongName && song.title) navbarSongName.textContent = song.title;
      if (navbarArtistName && song.artist) navbarArtistName.textContent = song.artist;
    },
    
    updatePlayPauseUI(isPlaying) {
      const buttons = document.querySelectorAll(".playPause");
      buttons.forEach(btn => {
        const playIcon = btn.querySelector(".play");
        const pauseIcon = btn.querySelector(".pause");
        if (!playIcon || !pauseIcon) return;
        if (isPlaying) {
          playIcon.classList.remove("active");
          pauseIcon.classList.add("active");
        }
        else {
          playIcon.classList.add("active");
          pauseIcon.classList.remove("active");
        }
      });
      const root = document.querySelector(MUSIC_PLAYER.root);
      if (root && MUSIC_PLAYER.classes && MUSIC_PLAYER.classes.playing) {
        root.classList.toggle(MUSIC_PLAYER.classes.playing, isPlaying);
      }
    },
    
    updateShuffleUI: (shuffleMode) => {
      const shuffleBtn = QUERY(MUSIC_PLAYER.shuffleBtn);
      if (shuffleBtn) {
        shuffleBtn.classList.toggle(CLASSES.active, shuffleMode);
        shuffleBtn.setAttribute("aria-pressed", shuffleMode);
      }
    },
    updateRepeatUI: (repeatMode) => {
      const repeatBtn = QUERY(MUSIC_PLAYER.repeatBtn);
      if (repeatBtn) {
        repeatBtn.classList.toggle(CLASSES.active, repeatMode !== REPEAT_MODES.OFF);
        repeatBtn.setAttribute("aria-pressed", repeatMode !== REPEAT_MODES.OFF);
      }
    },
    
    updateHomeBentoGrid: () => {
      const dynamicContent = $byId(IDS.dynamicContent);
      if (!dynamicContent) return;
      const bentoGrid = dynamicContent.querySelector('.bento-grid');
      if (!bentoGrid) return;
      const recentlyPlayedSection = $byId(IDS.recentlyPlayedSection);
      if (recentlyPlayedSection && appState.recentlyPlayed && appState.recentlyPlayed.length > 0) {
        const recentTracksHtml = render.homeSection.recentlyPlayed(
          appState.recentlyPlayed.slice(0, 5),
          utils
        );
        recentlyPlayedSection.innerHTML = recentTracksHtml;
        musicPlayer.ui.bindHomeBentoEvents(recentlyPlayedSection);
      }
    },
    updateRecentTab: () => {
      const recentList = QUERY(MUSIC_PLAYER.recentList);
      const recentCount = QUERY(MUSIC_PLAYER.recentCount);
      listRenderer.renderList(recentList, appState.recentlyPlayed.slice(0, 20), {
        source: "recent",
        type: "song",
        showCountEl: recentCount,
        emptyText: "No recently played songs",
        subtext: "Start playing music to see them here",
        onPlay: (song) => musicPlayer.ui.playSong(song),
        onQueue: (song) => appState.queue.add(song),
      });
    },
    
    
    // Helpers
    getNextInAlbum: () => {
      if (!appState.currentSong || !window.music) return null;
      const artist = window.music.find((a) => a.artist === appState.currentArtist);
      const album = artist?.albums.find((al) => al.album === appState.currentAlbum);
      if (!album) return null;
      const currentIndex = album.songs.findIndex((s) => s.title === appState.currentSong.title);
      const nextIndex = appState.shuffleMode ? Math.floor(Math.random() * album.songs.length) : (currentIndex + 1) % album.songs.length;
      if (nextIndex !== currentIndex || appState.repeatMode === window.REPEAT_MODES?.ALL) {
        return {
          ...album.songs[nextIndex],
          artist: artist.artist,
          album: album.album,
          cover: utils.getAlbumImageUrl(album.album),
        };
      }
      return null;
    },
    getPreviousInAlbum: () => {
      if (!appState.currentSong || !window.music) return null;
      const artist = window.music.find((a) => a.artist === appState.currentArtist);
      const album = artist?.albums.find((al) => al.album === appState.currentAlbum);
      if (!album) return null;
      const currentIndex = album.songs.findIndex((s) => s.title === appState.currentSong.title);
      const prevIndex = (currentIndex - 1 + album.songs.length) % album.songs.length;
      return {
        ...album.songs[prevIndex],
        artist: artist.artist,
        album: album.album,
        cover: utils.getAlbumImageUrl(album.album),
      };
    },
    
    addToRecentlyPlayed: (song) => {
      if (!song || !song.id) return;
      if (!appState.recentlyPlayed) appState.recentlyPlayed = [];
      appState.recentlyPlayed = appState.recentlyPlayed.filter(s => s.id !== song.id);
      appState.recentlyPlayed.unshift(song);
      if (appState.recentlyPlayed.length > 50) {
        appState.recentlyPlayed = appState.recentlyPlayed.slice(0, 50);
      }
      if (window.storage && window.STORAGE_KEYS) {
        storage.save(STORAGE_KEYS.RECENTLY_PLAYED, appState.recentlyPlayed);
      }
      PubSub.publish(PLAYER_EVENTS.RECENTLY_PLAYED_CHANGED, {
        songs: appState.recentlyPlayed
      });
      musicPlayer.ui.updateRecentTab();
      musicPlayer.ui.updateHomeBentoGrid();
    },
    bindHomeBentoEvents: (container) => {
      if (!container) return;
      container.querySelectorAll('.modern-track-item, .track-play-btn').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const songDataStr = item.closest('[data-song]')?.dataset.song;
          if (songDataStr) {
            try {
              const songData = JSON.parse(songDataStr);
              musicPlayer.ui.playSong(songData);
            }
            catch (error) {
              console.error('Error parsing song data:', error);
            }
          }
        });
      });
      container.querySelectorAll('[data-artist]').forEach(artistEl => {
        artistEl.addEventListener('click', (e) => {
          e.stopPropagation();
          const artistName = artistEl.dataset.artist;
          if (appState.router) {
            appState.router.navigateTo(ROUTES.ARTIST, {
              artist: artistName
            });
          }
        });
      });
      container.querySelectorAll('.track-favorite-btn, .favorite-heart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const songItem = btn.closest('[data-song]');
          if (songItem) {
            const songDataStr = songItem.dataset.song;
            try {
              const songData = JSON.parse(songDataStr);
              appState.favorites.toggle('songs', songData.id);
              btn.classList.toggle('active', appState.favorites.has('songs', songData.id));
            }
            catch (error) {
              console.error('Error toggling favorite:', error);
            }
          }
        });
      });
    },
  },
  
  
  state: {
    currentTab: 0,
    isCollapsed: false,
    isTransitioning: false,
    isDraggingHeader: false,
    dragStartY: 0,
    dragDistance: 0,
    transitionTimeout: null,
    
    // S E T U P
    init() {
      musicPlayer.state.cacheDOMElements();
      musicPlayer.state.injectRequiredHTML();
      musicPlayer.state.setupObservers();
      musicPlayer.state.collapsibles.init();
    },
    cacheDOMElements() {
      this.player = QUERY(MUSIC_PLAYER.root);
      this.header = QUERY('.player .header');
      this.coverArea = QUERY('.player .coverArea');
      this.cover = QUERY('#music-player-cover');
      this.panels = QUERY_ALL('.player .panel');
      this.dotIndicators = QUERY_ALL('.dotIndicator');
    },
    setupObservers() {
      const mutationObserver = new MutationObserver(() => {
        musicPlayer.state.collapsibles.addListItemInteractions();
      });
      this.panels.forEach(panel => {
        mutationObserver.observe(panel, {
          childList: true,
          subtree: true
        });
      });
      musicPlayer.state.collapsibles.addListItemInteractions();
    },
    
    // UI Updates
    injectRequiredHTML() {
      if (!this.coverArea || !this.cover) return;
      // Wrap cover image in container
      if (!this.cover.parentElement.classList.contains('coverImageContainer')) {
        const imageContainer = document.createElement('div');
        imageContainer.className = 'coverImageContainer';
        this.cover.parentNode.insertBefore(imageContainer, this.cover);
        imageContainer.appendChild(this.cover);
      }
      // Add glow effect
      const existingGlow = this.coverArea.querySelector('.coverGlow');
      if (!existingGlow) {
        const glow = document.createElement('div');
        glow.className = 'coverGlow';
        this.coverArea.insertBefore(glow, this.coverArea.firstChild);
      }
      // Wrap lists in containers
      this.panels.forEach(panel => {
        const list = panel.querySelector('.list');
        if (list && !list.parentElement.classList.contains('listContainer')) {
          const listContainer = document.createElement('div');
          listContainer.className = 'listContainer';
          list.parentNode.insertBefore(listContainer, list);
          listContainer.appendChild(list);
        }
      });
      // Create mini header and controls
      musicPlayer.state.updateMiniHeaderElements();
    },
    updateMiniHeaderElements() {
      if (!this.coverArea) return;
      const titleElement = QUERY('#music-player-title');
      const artistElement = QUERY('#music-player-artist');
      let miniHeader = this.coverArea.querySelector('.miniHeader');
      if (!miniHeader) {
        miniHeader = document.createElement('div');
        miniHeader.className = 'miniHeader';
        this.coverArea.appendChild(miniHeader);
      }
      const title = titleElement ? titleElement.textContent : '';
      const artist = artistElement ? artistElement.textContent : '';
      miniHeader.innerHTML = `
    <div class="miniTitle">${musicPlayer.state.escapeHTML(title)}</div>
    <div class="miniArtist">${musicPlayer.state.escapeHTML(artist)}</div>
  `;
      let miniControls = this.coverArea.querySelector('.miniControls');
      if (!miniControls) {
        miniControls = document.createElement('div');
        miniControls.className = 'miniControls';
        this.coverArea.appendChild(miniControls);
      }
      miniControls.innerHTML = `
    <button class="miniControlBtn playPause" onclick="musicPlayer.playback.togglePlayPause()">
      <svg class="play" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none">
        <path d="M5 3l14 9-14 9V3z" />
      </svg>

      <svg class="pause" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none">
        <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
      </svg>
    </button>
  `;
    },
    
    //  Drawer Tabs (states)
    // 'Now Playing',  'Recently Played',  'Up Next Queue'
    handleTabChange(tabName) {
      if (tabName === MUSIC_PLAYER.tabs.playlist || tabName === MUSIC_PLAYER.tabs.queue) {
        if (!this.isCollapsed && !this.isTransitioning) {
          this.collapseHeader();
        }
      }
      else if (tabName === MUSIC_PLAYER.tabs.playing) {
        if (this.isCollapsed && !this.isTransitioning) {
          this.expandHeader();
        }
      }
    },
    updateListHeights: function () {
      const header = this.header;
      const recentList = document.getElementById('music-player-recent-list');
      const queueList = document.getElementById('music-player-queue-list');
      if (!header || !recentList || !queueList) return;
      const isCollapsed = header.classList.contains('collapsed');
      const headerHeight = header.offsetHeight;
      const viewportHeight = window.innerHeight;
      if (isCollapsed) {
        const availableHeight = viewportHeight - headerHeight - 100;
        recentList.style.height = `${availableHeight}px`;
        queueList.style.height = `${availableHeight}px`;
      }
      else {
        recentList.style.height = '500px';
        queueList.style.height = '500px';
      }
    },
    collapseHeader() {
      if (musicPlayer.state.isCollapsed || musicPlayer.state.isTransitioning || !this.header) return;
      musicPlayer.state.isCollapsed = true;
      musicPlayer.state.isTransitioning = true;
      const listContainers = QUERY_ALL('.listContainer');
      requestAnimationFrame(() => {
        this.header.classList.add('is-collapsing');
        requestAnimationFrame(() => {
          this.header.classList.add('collapsed');
          this.header.classList.remove('is-collapsing');
          // ADD expandHeight class to listContainers
          listContainers.forEach(container => {
            container.classList.add('expandHeight');
          });
          this.updateListHeights();
          clearTimeout(musicPlayer.state.transitionTimeout);
          musicPlayer.state.transitionTimeout = setTimeout(() => {
            musicPlayer.state.isTransitioning = false;
          }, 550);
        });
      });
    },
    expandHeader() {
      if (!musicPlayer.state.isCollapsed || musicPlayer.state.isTransitioning || !this.header) return;
      musicPlayer.state.isCollapsed = false;
      musicPlayer.state.isTransitioning = true;
      const listContainers = QUERY_ALL('.listContainer');
      requestAnimationFrame(() => {
        this.header.classList.add('is-collapsing');
        requestAnimationFrame(() => {
          this.header.classList.remove('collapsed');
          this.header.classList.remove('is-collapsing');
          // REMOVE expandHeight class from listContainers
          listContainers.forEach(container => {
            container.classList.remove('expandHeight');
          });
          this.updateListHeights();
          clearTimeout(musicPlayer.state.transitionTimeout);
          musicPlayer.state.transitionTimeout = setTimeout(() => {
            musicPlayer.state.isTransitioning = false;
          }, 550);
        });
      });
    },
    
    //  H E L P E R S
    escapeHTML(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    },
    collapsibles: {
      init: function () {
        this.setupTabListeners();
        this.setupActionButtonListeners();
        this.updateActiveTabState();
        this.addListItemInteractions();
      },
      setupTabListeners: function () {
        const dotIndicators = document.querySelectorAll('.dotIndicator');
        const player = document.getElementById('music-player');
        dotIndicators.forEach(indicator => {
          indicator.addEventListener('click', (e) => {
            const tab = e.target.closest('.dotIndicator').dataset.tab;
            // Update active classes on indicators
            dotIndicators.forEach(dot => dot.classList.remove('active'));
            e.target.closest('.dotIndicator').classList.add('active');
            // Update active classes on panels
            const panels = QUERY_ALL('.player .panel');
            panels.forEach(panel => {
              if (panel.dataset.tab === tab) {
                panel.classList.add('active');
              }
              else {
                panel.classList.remove('active');
              }
            });
            setTimeout(() => {
              if (player && tab) {
                player.setAttribute('data-active-tab', tab);
                musicPlayer.state.handleTabChange(tab);
              }
            }, 100);
          });
        });
      },
      setupActionButtonListeners: function () {
        const player = document.getElementById('music-player');
        const queueButton = document.getElementById('music-player-queue');
        if (queueButton) {
          queueButton.addEventListener('click', () => {
            const dotIndicators = document.querySelectorAll('.dotIndicator');
            dotIndicators.forEach(dot => {
              if (dot.dataset.tab === 'queue') {
                dot.click();
              }
            });
          });
        }
        const recentButton = document.querySelector('[data-tab="playlist"]');
        if (recentButton) {
          recentButton.addEventListener('click', () => {
            const dotIndicators = document.querySelectorAll('.dotIndicator');
            dotIndicators.forEach(dot => {
              if (dot.dataset.tab === 'playlist') {
                dot.click();
              }
            });
          });
        }
      },
      updateActiveTabState: function () {
        const player = document.getElementById('music-player');
        if (!player) return;
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-active-tab') {
              const tab = player.getAttribute('data-active-tab');
              musicPlayer.state.handleTabChange(tab);
            }
          });
        });
        observer.observe(player, {
          attributes: true,
          attributeFilter: ['data-active-tab']
        });
      },
      forceUpdateTab: function (tabName) {
        const player = document.getElementById('music-player');
        if (player && ['playing', 'queue', 'playlist'].includes(tabName)) {
          player.setAttribute('data-active-tab', tabName);
          musicPlayer.state.handleTabChange(tabName);
        }
      },
      addListItemInteractions: function () {
        const listItems = document.querySelectorAll('.list-item');
        listItems.forEach(item => {
          const artwork = item.querySelector('.item-artwork');
          if (!artwork) return;
          let wrapper = artwork.parentElement;
          if (!wrapper.classList.contains('item-artwork-wrapper')) {
            wrapper = document.createElement('div');
            wrapper.className = 'item-artwork-wrapper';
            artwork.parentNode.insertBefore(wrapper, artwork);
            wrapper.appendChild(artwork);
          }
          if (!wrapper.querySelector('.item-play-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'item-play-overlay';
            overlay.innerHTML = '<svg viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>';
            wrapper.appendChild(overlay);
          }
        });
      },
    },
  }
};

// Initialize function
musicPlayer.initialize = () => {
  musicPlayer.mainPlayer.init();
  musicPlayer.mainPlayer.initialize();
};