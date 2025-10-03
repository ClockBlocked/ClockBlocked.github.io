

import {
  appState,
  musicPlayer,
  utils,
  notifications,
  loadArtistInfo
} from '../global.js';

import { ROUTES } from '../map.js';



class MusicSearch {
  constructor() {
    this.modal = null;
    this.input = null;
    this.resultsContainer = null;
    this.recentSearches = this.loadRecentSearches();
    this.searchTimeout = null;
    this.selectedIndex = -1;
    this.currentFilter = 'all';
    this.searchResults = {
      songs: [],
      artists: [],
      albums: []
    };
    
    this.init();
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.renderRecentSearches();
  }

  cacheElements() {
    this.modal = document.getElementById('searchModal');
    this.input = document.getElementById('searchInput');
    this.resultsContainer = document.getElementById('searchResults');
    this.searchTrigger = document.getElementById('searchTrigger');
    this.closeBtn = document.getElementById('closeSearch');
    this.clearBtn = document.getElementById('clearSearch');
    this.backdrop = this.modal?.querySelector('.search-backdrop');
  }

  bindEvents() {
    // Open search modal
    this.searchTrigger?.addEventListener('click', () => this.openSearch());
    
    // Close search modal
    this.closeBtn?.addEventListener('click', () => this.closeSearch());
    this.backdrop?.addEventListener('click', () => this.closeSearch());
    
    // Clear input
    this.clearBtn?.addEventListener('click', () => this.clearInput());
    
    // Search input
    this.input?.addEventListener('input', (e) => this.handleSearchInput(e));
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    
    // Filter chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', (e) => this.handleFilterClick(e));
    });
    
    // Clear recent searches
    document.getElementById('clearRecentBtn')?.addEventListener('click', () => {
      this.clearRecentSearches();
    });
  }

  openSearch() {
    if (!this.modal) return;
    
    this.modal.classList.remove('hidden');
    
    // Trigger reflow for animation
    this.modal.offsetHeight;
    
    requestAnimationFrame(() => {
      this.modal.classList.add('show');
      this.input?.focus();
    });
    
    document.body.style.overflow = 'hidden';
  }

  closeSearch() {
    if (!this.modal) return;
    
    this.modal.classList.remove('show');
    
    setTimeout(() => {
      this.modal.classList.add('hidden');
      document.body.style.overflow = '';
      this.clearInput();
      this.selectedIndex = -1;
    }, 300);
  }

  clearInput() {
    if (this.input) {
      this.input.value = '';
      this.clearBtn?.classList.add('hidden');
      this.showRecentSearches();
    }
  }

  handleSearchInput(e) {
    const query = e.target.value.trim();
    
    // Show/hide clear button
    if (query) {
      this.clearBtn?.classList.remove('hidden');
    } else {
      this.clearBtn?.classList.add('hidden');
      this.showRecentSearches();
      return;
    }
    
    // Debounce search
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.performSearch(query);
    }, 300);
  }

  performSearch(query) {
    if (!query || !window.music) return;
    
    this.showLoading();
    
    // Simulate async search (you can replace with actual API call)
    setTimeout(() => {
      const results = this.searchMusic(query);
      this.searchResults = results;
      this.displayResults(results);
      this.hideLoading();
    }, 200);
  }

  searchMusic(query) {
    const lowerQuery = query.toLowerCase();
    const results = {
      songs: [],
      artists: [],
      albums: []
    };
    
    if (!window.music) return results;
    
    window.music.forEach(artist => {
      // Search artists
      if (artist.artist.toLowerCase().includes(lowerQuery)) {
        results.artists.push({
          type: 'artist',
          name: artist.artist,
          genre: artist.genre,
          albumCount: artist.albums.length,
          cover: utils.getArtistImageUrl(artist.artist),
          data: artist
        });
      }
      
      // Search albums and songs
      artist.albums.forEach(album => {
        // Search albums
        if (album.album.toLowerCase().includes(lowerQuery)) {
          results.albums.push({
            type: 'album',
            name: album.album,
            artist: artist.artist,
            year: album.year,
            songCount: album.songs.length,
            cover: utils.getAlbumImageUrl(album.album),
            data: { artist: artist.artist, album: album.album, songs: album.songs }
          });
        }
        
        // Search songs
        album.songs.forEach(song => {
          if (song.title.toLowerCase().includes(lowerQuery)) {
            results.songs.push({
              type: 'song',
              title: song.title,
              artist: artist.artist,
              album: album.album,
              duration: song.duration || '0:00',
              cover: utils.getAlbumImageUrl(album.album),
              data: {
                ...song,
                artist: artist.artist,
                album: album.album,
                cover: utils.getAlbumImageUrl(album.album)
              }
            });
          }
        });
      });
    });
    
    // Limit results
    results.songs = results.songs.slice(0, 10);
    results.artists = results.artists.slice(0, 5);
    results.albums = results.albums.slice(0, 8);
    
    return results;
  }



  displayResults(results) {
    const hasResults = results.songs.length || results.artists.length || results.albums.length;
    
    document.getElementById('recentSearches')?.classList.add('hidden');
    document.getElementById('searchResultsContent')?.classList.remove('hidden');
    
    if (!hasResults) {
      this.showNoResults();
      return;
    }
    
    document.getElementById('noResults')?.classList.add('hidden');
    
    // Filter results based on active filter
    if (this.currentFilter === 'all' || this.currentFilter === 'songs') {
      this.displaySongs(results.songs);
    } else {
      document.getElementById('songsResults')?.classList.add('hidden');
    }
    
    if (this.currentFilter === 'all' || this.currentFilter === 'artists') {
      this.displayArtists(results.artists);
    } else {
      document.getElementById('artistsResults')?.classList.add('hidden');
    }
    
    if (this.currentFilter === 'all' || this.currentFilter === 'albums') {
      this.displayAlbums(results.albums);
    } else {
      document.getElementById('albumsResults')?.classList.add('hidden');
    }
    
    // Add search to recent
    this.addToRecentSearches(this.input.value);
  }
  displaySongs(songs) {
    const container = document.getElementById('songsList');
    const section = document.getElementById('songsResults');
    
    if (!songs.length) {
      section?.classList.add('hidden');
      return;
    }
    
    section?.classList.remove('hidden');
    container.innerHTML = '';
    
    songs.forEach((song, index) => {
      const item = document.createElement('div');
      item.className = 'search-result-item animate-fade-in-up';
      item.style.animationDelay = `${index * 30}ms`;
      item.dataset.index = index;
      item.dataset.type = 'song';
      
      item.innerHTML = `
        <img src="${song.cover}" alt="${song.title}" class="w-12 h-12 rounded object-cover flex-shrink-0">
        <div class="flex-1 min-w-0">
          <div class="font-medium text-white truncate">${song.title}</div>
          <div class="text-sm text-gray-400 truncate">${song.artist} • ${song.album}</div>
        </div>
        <div class="text-xs text-gray-500">${song.duration}</div>
        <button class="play-btn opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-white/10" data-action="play">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
          </svg>
        </button>
      `;
      
      item.addEventListener('click', (e) => {
        if (e.target.closest('[data-action="play"]')) {
          musicPlayer.ui.playSong(song.data);
          this.closeSearch();
        } else {
          musicPlayer.ui.playSong(song.data);
          this.closeSearch();
        }
      });
      
      container.appendChild(item);
    });
  }
  displayArtists(artists) {
  const container = document.getElementById('artistsList');
  const section = document.getElementById('artistsResults');
  
  if (!artists.length) {
    section?.classList.add('hidden');
    return;
  }
  
  section?.classList.remove('hidden');
  container.innerHTML = '';
  
  artists.forEach((artist, index) => {
    const item = document.createElement('div');
    item.className = 'search-result-item animate-fade-in-up';
    item.style.animationDelay = `${index * 30}ms`;
    item.dataset.index = index;
    item.dataset.type = 'artist';
    
    item.innerHTML = `
      <img src="${artist.cover}" alt="${artist.name}" class="w-12 h-12 rounded-full object-cover flex-shrink-0">
      <div class="flex-1 min-w-0">
        <div class="font-medium text-white truncate">${artist.name}</div>
        <div class="text-sm text-gray-400 truncate">${artist.genre} • ${artist.albumCount} album${artist.albumCount !== 1 ? 's' : ''}</div>
      </div>
      <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
      </svg>
    `;
    
    // CORRECTED: Use the proper navigation pattern from your existing code
    item.addEventListener('click', () => {
      if (appState.siteMapInstance) {
        appState.siteMapInstance.navigateTo(ROUTES.ARTIST, {
          artist: artist.name
        });
        this.closeSearch();
      }
    });
    
    container.appendChild(item);
  });
}
  displayAlbums(albums) {
  const container = document.getElementById('albumsList');
  const section = document.getElementById('albumsResults');
  
  if (!albums.length) {
    section?.classList.add('hidden');
    return;
  }
  
  section?.classList.remove('hidden');
  container.innerHTML = '';
  
  albums.forEach((album, index) => {
    const item = document.createElement('div');
    item.className = 'album-card-search animate-fade-in-up';
    item.style.animationDelay = `${index * 30}ms`;
    item.dataset.index = index;
    item.dataset.type = 'album';
    
    item.innerHTML = `
      <img src="${album.cover}" alt="${album.name}" class="w-full aspect-square rounded-lg object-cover mb-3">
      <div class="font-medium text-white truncate">${album.name}</div>
      <div class="text-sm text-gray-400 truncate">${album.artist}</div>
      <div class="text-xs text-gray-500 mt-1">${album.year} • ${album.songCount} songs</div>
    `;
    
    // CORRECTED: Use the proper navigation pattern with album loading
    item.addEventListener('click', () => {
      const artistName = album.artist;
      const albumName = album.name;
      
      if (appState.siteMapInstance) {
        appState.siteMapInstance.navigateTo(ROUTES.ARTIST, {
          artist: artistName
        });
        
        // Store the album to be loaded when artist page is ready
        if (albumName) {
          sessionStorage.setItem('pendingAlbumLoad', albumName);
          
          // Add a small delay to ensure artist page is loaded first
          setTimeout(() => {
            const storedAlbum = sessionStorage.getItem('pendingAlbumLoad');
            if (storedAlbum === albumName) {
              loadArtistInfo(artistName, albumName);
              sessionStorage.removeItem('pendingAlbumLoad');
            }
          }, 100);
        }
        
        this.closeSearch();
      }
    });
    
    container.appendChild(item);
  });
}
  showNoResults() {
    document.getElementById('noResults')?.classList.remove('hidden');
    document.getElementById('songsResults')?.classList.add('hidden');
    document.getElementById('artistsResults')?.classList.add('hidden');
    document.getElementById('albumsResults')?.classList.add('hidden');
  }



  showLoading() {
    document.getElementById('searchLoading')?.classList.remove('hidden');
    document.getElementById('searchResultsContent')?.classList.add('hidden');
    document.getElementById('recentSearches')?.classList.add('hidden');
  }
  hideLoading() {
    document.getElementById('searchLoading')?.classList.add('hidden');
  }

  showRecentSearches() {
    document.getElementById('recentSearches')?.classList.remove('hidden');
    document.getElementById('searchResultsContent')?.classList.add('hidden');
    this.renderRecentSearches();
  }

  handleFilterClick(e) {
    const filter = e.target.dataset.filter;
    if (!filter) return;
    
    // Update active state
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.classList.remove('active');
    });
    e.target.classList.add('active');
    
    this.currentFilter = filter;
    
    // Re-display results with new filter
    if (this.input?.value.trim()) {
      this.displayResults(this.searchResults);
    }
  }

  handleKeyboard(e) {
    // Cmd/Ctrl + K to open search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (this.modal?.classList.contains('show')) {
        this.closeSearch();
      } else {
        this.openSearch();
      }
      return;
    }
    
    // ESC to close
    if (e.key === 'Escape' && this.modal?.classList.contains('show')) {
      this.closeSearch();
      return;
    }
    
    // Navigation with arrow keys (when search is open)
    if (!this.modal?.classList.contains('show')) return;
    
    const allItems = Array.from(document.querySelectorAll('.search-result-item, .album-card-search'));
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.selectedIndex = Math.min(this.selectedIndex + 1, allItems.length - 1);
      this.updateSelection(allItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
      this.updateSelection(allItems);
    } else if (e.key === 'Enter' && this.selectedIndex >= 0) {
      e.preventDefault();
      allItems[this.selectedIndex]?.click();
    }
  }

  updateSelection(items) {
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        item.classList.remove('selected');
      }
    });
  }



// Recent Searches
  loadRecentSearches() {
    try {
      const saved = localStorage.getItem('recentSearches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  saveRecentSearches() {
    try {
      localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
    } catch (error) {
      console.error('Failed to save recent searches:', error);
    }
  }

  addToRecentSearches(query) {
    if (!query.trim()) return;
    
    // Remove if exists, add to beginning
    this.recentSearches = this.recentSearches.filter(q => q !== query);
    this.recentSearches.unshift(query);
    
    // Keep only last 10
    this.recentSearches = this.recentSearches.slice(0, 10);
    
    this.saveRecentSearches();
  }

  clearRecentSearches() {
    this.recentSearches = [];
    this.saveRecentSearches();
    this.renderRecentSearches();
    notifications.show('Recent searches cleared', 'INFO');
  }

  renderRecentSearches() {
    const container = document.getElementById('recentSearchList');
    const emptyState = document.getElementById('recentSearchesEmpty');
    
    if (!this.recentSearches.length) {
      container?.classList.add('hidden');
      emptyState?.classList.remove('hidden');
      return;
    }
    
    container?.classList.remove('hidden');
    emptyState?.classList.add('hidden');
    
    container.innerHTML = '';
    
    this.recentSearches.forEach((query, index) => {
      const item = document.createElement('div');
      item.className = 'recent-search-item animate-fade-in-up';
      item.style.animationDelay = `${index * 20}ms`;
      
      item.innerHTML = `
        <svg class="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span class="flex-1 text-gray-300">${query}</span>
        <button class="remove-btn p-1 hover:bg-white/10 rounded transition-colors" data-action="remove">
          <svg class="w-4 h-4 text-gray-500 hover:text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      `;
      
      item.querySelector('[data-action="remove"]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeRecentSearch(query);
      });
      
      item.addEventListener('click', () => {
        this.input.value = query;
        this.performSearch(query);
      });
      
      container.appendChild(item);
    });
  }

  removeRecentSearch(query) {
    this.recentSearches = this.recentSearches.filter(q => q !== query);
    this.saveRecentSearches();
    this.renderRecentSearches();
  }
}





/**
 *  Initialize
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.musicSearch = new MusicSearch();
  });
} else {
  window.musicSearch = new MusicSearch();
}

export default MusicSearch;
/**
 * 
 *
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 *  
 *    Copyright 2025
 *  William Cole Hanson
 * 
 * Chevrolay@Outlook.com
 * 
 *    m.me/Chevrolay
 * 
 * 
**/