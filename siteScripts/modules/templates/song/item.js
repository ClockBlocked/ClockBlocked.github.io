export function songItemTemplate(data, helpers) {
  const {
    trackNumber,
    title,
    duration,
    songData,
    context = "base",
    isFavorite = false,
    showTrackNumber = true
  } = data;

  const { escapeForAttribute } = helpers;

  return `
  <div class="song-item"
       data-song="${escapeForAttribute(JSON.stringify(songData))}"
       data-context="${context}"
       role="button"
       tabindex="0"
       aria-label="Track ${trackNumber}: ${title} — ${duration}">

    <div class="cell index-play" aria-hidden="false">
      <span class="track-number">
        ${showTrackNumber ? trackNumber : "♪"}
      </span>

      <button aria-label="Name" class="play-button"
              data-action="play"
              title="Play"
              aria-label="Play ${title}"
              tabindex="-1">
        <svg class="global lightGray small" viewBox="0 0 384 512" aria-hidden="true">
          <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>
        </svg>
      </button>
    </div>

    <div class="cell title" title="${title}">
      <span class="song-title">${title}</span>
    </div>

    <div class="cell duration" aria-label="Duration ${duration}">
      <span>${duration}</span>
    </div>

    <div class="cell heart">
      <button aria-label="Name" class="action-btn favorite-btn ${isFavorite ? "favorited" : ""}"
              data-action="favorite"
              data-song-id="${songData.id}"
              data-favorite-songs="${songData.id}"
              title="${isFavorite ? "Remove from favorites" : "Add to favorites"}"
              aria-pressed="${isFavorite ? "true" : "false"}"
              aria-label="Toggle favorite for ${title}">
        <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
             style="fill: ${isFavorite ? "#ef4444" : "none"};" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
      </button>
    </div>

    <div class="cell more">
      <button aria-label="Name" class="action-btn more-btn"
              data-action="more"
              title="More options"
              aria-label="More options for ${title}">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 8a2 2 0 1 0-2-2 2 2 0 0 0 2 2zm0 2a2 2 0 1 0 2 2 2 2 0 0 0-2-2zm0 6a2 2 0 1 0 2 2 2 2 0 0 0-2-2z"/>
        </svg>
      </button>
    </div>
  </div>
  `;
}
