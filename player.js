/**
THIS IS ONLY PART OF A MUCH LARGER FILE, as i am only needing help with the following: 
**/


function initializeMusicLibrary() {
    window.music = music;
}

function initPlayer() {
    if (audioElement) return;

    audioElement = new Audio();

    audioElement.addEventListener('timeupdate', function() {
        updateProgress();
    });
    audioElement.addEventListener('ended', handleSongEnd);
    audioElement.addEventListener('loadedmetadata', function() {
        duration = audioElement.duration;
        let totalTimeElement = document.getElementById('popup-total-time');
        if (totalTimeElement) {
            totalTimeElement.textContent = formatTime(duration);
        }
    });
    audioElement.addEventListener('play', onPlay);
    audioElement.addEventListener('pause', onPause);
    audioElement.addEventListener('error', function(e) {
        console.error('Audio playback error:', e.target.error);
    });

    createSeekTooltip();
    attachProgressBarEvents();
}

function togglePlayPause() {
    if (!currentSong || !audioElement) return;
    
    if (isPlaying) {
        audioElement.pause();
    } else {
        audioElement.play().catch(err => {
            console.error('Play prevented:', err);
        });
    }
}

function onPlay() {
    isPlaying = true;
    updatePlayPauseButtons();
    updateMediaSessionPlaybackState();
}

function onPause() {
    isPlaying = false;
    updatePlayPauseButtons();
    updateMediaSessionPlaybackState();
}

function playNext() {
    if (!queue.length) return;
    
    if (shuffleMode) {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * queue.length);
        } while (randomIndex === currentIndex && queue.length > 1);
        currentIndex = randomIndex;
    } else {
        currentIndex = (currentIndex + 1) % queue.length;
    }
    
    loadSong(queue[currentIndex]);
}

function playPrevious() {
    if (!queue.length) return;
    
    if (audioElement && audioElement.currentTime > 3) {
        audioElement.currentTime = 0;
    } else {
        currentIndex = (currentIndex - 1 + queue.length) % queue.length;
        loadSong(queue[currentIndex]);
    }
}

function skipTime(seconds) {
    if (!audioElement) return;
    
    const newTime = Math.max(0, Math.min(duration, audioElement.currentTime + seconds));
    audioElement.currentTime = newTime;
    updateProgress(newTime);
}

function updateProgress(time = null) {
    if (!audioElement || !duration || isNaN(duration)) return;
    
    const currentTime = time !== null ? time : audioElement.currentTime;
    const percent = (currentTime / duration) * 100;
    
    const progressFill = document.getElementById('popup-progress-fill');
    const progressThumb = document.getElementById('popup-progress-thumb');
    const currentTimeElement = document.getElementById('popup-current-time');
    
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressThumb) progressThumb.style.left = `${percent}%`;
    if (currentTimeElement) currentTimeElement.textContent = formatTime(currentTime);
    
    if ("mediaSession" in navigator) {
        try {
            navigator.mediaSession.setPositionState({
                duration: duration,
                playbackRate: audioElement.playbackRate,
                position: currentTime
            });
        } catch (e) {
            console.error('Media session position state error:', e);
        }
    }
}

function seekTo(e) {
    if (!currentSong || !audioElement || !duration) return;
    
    const progressBar = document.getElementById('popup-progress-bar');
    if (!progressBar) return;
    
    const rect = progressBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * duration;
    
    audioElement.currentTime = newTime;
    updateProgress(newTime);
}

function startDrag(e) {
    if (!currentSong) return;
    isDragging = true;
    document.body.style.userSelect = 'none';
    e.preventDefault();
}

function onDrag(e) {
    if (!isDragging || !audioElement) return;
    
    const progressBar = document.getElementById('popup-progress-bar');
    if (!progressBar) return;
    
    const rect = progressBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * duration;
    
    audioElement.currentTime = newTime;
    updateProgress(newTime);
}

function endDrag() {
    isDragging = false;
    document.body.style.userSelect = '';
    hideSeekTooltip();
}

function createSeekTooltip() {
    if (document.getElementById('seek-tooltip')) {
        seekTooltip = document.getElementById('seek-tooltip');
        return;
    }
    
    const tooltip = document.createElement('div');
    tooltip.id = 'seek-tooltip';
    
    Object.assign(tooltip.style, {
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        fontSize: '12px',
        padding: '4px 8px',
        borderRadius: '4px',
        pointerEvents: 'none',
        opacity: '0',
        transform: 'translateX(-50%)',
        transition: 'opacity 0.2s',
        zIndex: '100'
    });
    
    const container = document.getElementById('musicPlayer');
    if (container) {
        container.appendChild(tooltip);
        seekTooltip = tooltip;
    }
}

function attachProgressBarEvents() {
    const progressBar = document.getElementById('popup-progress-bar');
    if (!progressBar) return;
    
    const newProgressBar = progressBar.cloneNode(true);
    progressBar.parentNode.replaceChild(newProgressBar, progressBar);
    
    newProgressBar.addEventListener('click', seekTo);
    newProgressBar.addEventListener('mousedown', startDrag);
    newProgressBar.addEventListener('mousemove', updateSeekTooltip);
    newProgressBar.addEventListener('mouseleave', hideSeekTooltip);
    
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', endDrag);
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);
}

function updateSeekTooltip(e) {
    if (!seekTooltip || !duration) return;
    
    const progressBar = document.getElementById('popup-progress-bar');
    if (!progressBar) return;
    
    const rect = progressBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const seekTime = percent * duration;
    
    seekTooltip.textContent = formatTime(seekTime);
    seekTooltip.style.left = `${e.clientX}px`;
    seekTooltip.style.top = `${e.clientY - 30}px`;
    seekTooltip.style.opacity = '1';
}

function hideSeekTooltip() {
    if (seekTooltip) {
        seekTooltip.style.opacity = '0';
    }
}

function updatePlayPauseButtons() {
    const playPauseBtn = document.getElementById('playPause');
    if (!playPauseBtn) return;
    
    playPauseBtn.innerHTML = '';
    
    const iconSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    iconSVG.classList.add('icon');
    iconSVG.setAttribute('viewBox', '0 0 384 512');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    if (isPlaying) {
        iconSVG.id = 'iconPause';
        path.setAttribute('d', 'M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z');
    } else {
        iconSVG.id = 'iconPlay';
        path.setAttribute('d', 'M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z');
    }
    
    iconSVG.appendChild(path);
    playPauseBtn.appendChild(iconSVG);
    
    let playIconNavbar = document.getElementById('play-icon-navbar');
    let pauseIconNavbar = document.getElementById('pause-icon-navbar');
    
    if (playIconNavbar && pauseIconNavbar) {
        playIconNavbar.classList.toggle("hidden", isPlaying);
        pauseIconNavbar.classList.toggle("hidden", !isPlaying);
    }
    
    let playIndicator = document.getElementById('play-indicator');
    if (playIndicator) {
        playIndicator.classList.toggle('active', isPlaying);
    }
}

function setupMediaSession() {
    if (!('mediaSession' in navigator)) return;
    
    navigator.mediaSession.setActionHandler('play', () => {
        if (audioElement && !isPlaying) {
            audioElement.play();
        }
    });
    
    navigator.mediaSession.setActionHandler('pause', () => {
        if (audioElement && isPlaying) {
            audioElement.pause();
        }
    });
    
    navigator.mediaSession.setActionHandler('previoustrack', previousTrack);
    navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
    
    navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.fastSeek && 'fastSeek' in audioElement) {
            audioElement.fastSeek(details.seekTime);
            return;
        }
        
        if (audioElement) {
            audioElement.currentTime = details.seekTime;
            updateProgress(details.seekTime);
        }
    });
    
    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skipTime = details.seekOffset || 10;
        skipTime(-skipTime);
    });
    
    navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skipTime = details.seekOffset || 10;
        skipTime(skipTime);
    });
}

function updateMediaSessionMetadata() {
    if (!('mediaSession' in navigator) || !currentSong) return;
    
    let artworkUrl = currentSong.albumArt || currentSong.cover;
    if (!artworkUrl) {
        artworkUrl = getAlbumImageUrl(currentSong.album);
    }
    
    navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        album: currentSong.album,
        artwork: [
            { src: artworkUrl, sizes: '512x512', type: 'image/jpeg' }
        ]
    });
    
    console.log('Media session metadata updated:', {
        title: currentSong.title,
        artist: currentSong.artist,
        album: currentSong.album,
        artwork: artworkUrl
    });
}

function updateMediaSessionPlaybackState() {
    if (!('mediaSession' in navigator)) return;
    
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
}

function stopPlayback() {
    isPlaying = false;
    updatePlayPauseButtons();
}

function handleSongEnd() {
    if (repeatMode === 'one') {
        audioElement.currentTime = 0;
        audioElement.play();
        return;
    }

    if (queue.length > 0) {
        nextTrack();
        return;
    }

    let artist = window.music.find(a => a.artist === currentArtist);
    let album = artist?.albums.find(al => al.album === currentAlbum);

    if (!album || album.songs.length === 0) {
        stopPlayback();
        return;
    }

    let nextSongData = null;
    if (shuffleMode) {
        let randomIndex = Math.floor(Math.random() * album.songs.length);
        nextSongData = album.songs[randomIndex];
    } else if (repeatMode === 'all') {
        let currentSongIndex = album.songs.findIndex(s => s.title === currentSong.title);
        let nextIndex = (currentSongIndex + 1) % album.songs.length;
        nextSongData = album.songs[nextIndex];
    }

    if (nextSongData) {
        playSong({
            ...nextSongData,
            artist: artist.artist,
            album: album.album,
            cover: getAlbumImageUrl(album.album)
        });
    } else {
        stopPlayback();
    }
    
    syncGlobalState();
}

function nextTrack() {
    if (queue.length > 0) {
        let nextSong = queue.shift();
        playSong(nextSong);
        updateQueueTab();
        updateDropdownCounts();
        return;
    }

    let artist = window.music.find(a => a.artist === currentArtist);
    let album = artist?.albums.find(al => al.album === currentAlbum);
    if (album && album.songs.length > 0) {
        let songIndex = album.songs.findIndex(s => s.title === currentSong.title);
        let nextSongIndex = (songIndex + 1) % album.songs.length;
        let nextSong = {
            ...album.songs[nextSongIndex],
            artist: artist.artist,
            album: album.album,
            cover: getAlbumImageUrl(album.album)
        };
        playSong(nextSong);
    }
    syncGlobalState();
}

function previousTrack() {
    if (audioElement && audioElement.currentTime > 3) {
        audioElement.currentTime = 0;
        return;
    }

    if (recentlyPlayed.length > 0) {
        let prevSong = recentlyPlayed.shift();
        playSong(prevSong);
        updateQueueTab();
        updateDropdownCounts();
        return;
    }

    let artist = window.music.find(a => a.artist === currentArtist);
    let album = artist?.albums.find(al => al.album === currentAlbum);
    if (album && album.songs.length > 0) {
        let songIndex = album.songs.findIndex(s => s.title === currentSong.title);
        let prevSongIndex = (songIndex - 1 + album.songs.length) % album.songs.length;
        let prevSong = {
            ...album.songs[prevSongIndex],
            artist: artist.artist,
            album: album.album,
            cover: getAlbumImageUrl(album.album)
        };
        playSong(prevSong);
    }
}

function addToQueue(song, position = null) {
    if (position !== null) queue.splice(position, 0, song);
    else queue.push(song);
    updateQueueTab();
    updateDropdownCounts();
    syncGlobalState();
}

function addToRecentlyPlayed(song) {
    if (!song) return;
    recentlyPlayed = recentlyPlayed.filter((s) => s.id !== song.id);
    recentlyPlayed.unshift(song);
    if (recentlyPlayed.length > 20) recentlyPlayed.pop();
    updateRecentTab();
    updateDropdownCounts();
    syncGlobalState();
}

function playFromQueue(index) {
    if (index >= 0 && index < queue.length) {
        let song = queue.splice(index, 1)[0];
        playSong(song);
    }
}

function playFromRecent(index) {
    if (index >= 0 && index < recentlyPlayed.length) {
        playSong(recentlyPlayed[index]);
    }
}

function toggleCurrentSongFavorite() {
    if (!currentSong) return;
    let songId = currentSong.id;
    if (favorites.has(songId)) {
        favorites.delete(songId);
    } else {
        favorites.add(songId);
    }
    updateNowPlayingButtons();
    updateDropdownCounts();
}
