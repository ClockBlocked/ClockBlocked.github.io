// Cache Buster Module
// Adds cache-busting query parameters to stylesheets and scripts

export function bustCache() {
  const cacheBuster = "?_=" + Date.now();

  // StyleSheets
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    if (!link.href.includes("?")) {
      link.href += cacheBuster;
    } else {
      link.href += "&" + cacheBuster.substring(2);
    }
  });

  // Scripts
  document.querySelectorAll("script[src]").forEach((script) => {
    if (!script.src.includes(window.location.host) || script.src.includes("cache")) return;

    if (!script.src.includes("?")) {
      script.src += cacheBuster;
    } else {
      script.src += "&" + cacheBuster.substring(2);
    }
  });
}
