import { getAlbumImageUrl } from './parsers.js';
import { escapeForAttribute } from '../pages/rendering.js';

export const render = {
  artist: function(templateName, data) {
    switch(templateName) {
      case "PopOvers":
        const artistName = data.artist;
        const artistId = data.id || '';
        const artistImage = getArtistImageUrl(artistName);
        const totalAlbums = data.albums?.length || 0;
        const totalSongs = getTotalSongs(data) || 0;

        return `
<div class="group relative bg-gray-800/50 backdrop-blur-xl rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer" data-artist-name="${artistName}">
  <div class="relative overflow-hidden rounded-xl mb-3">
    <img src="${artistImage}" alt="${artistName}" class="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"/>
    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  </div>
  
  <div class="text-white font-semibold text-center truncate">${artistName}</div>
  
  <div class="absolute inset-0 bg-black/90 backdrop-blur-md rounded-2xl p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
    <div class="flex flex-col h-full">
      <div class="flex-1">
        <div class="text-xl font-bold text-white mb-2">${artistName}</div>
      </div>
      
      <div class="flex gap-6 mb-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-white">${totalAlbums}</div>
          <div class="text-gray-400 text-sm">Albums</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-white">${totalSongs}</div>
          <div class="text-gray-400 text-sm">Songs</div>
        </div>
      </div>
      
      <button class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200" data-artist-id="${artistId}">
        View Artist
      </button>
    </div>
  </div>
</div>`;
      
      case "card":
        return `
<div class="group bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 cursor-pointer" data-artist-id="${data.id}">
  <div class="text-center">
    <div class="relative w-32 h-32 mx-auto mb-4 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-600/20">
      <img src="${data.cover}" alt="${data.artist}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
      <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
    <h3 class="text-lg font-bold mb-2 text-white truncate">${data.artist}</h3>
    <div class="inline-flex px-3 py-1 bg-blue-500/20 rounded-full text-xs font-medium mb-3 text-blue-300 border border-blue-500/30">${data.genre}</div>
    <p class="text-sm text-gray-400">${data.albumCount} album${data.albumCount !== 1 ? 's' : ''}</p>
  </div>
</div>`;
      
      case "header":
        return `
<div class="relative bg-gradient-to-b from-gray-900 to-black pb-8">
  <div class="max-w-7xl mx-auto px-6">
    <div class="flex items-end gap-8">
      <div class="relative group">
        <img src="${data.cover}" alt="${data.artist}" class="w-48 h-48 rounded-3xl shadow-2xl object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div class="flex-1 pb-4">
        <h1 class="text-6xl font-black text-white mb-4">${data.artist}</h1>
        <div class="flex gap-4 mb-6 text-gray-300">
          <span class="bg-gray-800/50 px-3 py-1 rounded-full text-sm">${data.genre}</span>
          <span class="bg-gray-800/50 px-3 py-1 rounded-full text-sm">${data.albumCount} Albums</span>
          <span class="bg-gray-800/50 px-3 py-1 rounded-full text-sm">${data.songCount} Songs</span>
        </div>
        <div class="flex gap-3">
          <button class="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-semibold transition-colors duration-200 flex items-center gap-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
            Play All
          </button>
          <button class="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-full font-medium transition-colors duration-200 border border-gray-700" data-favorite-artists="${data.songData.id}">
            Favorite
          </button>
        </div>
      </div>
    </div>
  </div>
</div>`;
      
      case "enhancedArtist":
        return `
<div class="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
  <section class="relative h-96 overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10"></div>
    <img id="artistBgImage" src="${data.cover}" alt="${data.artist}" class="w-full h-full object-cover scale-110 blur-sm"/>
    
    <div class="absolute inset-0 z-20 flex items-end pb-12">
      <div class="max-w-7xl mx-auto w-full px-6">
        <div class="flex items-end gap-8">
          <div class="relative group">
            <img id="artistAvatar" alt="${data.artist}" src="${data.cover}" class="w-64 h-64 rounded-3xl shadow-2xl object-cover"/>
            <div class="absolute inset-0 bg-black/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <button class="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-semibold transition-all duration-200 transform scale-90 group-hover:scale-100 flex items-center gap-3">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                Play All
              </button>
            </div>
          </div>

          <div class="flex-1 pb-4">
            <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-white mb-4">
              <span class="w-2 h-2 bg-green-400 rounded-full"></span>
              Artist
            </div>
            <h1 id="artistName" class="text-7xl font-black text-white mb-4">${data.artist}</h1>
            <p id="artistTagline" class="text-xl text-gray-300 mb-8">${data.genre || 'Various Genres'}</p>
            
            <div class="flex items-center gap-8 mb-8">
              <div class="text-center">
                <div class="text-3xl font-bold text-white">${data.albumCount}</div>
                <div class="text-gray-400">Albums</div>
              </div>
              <div class="w-px h-12 bg-gray-600"></div>
              <div class="text-center">
                <div class="text-3xl font-bold text-white">${data.songCount}</div>
                <div class="text-gray-400">Tracks</div>
              </div>
              <div class="w-px h-12 bg-gray-600"></div>
              <div class="text-center">
                <div class="text-3xl font-bold text-white">★</div>
                <div class="text-gray-400">Featured</div>
              </div>
            </div>

            <div class="flex gap-3">
              <button class="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full font-medium transition-all duration-200 border border-white/20 flex items-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.59 12.83L4.4 15c-.58.58-1.59 1-2.4 1H0v-2h2c.29 0 .62-.06.83-.17l2.17-2.18 1.59 1.59zM16 8V6a4 4 0 00-4-4H4a4 4 0 00-4 4v2h16z"/></svg>
                Shuffle
              </button>
              <button class="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full font-medium transition-all duration-200 border border-white/20 flex items-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/></svg>
                Follow
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="max-w-7xl mx-auto px-6 -mt-16 relative z-30">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div class="bg-gradient-to-br from-blue-500/10 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-blue-300 text-sm font-medium mb-2">Total Duration</div>
            <div class="text-2xl font-bold text-white" id="totalDuration">Calculating...</div>
          </div>
          <div class="bg-blue-500/20 p-3 rounded-xl">
            <svg class="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/></svg>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-purple-500/10 to-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-purple-300 text-sm font-medium mb-2">Latest Release</div>
            <div class="text-2xl font-bold text-white" id="latestYear">2024</div>
          </div>
          <div class="bg-purple-500/20 p-3 rounded-xl">
            <svg class="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-pink-500/10 to-pink-600/20 backdrop-blur-xl rounded-2xl p-6 border border-pink-500/20">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-pink-300 text-sm font-medium mb-2">Popularity</div>
            <div class="text-2xl font-bold text-white">Rising ↗</div>
          </div>
          <div class="bg-pink-500/20 p-3 rounded-xl">
            <svg class="w-6 h-6 text-pink-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>
          </div>
        </div>
      </div>
    </div>

    <section class="mb-16">
      <div id="${IDS.albumsContainer}"></div>
    </section>
  </div>
</div>`;
        
      default:
        return "";
    }
  },
  
  album: function(templateName, data) {
    switch (templateName) {
      case "card":
        return `
<div class="group bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105" data-album-id="${data.albumId}">
  <div class="relative mb-4 rounded-2xl overflow-hidden">
    <img src="${data.cover}" alt="${data.album}" class="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105">
    <button class="absolute bottom-4 right-4 bg-green-500 hover:bg-green-600 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
      <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
    </button>
  </div>
  
  <div class="space-y-2">
    <h3 class="text-lg font-bold text-white truncate">${data.album}</h3>
    <p class="text-gray-400 text-sm">${data.year || 'Unknown year'} • ${data.songCount} Tracks</p>
  </div>
  
  <div class="songs-container mt-4 hidden" id="songs-container-${data.albumId}"></div>
</div>`;
      
      case "singleAlbumCard":
        return `
<div class="bg-gradient-to-br from-gray-900 to-black backdrop-blur-xl rounded-3xl p-8 border border-white/10">
  <div class="flex flex-col md:flex-row gap-8 items-center" data-album-id="${data.albumId}">
    <div class="relative flex-shrink-0">
      <img src="${data.cover}" alt="${data.album}" class="w-64 h-64 rounded-2xl shadow-2xl object-cover">
      <button class="absolute bottom-6 right-6 bg-green-500 hover:bg-green-600 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300">
        <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
      </button>
    </div>
    
    <div class="flex-1 text-center md:text-left">
      <h3 class="text-4xl font-black text-white mb-3">${data.album}</h3>
      <p class="text-gray-400 text-lg mb-6">${data.year || 'Unknown year'} • ${data.songCount} Tracks</p>
    </div>
  </div>
  
  <div class="songs-container mt-8" id="songs-container-${data.albumId}"></div>
</div>`;

      case "section":
        return `
<div class="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
  <div class="flex flex-wrap gap-2 mb-8">
    ${data.albums.map((album, index) => `
      <button class="px-5 py-3 rounded-xl transition-all duration-300 font-medium ${
        index === 0 
          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
          : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50"
      }" data-album-index="${index}" data-album-name="${album.album}">
        <div class="flex items-center gap-3">
          <span class="font-semibold">${album.album}</span>
          <span class="text-xs opacity-75 bg-black/30 px-2 py-1 rounded">${album.year || ""}</span>
        </div>
      </button>
    `).join("")}
  </div>
  
  <div class="current-album-container">
    <div id="current-album-display" class="transition-all duration-500 ease-in-out"></div>
  </div>
</div>`;
        
      default:
        return "";
    }
  },
  
  songItem: function(data) {
    const { 
      trackNumber, 
      title, 
      artist, 
      duration, 
      songData, 
      context = 'base',
      isFavorite = false,
      showTrackNumber = true,
      showArtist = false,
      albumCover = null
    } = data;
    
    return `
<div class="group flex items-center gap-4 p-4 rounded-2xl bg-gray-800/30 hover:bg-gray-700/50 border border-transparent hover:border-white/10 transition-all duration-300 cursor-pointer"
     data-song="${escapeForAttribute(JSON.stringify(songData))}"
     data-context="${context}">
  
  <div class="flex items-center justify-center w-8">
    <span class="text-gray-400 group-hover:opacity-0 transition-opacity duration-200 text-sm font-medium">
      ${showTrackNumber ? trackNumber : '♪'}
    </span>
    <button class="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-green-500 hover:bg-green-600 w-8 h-8 rounded-full flex items-center justify-center">
      <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
    </button>
  </div>

  <div class="flex-1 min-w-0">
    <div class="text-white font-medium truncate">${title}</div>
    ${showArtist ? `<div class="text-gray-400 text-sm truncate">${artist}</div>` : ''}
  </div>

  <div class="text-gray-400 text-sm font-medium">${duration}</div>

  <button class="p-2 rounded-full transition-all duration-200 ${
    isFavorite 
      ? 'text-red-500 hover:text-red-400' 
      : 'text-gray-400 hover:text-white opacity-0 group-hover:opacity-100'
  }" data-action="favorite" data-song-id="${songData.id}">
    <svg class="w-5 h-5" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="${isFavorite ? '0' : '2'}" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
    </svg>
  </button>

  <button class="p-2 rounded-full text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200" data-action="more">
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 8a2 2 0 1 0-2-2 2 2 0 0 0 2 2zm0 2a2 2 0 1 0 2 2 2 2 0 0 0-2-2zm0 6a2 2 0 1 0 2 2 2 2 0 0 0-2-2z"/>
    </svg>
  </button>
</div>`;
  },
  
  page: function(templateName, data) {
    switch (templateName) {
      case "home":
        return `
<div class="max-w-7xl mx-auto px-6">
  <div class="text-center py-16">
    <h1 class="text-6xl md:text-7xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6">Discover Amazing Music</h1>
    <p class="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">Explore artists, albums, and songs from your personal library with an immersive listening experience</p>
  </div>
  
  <h2 class="text-4xl font-bold mb-12 text-white">Featured Artists</h2>
  <div id="featured-artists" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8"></div>
</div>`;
        
      case "allArtists":
        return `
<div class="max-w-7xl mx-auto px-6">
  <div class="py-8">
    <div class="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between mb-8">
      <div class="relative flex-1 max-w-2xl">
        <input type="text" id="artist-search" 
              class="w-full bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl py-4 px-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              placeholder="Search artists...">
        <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
        </svg>
      </div>
      
      <div id="genre-filters" class="flex flex-wrap gap-2"></div>
      
      <div class="flex gap-2 bg-gray-800/50 backdrop-blur-xl rounded-2xl p-2 border border-gray-700">
        <button id="grid-view-btn" class="p-3 rounded-xl bg-blue-500 text-white transition-all duration-200">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
        </button>
        <button id="list-view-btn" class="p-3 rounded-xl text-gray-400 hover:text-white transition-all duration-200">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/></svg>
        </button>
      </div>
    </div>
  </div>
  
  <div id="artists-grid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6 pb-12"></div>
</div>`;

      case "home_bento":
        return `
<div class="max-w-7xl mx-auto px-6 py-8">
  <div class="bento-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
    <div class="bento-card bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-white">Recently Played</h2>
        <a href="#" class="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200" data-view="recent">View All</a>
      </div>
      <div id="${data.IDS.recentlyPlayedSection}" class="card-content">
        <div class="space-y-3">
          ${Array(3).fill().map(() => `
            <div class="flex items-center gap-3 animate-pulse">
              <div class="w-12 h-12 bg-gray-700 rounded-xl"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-700 rounded w-3/4"></div>
                <div class="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    
    <div class="bento-card bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl p-6 border border-white/10 md:col-span-2">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-white">Discover Albums</h2>
        <a href="#" class="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200" data-view="albums">Explore More</a>
      </div>
      <div id="${data.IDS.randomAlbumsSection}" class="card-content">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          ${Array(4).fill().map(() => `
            <div class="animate-pulse">
              <div class="aspect-square bg-gray-700 rounded-2xl mb-3"></div>
              <div class="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    
    <div class="bento-card bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-white">Favorite Artists</h2>
        <a href="#" class="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200" data-view="favorite-artists">View All</a>
      </div>
      <div id="${data.IDS.favoriteArtistsSection}" class="card-content">
        <div class="space-y-4">
          ${Array(3).fill().map(() => `
            <div class="flex items-center gap-3 animate-pulse">
              <div class="w-12 h-12 bg-gray-700 rounded-full"></div>
              <div class="flex-1">
                <div class="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div class="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    
    <div class="bento-card bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-white">Your Playlists</h2>
        <a href="#" class="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200" data-view="playlists">View All</a>
      </div>
      <div id="${data.IDS.playlistsSection}" class="card-content">
        <div class="space-y-3">
          ${Array(3).fill().map(() => `
            <div class="flex items-center gap-3 animate-pulse">
              <div class="w-12 h-12 bg-gray-700 rounded-xl"></div>
              <div class="flex-1">
                <div class="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div class="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    
    <div class="bento-card bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-white">Favorite Songs</h2>
        <a href="#" class="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200" data-view="favorite-songs">View All</a>
      </div>
      <div id="${data.IDS.favoriteSongsSection}" class="card-content">
        <div class="space-y-3">
          ${Array(3).fill().map(() => `
            <div class="flex items-center gap-3 animate-pulse">
              <div class="w-12 h-12 bg-gray-700 rounded-xl"></div>
              <div class="flex-1">
                <div class="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div class="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </div>
</div>`;
        
      default:
        return "";
    }
  },

  homeSection: {
    recentlyPlayed: (tracks, utils) => {
      let html = `<div class="space-y-3">`;
      tracks.forEach((track, index) => {
        html += `
          <div class="group flex items-center gap-4 p-4 rounded-2xl bg-gray-800/30 hover:bg-gray-700/50 border border-transparent hover:border-white/10 transition-all duration-300 cursor-pointer" style="animation-delay: ${index * 100}ms;">
            <div class="relative">
              <img src="${utils.getAlbumImageUrl(track.album)}" alt="${track.title}" class="w-14 h-14 rounded-xl object-cover">
              <div class="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <button class="bg-green-500 hover:bg-green-600 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 transform scale-90 group-hover:scale-100">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                </button>
              </div>
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="text-white font-medium truncate">${track.title}</div>
              <div class="text-gray-400 text-sm truncate" data-artist="${track.artist}">${track.artist}</div>
            </div>
            
            <div class="text-gray-400 text-sm font-medium">3:24</div>
            
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button class="p-2 rounded-full text-gray-400 hover:text-white transition-colors duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              </button>
              <button class="p-2 rounded-full text-gray-400 hover:text-white transition-colors duration-200">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
              </button>
            </div>
          </div>
        `;
      });
      html += `</div>`;
      return html;
    },

    playlists: (playlists) => {
      let html = `<div class="grid grid-cols-1 gap-4">`;
      playlists.forEach((playlist, index) => {
        html += `
          <div class="group flex items-center gap-4 p-4 rounded-2xl bg-gray-800/30 hover:bg-gray-700/50 border border-transparent hover:border-white/10 transition-all duration-300 cursor-pointer" style="animation-delay: ${index * 100}ms;">
            <div class="relative">
              <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v2H3v-2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/></svg>
              </div>
              <div class="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <button class="bg-green-500 hover:bg-green-600 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 transform scale-90 group-hover:scale-100">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                </button>
              </div>
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="text-white font-medium truncate">${playlist.name}</div>
              <div class="text-gray-400 text-sm">${playlist.songs?.length || 0} track${playlist.songs?.length !== 1 ? "s" : ""}</div>
            </div>
            
            <button class="p-2 rounded-full text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
            </button>
          </div>
        `;
      });
      html += `</div>`;
      return html;
    },

    favoriteArtists: (artists, utils) => {
      let html = `<div class="grid grid-cols-1 gap-4">`;
      artists.forEach((artistName, index) => {
        html += `
          <div class="group flex items-center gap-4 p-4 rounded-2xl bg-gray-800/30 hover:bg-gray-700/50 border border-transparent hover:border-white/10 transition-all duration-300 cursor-pointer" style="animation-delay: ${index * 100}ms;">
            <div class="relative">
              <img src="${utils.getArtistImageUrl(artistName)}" alt="${artistName}" class="w-14 h-14 rounded-full object-cover">
              <div class="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <button class="bg-green-500 hover:bg-green-600 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 transform scale-90 group-hover:scale-100">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                </button>
              </div>
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="text-white font-medium truncate">${artistName}</div>
              <div class="text-gray-400 text-sm">Artist</div>
            </div>
            
            <button class="p-2 rounded-full text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            </button>
          </div>
        `;
      });
      html += `</div>`;
      return html;
    },

    randomAlbums: (albums, utils) => {
      let html = `<div class="grid grid-cols-2 md:grid-cols-4 gap-6">`;
      albums.forEach((album, index) => {
        html += `
          <div class="group cursor-pointer" style="animation-delay: ${index * 100}ms;" data-artist="${album.artist}" data-album="${album.album}">
            <div class="relative mb-4 rounded-2xl overflow-hidden">
              <img src="${utils.getAlbumImageUrl(album.album)}" alt="${album.album}" class="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105">
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button class="bg-green-500 hover:bg-green-600 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 transform scale-90 group-hover:scale-100" data-artist="${album.artist}" data-album="${album.album}">
                  <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                </button>
              </div>
            </div>
            <div class="space-y-1">
              <div class="text-white font-medium truncate">${album.album}</div>
              <div class="text-gray-400 text-sm truncate" data-artist="${album.artist}">${album.artist}</div>
            </div>
          </div>
        `;
      });
      html += `</div>`;
      return html;
    },

    favoriteSongs: (songs, utils) => {
      let html = `<div class="space-y-3">`;
      songs.forEach((song, index) => {
        html += `
          <div class="group flex items-center gap-4 p-4 rounded-2xl bg-gray-800/30 hover:bg-gray-700/50 border border-transparent hover:border-white/10 transition-all duration-300 cursor-pointer" style="animation-delay: ${index * 100}ms;">
            <div class="relative">
              <img src="${utils.getAlbumImageUrl(song.album)}" alt="${song.title}" class="w-14 h-14 rounded-xl object-cover">
              <div class="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <button class="bg-green-500 hover:bg-green-600 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 transform scale-90 group-hover:scale-100">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                </button>
              </div>
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="text-white font-medium truncate">${song.title}</div>
              <div class="text-gray-400 text-sm truncate" data-artist="${song.artist}">${song.artist}</div>
            </div>
            
            <div class="text-gray-400 text-sm font-medium">3:24</div>
            
            <div class="flex gap-1">
              <button class="p-2 rounded-full text-red-500 hover:text-red-400 transition-colors duration-200" data-song-id="${song.id}">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              </button>
              <button class="p-2 rounded-full text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
              </button>
            </div>
          </div>
        `;
      });
      html += `</div>`;
      return html;
    }
  },

  overlay: function(templateName, data) {
    switch(templateName) {
      case 'default':
        return `
          <div class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full cursor-pointer transition-colors duration-200" data-close>&times;</div>
          <div class="p-6">${data.content}</div>
        `;
      case 'dialog':
        return `
          <div class="p-6 border-b border-gray-700">
            <div class="text-lg font-semibold text-white">${data.message}</div>
          </div>
          <div class="flex gap-3 p-6 justify-end">
            ${data.cancelText ? `<button class="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors duration-200" data-cancel>${data.cancelText}</button>` : ''}
            <button class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors duration-200" data-ok>${data.okText}</button>
          </div>
        `;
      case 'prompt':
        return `
          <div class="p-6 border-b border-gray-700">
            <div class="flex justify-between items-center">
              <h3 class="text-xl font-bold text-white">${data.message}</h3>
              <button class="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full transition-colors duration-200" data-close>×</button>
            </div>
          </div>
          
          <div class="p-6">
            <input type="text" class="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" placeholder="${data.placeholder}" value="${data.value}">
          </div>
          
          <div class="flex gap-3 p-6 justify-end">
            <button class="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors duration-200" data-cancel>${data.cancelText}</button>
            <button class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors duration-200" data-ok>${data.okText}</button>
          </div>
        `;
      case 'viewer':
        return `
          <div class="relative w-full h-full bg-black">
            <button class="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full transition-colors duration-200" data-close aria-label="Close">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <div class="w-full h-full flex items-center justify-center p-8">
              ${data.content}
            </div>
          </div>
        `;
      default:
        return '';
    }
  },

  notification: function(data) {
    const { type, iconHtml, title, message } = data;
    return `
      <div class="flex items-center gap-4 p-4 bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl min-w-80 max-w-md">
        <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-${type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue'}-500/20 text-${type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue'}-400">
          ${iconHtml}
        </div>
        <div class="flex-1 min-w-0">
          ${title ? `<div class="font-semibold text-white text-sm mb-1">${title}</div>` : ''}
          <div class="text-gray-300 text-sm">${message}</div>
        </div>
      </div>
    `;
  },

  playerListItem: function(data) {
    const { song, index, type, utils } = data;
    const isQueue = type === 'queue';

    return `
      <li class="flex items-center gap-4 p-4 rounded-2xl bg-gray-800/30 hover:bg-gray-700/50 border border-transparent hover:border-white/10 transition-all duration-300 cursor-pointer group" data-index="${index}" data-song='${JSON.stringify(song).replace(/"/g, "&quot;")}'>
        <img src="${utils.getAlbumImageUrl(song.album)}" alt="${song.title}" class="w-12 h-12 rounded-xl object-cover">
        
        <div class="flex-1 min-w-0">
          <div class="text-white font-medium truncate">${song.title}</div>
          <div class="text-gray-400 text-sm truncate">${song.artist}</div>
        </div>
        
        <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button class="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors duration-200" data-action="play">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
          </button>
          
          ${isQueue 
            ? `<button class="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors duration-200" data-action="remove">
                 <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
               </button>`
            : `<button class="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200" data-action="queue">
                 <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zm14 0a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg>
               </button>`
          }
        </div>
      </li>
    `;
  },

  desktopPlayerSidebar: function() {
    return `
      <div class="p-6 border-b border-gray-700">
        <div class="text-lg font-semibold text-white">Now Playing</div>
      </div>
      
      <div class="p-6">
        <div class="text-center mb-6">
          <img id="sidebar-album-art" src="" alt="Album Cover" class="w-48 h-48 rounded-2xl mx-auto shadow-2xl object-cover">
        </div>
        
        <div class="text-center mb-8">
          <div class="text-xl font-bold text-white mb-2" id="sidebar-song-name">No song playing</div>
          <div class="text-gray-400 mb-1" id="sidebar-artist-name">Select a song to start</div>
          <div class="text-gray-500 text-sm" id="sidebar-album-name"></div>
        </div>
        
        <div class="space-y-4">
          <div class="space-y-2">
            <div class="flex justify-between text-sm text-gray-400">
              <span id="sidebar-current-time">0:00</span>
              <span id="sidebar-total-time">0:00</span>
            </div>
            <div class="relative h-1 bg-gray-700 rounded-full overflow-hidden">
              <div class="absolute inset-0 bg-gray-600" id="sidebar-progress-buffer"></div>
              <div class="absolute inset-0 bg-green-500" id="sidebar-progress-fill" style="width:0%"></div>
            </div>
          </div>
          
          <div class="flex justify-center items-center gap-4">
            <button class="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors duration-200" id="sidebar-prev">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-5.89 4a1 1 0 000 1.664l5.89 4z"/></svg>
            </button>
            
            <button class="p-4 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors duration-200" id="sidebar-play-pause">
              <svg id="sidebar-play-icon" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
              <svg id="sidebar-pause-icon" class="w-6 h-6 hidden" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H6a1 1 0 01-1-1V4zM11 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>
            </button>
            
            <button class="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors duration-200" id="sidebar-next">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l5.89-4a1 1 0 000-1.664l-5.89-4A1 1 0 0010 6v2.798L4.555 5.168z"/></svg>
            </button>
          </div>
          
          <div class="flex justify-center gap-3">
            <button class="p-2 rounded-full text-gray-400 hover:text-white transition-colors duration-200" id="sidebar-shuffle">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.59 12.83L4.4 15c-.58.58-1.59 1-2.4 1H0v-2h2c.29 0 .62-.06.83-.17l2.17-2.18 1.59 1.59zM16 8V6a4 4 0 00-4-4H4a4 4 0 00-4 4v2h16z"/></svg>
            </button>
            <button class="p-2 rounded-full text-gray-400 hover:text-white transition-colors duration-200" id="sidebar-favorite">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            </button>
            <button class="p-2 rounded-full text-gray-400 hover:text-white transition-colors duration-200" id="sidebar-repeat">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 001-1V6a1 1 0 00-1-1H5zm0 8a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 00-1-1H5zm6-6a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V6zm0 8a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z"/></svg>
            </button>
            <button class="p-2 rounded-full text-gray-400 hover:text-white transition-colors duration-200" id="sidebar-queue">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1 4a1 1 0 100 2h8a1 1 0 100-2H4z"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  bentoMusicPlayerCard: function() {
    return `
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-white">Now Playing</h2>
        <button class="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition-colors duration-200">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"/></svg>
        </button>
      </div>
    `;
  },

  actionPopover: function(actions) {
    return `
      <div class="grid grid-cols-2 gap-2 p-2">
        ${actions.map(action => `
          <button class="flex items-center gap-3 p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white transition-colors duration-200" data-action="${action.id}">
            <svg class="w-5 h-5 text-gray-400" viewBox="0 0 24 24">
              <path d="${action.icon}" fill="currentColor"/>
            </svg>
            <span class="text-sm font-medium">${action.label}</span>
          </button>
        `).join('')}
      </div>
    `;
  },

  favoriteArtistsModal: function() {
    return `
      <div class="bg-gradient-to-br from-gray-900 to-black backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl w-full max-w-2xl mx-4">
        <div class="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h2 class="text-2xl font-bold text-white">Favorite Artists</h2>
            <div class="text-gray-400 text-sm mt-1">0 artists</div>
          </div>
          <button class="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors duration-200">&times;</button>
        </div>
        <div class="p-6 artists-list"></div>
      </div>
    `;
  },

  emptyState: function(data) {
    const { title, subtitle, icon } = data;
    return `
      <div class="text-center py-16 px-6">
        <div class="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 text-2xl mx-auto mb-4">
          ${icon || '♡'}
        </div>
        <h3 class="text-xl font-bold text-white mb-2">${title}</h3>
        <p class="text-gray-400 mb-4">${subtitle}</p>
        ${data.subtext ? `<p class="text-gray-500 text-sm">${data.subtext}</p>` : ''}
      </div>
    `;
  },
};

export function create(htmlString) {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}