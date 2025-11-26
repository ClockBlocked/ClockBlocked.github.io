import { escapeForAttribute } from "../../pages/rendering.js";

import { artistPopOvers } from "./artist/popovers.js";
import { artistCard } from "./artist/card.js";
import { artistHeader } from "./artist/header.js";
import { enhancedArtist } from "./artist/enhancedArtist.js";

import { albumCard } from "./album/card.js";
import { singleAlbumCard } from "./album/singleAlbumCard.js";
import { albumSection } from "./album/section.js";

import { pageHome } from "./page/home.js";
import { pageAllArtists } from "./page/allArtists.js";
import { pageHomeBento } from "./page/home_bento.js";

import { songItemTemplate } from "./song/songItem.js";

import { overlayDefault } from "./overlay/default.js";
import { overlayDialog } from "./overlay/dialog.js";
import { overlayPrompt } from "./overlay/prompt.js";
import { overlayViewer } from "./overlay/viewer.js";

import { notificationTemplate } from "./notifications/notification.js";

import { playerListItemTemplate } from "./player/playerListItem.js";
import { desktopPlayerSidebarTemplate } from "./player/desktopSidebar.js";
import { bentoMusicPlayerCardTemplate } from "./player/bentoCard.js";

import { actionPopoverTemplate } from "./popover/actionPopover.js";

import { favoriteArtistsModalTemplate } from "./favorites/favoriteArtistsModal.js";

import { emptyStateTemplate } from "./empty/emptyState.js";

import { recentlyPlayedSection } from "./homeSection/recentlyPlayed.js";
import { playlistsSection } from "./homeSection/playlists.js";
import { favoriteArtistsSection } from "./homeSection/favoriteArtists.js";
import { randomAlbumsSection } from "./homeSection/randomAlbums.js";
import { favoriteSongsSection } from "./homeSection/favoriteSongs.js";

import { createElementFromHtml } from "./create.js";

export const render = {
  artist(templateName, data) {
    switch (templateName) {
      case "PopOvers":
        return artistPopOvers(data);
      case "card":
        return artistCard(data);
      case "header":
        return artistHeader(data);
      case "enhancedArtist":
        return enhancedArtist(data);
      default:
        return "";
    }
  },

  album(templateName, data) {
    switch (templateName) {
      case "card":
        return albumCard(data);
      case "singleAlbumCard":
        return singleAlbumCard(data);
      case "section":
        return albumSection(data);
      default:
        return "";
    }
  },

  songItem(data) {
    return songItemTemplate(data, { escapeForAttribute });
  },

  page(templateName, data) {
    switch (templateName) {
      case "home":
        return pageHome(data);
      case "allArtists":
        return pageAllArtists(data);
      case "home_bento":
        return pageHomeBento(data);
      default:
        return "";
    }
  },

  overlay(templateName, data) {
    switch (templateName) {
      case "default":
        return overlayDefault(data);
      case "dialog":
        return overlayDialog(data);
      case "prompt":
        return overlayPrompt(data);
      case "viewer":
        return overlayViewer(data);
      default:
        return "";
    }
  },

  notification(data) {
    return notificationTemplate(data);
  },

  playerListItem(data) {
    return playerListItemTemplate(data);
  },

  desktopPlayerSidebar() {
    return desktopPlayerSidebarTemplate();
  },

  bentoMusicPlayerCard() {
    return bentoMusicPlayerCardTemplate();
  },

  actionPopover(actions) {
    return actionPopoverTemplate(actions);
  },

  favoriteArtistsModal() {
    return favoriteArtistsModalTemplate();
  },

  emptyState(data) {
    return emptyStateTemplate(data);
  }
};

export const homeSection = {
  recentlyPlayed(tracks, utils) {
    return recentlyPlayedSection(tracks, utils);
  },
  playlists(playlists) {
    return playlistsSection(playlists);
  },
  favoriteArtists(artists, utils) {
    return favoriteArtistsSection(artists, utils);
  },
  randomAlbums(albums, utils) {
    return randomAlbumsSection(albums, utils);
  },
  favoriteSongs(songs, utils) {
    return favoriteSongsSection(songs, utils);
  }
};

export function create(htmlString) {
  return createElementFromHtml(htmlString);
}