// BASIC USAGE EXAMPLES

// 1. Basic info notification
notifications.notify({
  type: NOTIFICATION_TYPES.INFO,
  message: "Library refreshed.",
});

// 2. Success notification with title
notifications.notify({
  type: NOTIFICATION_TYPES.SUCCESS,
  title: "Saved",
  message: "Playlist was saved successfully.",
});

// 3. Warning notification
notifications.notify({
  type: NOTIFICATION_TYPES.WARNING,
  message: "Connection seems slow.",
});

// 4. Error notification with title
notifications.notify({
  type: NOTIFICATION_TYPES.ERROR,
  title: "Upload Failed",
  message: "The song could not be uploaded.",
});

// MEDIUM USAGE EXAMPLES

// 5. Show notification during an async action
async function saveFavorite(songId) {
  notifications.notify({
    type: NOTIFICATION_TYPES.INFO,
    message: "Saving favorite...",
  });

  await fakeDelay(1500);

  notifications.notify({
    type: NOTIFICATION_TYPES.SUCCESS,
    title: "Done",
    message: `Song #${songId} added to favorites.`,
  });
}

function fakeDelay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// 6. Batch notifications close together (will group inside Dock)
function simulateRapidEvents() {
  notifications.notify({ message: "Added to queue" });
  setTimeout(() => notifications.notify({ message: "Song liked" }), 800);
  setTimeout(() => notifications.notify({ message: "Album saved" }), 1200);
}

// 7. Notifications triggered from global player actions
function onTrackChanged(track) {
  notifications.notify({
    type: NOTIFICATION_TYPES.INFO,
    title: "Now Playing",
    message: `${track.artist} — ${track.title}`,
  });
}

// ADVANCED USAGE EXAMPLES

// 8. Integrate with old toast system (if using both)
notifications.integrateWithNotifications(); // Smart Dock listens to notifications.show()

// 9. Opener example
const settingsBtn = document.getElementById("settings-button");
settingsBtn.addEventListener("click", () => {
  notifications.notify({
    type: NOTIFICATION_TYPES.INFO,
    title: "Settings opened",
    message: "You opened the settings panel.",
  });
});

// 10. Create multiple grouped notifications for testing
function stressTestNotifications() {
  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      notifications.notify({
        type: NOTIFICATION_TYPES.SUCCESS,
        title: "Batch Event",
        message: `Event #${i + 1}`,
      });
    }, i * 600);
  }
}

// 11. Custom helper for unified app-level notification logic
function notifySongEvent(song, action) {
  const type = action === "added" ? NOTIFICATION_TYPES.SUCCESS : NOTIFICATION_TYPES.INFO;
  notifications.notify({
    type,
    title: "Song Updated",
    message: `Song '${song.title}' was ${action}.`,
  });
}

// 12. Use notifications inside router transitions
function onRouteChange(routeName) {
  notifications.notify({
    type: NOTIFICATION_TYPES.INFO,
    title: "Navigation",
    message: `Navigating to ${routeName}...`,
  });
}

// 13. Use notifications inside fetch/async operations
async function syncUserData() {
  notifications.notify({ message: "Syncing data..." });

  await fakeDelay(1200);

  notifications.notify({
    type: NOTIFICATION_TYPES.SUCCESS,
    title: "Sync Complete",
    message: "Your library is now up to date.",
  });
}
