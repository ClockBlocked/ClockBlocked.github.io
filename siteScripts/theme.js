// Theme Toggle Module
// Manages theme switching functionality (light, dim, dark)

export function initTheme() {
  const container = document.querySelector(".theme-toggle-container");
  const trigger = document.querySelector(".theme-trigger");
  const themeButtons = document.querySelectorAll(".theme-options button");
  const html = document.documentElement;

  const themeColors = {
    dark: "#3d454e",
    dim: "#4a535d",
    light: "#c9d1df",
  };

  const setTheme = (theme) => {
    html.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    const metaTag = document.querySelector('meta[name="theme-color"]');
    if (metaTag && themeColors[theme]) {
      metaTag.setAttribute("content", themeColors[theme]);
    }
  };

  const savedTheme = localStorage.getItem("theme") || "dim";
  setTheme(savedTheme);

  themeButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.theme === savedTheme);

    btn.addEventListener("click", () => {
      const theme = btn.dataset.theme;
      setTheme(theme);

      themeButtons.forEach((b) => b.classList.toggle("active", b === btn));
      container.classList.remove("active");
    });
  });

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    container.classList.toggle("active");
  });

  document.addEventListener("click", () => {
    container.classList.remove("active");
  });
}
