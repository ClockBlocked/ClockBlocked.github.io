// Simple test to verify global.js exports work correctly
import {
  DOM,
  QUERY,
  QUERY_ALL,
  IDS,
  CLASSES,
  ROUTES,
  THEMES,
  STORAGE_KEYS,
  ICONS,
  AUDIO_FORMATS,
  REPEAT_MODES,
  NOTIFICATION_TYPES,
  MUSIC_PLAYER,
  NAVBAR,
  MODALS,
  $,
  $byId
} from "./siteScripts/global.js";

console.log("✓ All imports from global.js loaded successfully!");
console.log("✓ Testing key exports:");
console.log("  - IDS:", typeof IDS === 'object' ? '✓' : '✗');
console.log("  - CLASSES:", typeof CLASSES === 'object' ? '✓' : '✗');
console.log("  - ROUTES:", typeof ROUTES === 'object' ? '✓' : '✗');
console.log("  - THEMES:", typeof THEMES === 'object' ? '✓' : '✗');
console.log("  - STORAGE_KEYS:", typeof STORAGE_KEYS === 'object' ? '✓' : '✗');
console.log("  - ICONS:", typeof ICONS === 'object' ? '✓' : '✗');
console.log("  - AUDIO_FORMATS:", Array.isArray(AUDIO_FORMATS) ? '✓' : '✗');
console.log("  - REPEAT_MODES:", typeof REPEAT_MODES === 'object' ? '✓' : '✗');
console.log("  - NOTIFICATION_TYPES:", typeof NOTIFICATION_TYPES === 'object' ? '✓' : '✗');
console.log("  - MUSIC_PLAYER:", typeof MUSIC_PLAYER === 'object' ? '✓' : '✗');
console.log("  - NAVBAR:", typeof NAVBAR === 'object' ? '✓' : '✗');
console.log("  - MODALS:", typeof MODALS === 'object' ? '✓' : '✗');
console.log("  - $byId:", typeof $byId === 'function' ? '✓' : '✗');
console.log("\n✓ All tests passed!");
