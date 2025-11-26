export function enhancedArtist(data) {
  return `
<div class="artistPage">
  <section class="fragments artist-hero">
    <div class="artist-hero-bg"></div>
    <div class="artist-hero-image">
      <img id="artistBgImage" src="${data.cover}" alt="${data.artist}" />
    </div>
    
    <div class="artist-hero-content">
      <div class="artist-hero-flex">
        <div class="artist-avatar-group">
          <div class="artist-avatar-container">
            <img id="artistAvatar" alt="${data.artist}" src="${data.cover}" />
          </div>
          <div class="artist-avatar-overlay">
            <button id="artistPlay" class="artist-play-btn">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
              </svg>
              Play All
            </button>
          </div>
        </div>

        <div class="artist-info-section">
          <div class="artist-badge">
            <span class="artist-badge-dot"></span>
            Artist
          </div>
          <h1 id="artistName" class="artist-title">
            ${data.artist}
          </h1>
          <p id="artistTagline" class="artist-genre">${data.genre || "Various Genres"}</p>
          
          <div class="artist-stats-row">
            <div class="artist-stat">
              <div id="artistAlbums" class="artist-stat-value">${data.albumCount}</div>
              <div class="artist-stat-label">Albums</div>
            </div>
            <div class="artist-stat-divider"></div>
            <div class="artist-stat">
              <div id="artistTracks" class="artist-stat-value">${data.songCount}</div>
              <div class="artist-stat-label">Tracks</div>
            </div>
            <div class="artist-stat-divider"></div>
            <div class="artist-stat">
              <div class="artist-stat-value">★</div>
              <div class="artist-stat-label">Featured</div>
            </div>
          </div>

          <div class="artist-actions">
            <button id="artistShuffle" class="artist-action-btn">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 00-2 2v6H0l4 4 4-4H5V6h3l1-2H5zM15 4h-3l-1 2h3v6h-3l-1 2h4a2 2 0 002-2V6a2 2 0 00-2-2z"/>
              </svg>
              Shuffle
            </button>
            <button id="artistFollow" class="artist-action-btn">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              Follow
            </button>
            <button class="artist-action-icon">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="fragments artist-content">
    <div class="artist-quick-stats">
      <div class="artist-stat-card stat-blue">
        <div class="stat-card-content">
          <div>
            <div class="stat-card-label">Total Duration</div>
            <div class="stat-card-value" id="totalDuration">Calculating...</div>
          </div>
          <div class="stat-card-icon stat-icon-blue">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="artist-stat-card stat-purple">
        <div class="stat-card-content">
          <div>
            <div class="stat-card-label">Latest Release</div>
            <div class="stat-card-value" id="latestYear">2024</div>
          </div>
          <div class="stat-card-icon stat-icon-purple">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="artist-stat-card stat-pink">
        <div class="stat-card-content">
          <div>
            <div class="stat-card-label">Popularity</div>
            <div class="stat-card-value">Rising ↗</div>
          </div>
          <div class="stat-card-icon stat-icon-pink">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <section class="fragments albums">
      <div id="${IDS.albumsContainer}"></div>
    </section>
  </div>

  <section class="fragments similar">
    <div class="similar-rows" id="similarRows">
      <div class="names-row left" data-speed="138" data-gap="40"></div>
      <div class="names-row right" data-speed="178" data-gap="40"></div>
      <div class="names-row left" data-speed="119" data-gap="40"></div>
    </div>
  </section>
</div>
`;
}