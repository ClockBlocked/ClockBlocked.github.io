import { render } from '../utils/templates.js';

const overlays = {
  // Store the previously focused element for focus management (Feature #16)
  _previouslyFocusedElement: null,

  open: function(id, content, type = 'default') {
    // Store the currently focused element before opening modal (Feature #16)
    overlays._previouslyFocusedElement = document.activeElement;

    let modal = document.getElementById(id);
    if (!modal) {
      modal = document.createElement("dialog");
      modal.id = id;
      modal.className = `modal ${type}`;
      document.body.appendChild(modal);
    }

    modal.innerHTML = render.overlay('default', { content });
    
    modal.classList.remove('closing');
    
    modal.querySelector("[data-close]").addEventListener("click", () => overlays.close(id), { once: true });
    modal.addEventListener('cancel', (e) => {
      e.preventDefault();
      overlays.close(id);
    });
    
    modal.showModal();
    modal.offsetHeight;
    requestAnimationFrame(() => {
      modal.setAttribute('open', '');
      
      // Focus management (Feature #16): Focus first interactive element
      const firstInteractive = modal.querySelector('button, input, [data-close], [data-ok], [data-cancel]');
      if (firstInteractive) {
        firstInteractive.focus();
      }
    });
  },

  close: function(id) {
    const modal = document.getElementById(id);
    if (modal && modal.open) {
      modal.classList.add('closing');
      setTimeout(() => {
        modal.close();
        modal.classList.remove('closing');
        modal.removeAttribute('open');
        
        // Focus management (Feature #16): Return focus to previously focused element
        if (overlays._previouslyFocusedElement && overlays._previouslyFocusedElement.focus) {
          try {
            overlays._previouslyFocusedElement.focus();
          } catch (e) {
            // Element may no longer exist in DOM
            console.debug('Could not return focus to previous element');
          }
        }
        overlays._previouslyFocusedElement = null;
      }, 250);
    }
  },

  dialog: {
    confirm: function(message, { okText = "OK", cancelText = "Cancel", danger = false } = {}) {
      return new Promise((resolve) => {
        const id = "confirm-dialog";
        overlays.open(
          id,
          render.overlay('dialog', {
            message,
            okText,
            cancelText,
            danger,
          }),
          'dialog'
        );
        
        const modal = document.getElementById(id);
        
        const handleCancel = () => {
          overlays.close(id);
          setTimeout(() => resolve(false), 250);
        };
        
        const handleOk = () => {
          overlays.close(id);
          setTimeout(() => resolve(true), 250);
        };
        
        modal.querySelector("[data-cancel]").addEventListener("click", handleCancel, { once: true });
        modal.querySelector("[data-ok]").addEventListener("click", handleOk, { once: true });
      });
    },

    alert: function(message, { okText = "OK" } = {}) {
      return new Promise((resolve) => {
        const id = "alert-dialog";
        overlays.open(
          id,
          render.overlay('dialog', {
            message,
            okText,
            cancelText: null,
            danger: false,
          }),
          'dialog'
        );
        
        const modal = document.getElementById(id);
        const handleOk = () => {
          overlays.close(id);
          setTimeout(() => resolve(), 250);
        };
        
        modal.querySelector("[data-ok]").addEventListener("click", handleOk, { once: true });
      });
    }
  },

  form: {
    prompt: function(message, { okText = "Create", cancelText = "Go Back", placeholder = "", value = "" } = {}) {
      return new Promise((resolve) => {
        const id = "prompt-form";
        overlays.open(
          id,
          render.overlay('prompt', {
            message,
            okText,
            cancelText,
            placeholder,
            value,
          }),
          'form'
        );
        
        const modal = document.getElementById(id);
        const input = modal.querySelector(".input");
        
        const handleCancel = () => {
          overlays.close(id);
          setTimeout(() => resolve(null), 250);
        };
        
        const handleOk = () => {
          overlays.close(id);
          setTimeout(() => resolve(input.value.trim() || null), 250);
        };
        
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleOk();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            handleCancel();
          }
        });
        
        modal.querySelector("[data-cancel]").addEventListener("click", handleCancel, { once: true });
        modal.querySelector("[data-ok]").addEventListener("click", handleOk, { once: true });
      });
    }
  },

  viewer: {
    playlists: function(content) {
      overlays.open('playlist-viewer', content, 'viewer playlist');
    },
    
    artists: function(content) {
      overlays.open('artist-viewer', content, 'viewer artist');
    },
    
    unified: function(title, content) {
      const wrappedContent = `
        <div class="modal-content">
          <div class="modal-header">
            <div>
              <h2 class="modal-title">${title}</h2>
            </div>
            <button class="close-btn" data-close aria-label="Close">&times;</button>
          </div>
          <div class="modal-body">
            ${content}
          </div>
        </div>
      `;
      overlays.open('unified-modal', wrappedContent, 'viewer unified');
    },
    
    recentTracks: function(content) {
      overlays.open('recent-tracks-viewer', content, 'viewer recent');
    },
    
    favoriteSongs: function(content) {
      overlays.open('favorite-songs-viewer', content, 'viewer favorites');
    },
    
    favoriteArtists: function(content) {
      overlays.open('favorite-artists-viewer', content, 'viewer favorites');
    }
  }
};

export { overlays };
