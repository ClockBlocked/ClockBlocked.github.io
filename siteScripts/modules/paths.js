import { appState, storage, utils, ACTION_GRID_ITEMS, overlays } from "./global.js";
import { render, create } from "./templates.js";
import { syncs } from "./background.js";
import { pageManager } from "./builder.js";
import { router } from "./router.js";
import { pageLoader } from './router.js';

export const navigation = {
  initialize: function() {
    pageLoader.init();

    appState.router = this.createRouter();

    window.addEventListener("popstate", function () {
      appState.router.handleRoute(window.location.pathname + window.location.search);
    });

    appState.router.handleInitialRoute();
  },

  createRouter: function() {
    const router = {
      encodeName: function (name) {
        return name.trim().replace(/\s+/g, ".");
      },
      decodeName: function (segment) {
        return segment.replace(/\./g, " ");
      },

      routes: {},

      handleInitialRoute: function () {
        const path = window.location.pathname + window.location.search;
        this.handleRoute(path);
      },

      handleRoute: function (path) {
        let matchedRoute = false;
        for (const key in this.routes) {
          const route = this.routes[key];
          const match = path.match(route.pattern);
          if (match) {
            const params = {};
            if (key === ROUTES.ARTIST) params.artist = router.decodeName(match[1]);
            route.handler(params);
            matchedRoute = true;
            break;
          }
        }
        if (!matchedRoute) pageManager.loadHomePage();
      },

      navigateTo: function (routeName, params = {}) {
        let url;
        switch (routeName) {
          case ROUTES.HOME:
            url = "/";
            break;
          case ROUTES.ARTIST:
            url = "/artist/" + router.encodeName(params.artist);
            break;
          case ROUTES.ALL_ARTISTS:
            url = "/artists";
            break;
          default:
            url = "/";
        }
        window.history.pushState({}, "", url);
        if (this.routes[routeName]) this.routes[routeName].handler(params);
      },

      navigateToArtist: function (artistName) {
        this.navigateTo(ROUTES.ARTIST, { artist: artistName });
      },

      openSearchDialog: function () {
        notifications.show("Search functionality coming soon");
      },

      closeSearchDialog: function () {},
    };

    router.routes = {
      [ROUTES.HOME]: {
        pattern: /^\/$/,
        handler: pageManager.loadHomePage,
      },
      [ROUTES.ARTIST]: {
        pattern: /^\/artist\/(.+)$/,
        handler: function (params) {
          const artistName = params.artist || utils.getParameterByName("artist", window.location.href);
          const decodedArtistName = artistName ? router.decodeName(artistName) : "";
          const artistData = window.music?.find(function (a) {
            return a.artist === decodedArtistName;
          });
          if (artistData) {
            pageManager.loadArtistPage(artistData);
          } else {
            appState.router.navigateTo(ROUTES.HOME);
          }
        },
      },
      [ROUTES.ALL_ARTISTS]: {
        pattern: /^\/artists$/,
        handler: pageManager.loadAllArtistsPage,
      },
    };

    return router;
  },

  isValidRoute: function (routeName, params = {}) {
    switch (routeName) {
      case ROUTES.HOME:
      case ROUTES.ALL_ARTISTS:
        return true;

      case ROUTES.ARTIST:
        if (!params.artist || !window.music) return false;
        return window.music.some(function (a) {
          return a.artist === params.artist;
        });

      default:
        return false;
    }
  }
};