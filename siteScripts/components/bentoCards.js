import { ICONS } from "../map.js";

const escapeHtml = (value = "") => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const serializePayload = (payload) => {
  if (!payload) return "";
  try {
    return JSON.stringify(payload)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  } catch (error) {
    return "";
  }
};

const buildMedia = ({ cover, alt, badge, action, icon, accent }) => {
  const hasCover = Boolean(cover);
  return `
    <div class="bento-card-media ${accent ? `media-${accent}` : ""}">
      ${hasCover ? `<img src="${escapeHtml(cover)}" alt="${escapeHtml(alt || "Artwork")}" loading="lazy"/>` : `<div class="bento-card-media-placeholder"></div>`}
      ${badge ? `<span class="bento-card-chip">${escapeHtml(badge)}</span>` : ""}
      ${action ? `<button type="button" class="bento-card-cta" data-action="${escapeHtml(action)}" aria-label="${escapeHtml(action.replace(/-/g, " "))}">${icon || ICONS.play}</button>` : ""}
    </div>
  `;
};

const buildFooter = (actions = []) => {
  if (!actions.length) return "";
  const html = actions
    .map(({ label, action, variant = "ghost" }) => {
      const classes = variant === "solid" ? "btn-solid" : variant === "icon" ? "btn-icon" : "btn-ghost";
      const content = variant === "icon" ? (action === "favorite-album" ? ICONS.heart : ICONS.more) : escapeHtml(label);
      return `<button type="button" class="bento-card-action ${classes}" data-action="${escapeHtml(action)}">${content}</button>`;
    })
    .join("");
  return `<div class="bento-card-footer">${html}</div>`;
};

const typeRenderers = {
  artist: (data) => {
    const kicker = data.kicker || "Artist";
    const metaParts = [data.genre, data.statLine].filter(Boolean);
    return `
      ${buildMedia({ cover: data.cover, alt: data.name, badge: data.badge, action: "play-artist", icon: ICONS.play, accent: "artist" })}
      <div class="bento-card-body">
        <p class="bento-card-kicker">${escapeHtml(kicker)}</p>
        <h3 class="bento-card-title">${escapeHtml(data.name)}</h3>
        ${metaParts.length ? `<p class="bento-card-meta">${escapeHtml(metaParts.join(" • "))}</p>` : ""}
      </div>
      ${buildFooter([
        { label: "View Artist", action: "view-artist", variant: "ghost" },
        { label: "Favorite", action: "favorite-artist", variant: "icon" },
      ])}
    `;
  },
  album: (data) => {
    const metaParts = [data.artist, data.year ? `Released ${data.year}` : null, data.songCount ? `${data.songCount} songs` : null].filter(Boolean);
    return `
      ${buildMedia({ cover: data.cover, alt: data.title, badge: data.year, action: "play-album", icon: ICONS.play, accent: "album" })}
      <div class="bento-card-body">
        <p class="bento-card-kicker">${escapeHtml(data.artist || "Album")}</p>
        <h3 class="bento-card-title">${escapeHtml(data.title)}</h3>
        ${metaParts.length ? `<p class="bento-card-meta">${escapeHtml(metaParts.join(" • "))}</p>` : ""}
      </div>
      ${buildFooter([
        { label: "Open Album", action: "view-album", variant: "ghost" },
        { label: "Favorite", action: "favorite-album", variant: "icon" },
      ])}
    `;
  },
  song: (data) => {
    const metaParts = [data.artist, data.duration].filter(Boolean);
    return `
      ${buildMedia({ cover: data.cover, alt: data.title, badge: data.trackNumber ? `#${data.trackNumber}` : data.album, action: "play-song", icon: ICONS.play })}
      <div class="bento-card-body">
        <p class="bento-card-kicker">${escapeHtml(data.album || "Single")}</p>
        <h3 class="bento-card-title">${escapeHtml(data.title)}</h3>
        ${metaParts.length ? `<p class="bento-card-meta">${escapeHtml(metaParts.join(" • "))}</p>` : ""}
      </div>
      ${buildFooter([
        { label: "Queue", action: "queue-song", variant: "ghost" },
        { label: "Favorite", action: "favorite-song", variant: "icon" },
      ])}
    `;
  },
  playlist: (data) => {
    const metaParts = [data.songCount ? `${data.songCount} songs` : null, data.updatedLabel].filter(Boolean);
    return `
      ${buildMedia({ cover: data.cover, alt: data.name, badge: data.badge || "Playlist", action: "play-playlist", icon: ICONS.play, accent: "playlist" })}
      <div class="bento-card-body">
        <p class="bento-card-kicker">${escapeHtml(data.owner || "Curated")}</p>
        <h3 class="bento-card-title">${escapeHtml(data.name)}</h3>
        ${metaParts.length ? `<p class="bento-card-meta">${escapeHtml(metaParts.join(" • "))}</p>` : ""}
      </div>
      ${buildFooter([
        { label: "Open", action: "view-playlist", variant: "ghost" },
        { label: "Favorite", action: "favorite-playlist", variant: "icon" },
      ])}
    `;
  },
};

export const BentoCards = {
  renderCard(type, config = {}) {
    const renderer = typeRenderers[type];
    if (!renderer) return "";
    const payload = config.payload || null;
    const attributes = [
      `class="bento-card bento-card--${type}${config.highlight ? ` ${config.highlight}` : ""}"`,
      `data-card-type="${type}"`,
      payload ? `data-payload="${serializePayload(payload)}"` : "",
    ]
      .filter(Boolean)
      .join(" ");
    return `<article ${attributes}>${renderer(config)}</article>`;
  },
  renderCollection(items = []) {
    return items
      .map((item) => {
        if (!item) return "";
        const type = item.type || "song";
        return BentoCards.renderCard(type, item.data || item);
      })
      .join("");
  },
};
