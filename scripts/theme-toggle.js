document.addEventListener("DOMContentLoaded", () => {
  // ---------- Shortcuts ----------
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => r.querySelectorAll(s);

  // ---------- MENU: slide-out, overlay, header offset ----------
  function initMenu() {
    const header  = $("header");
    const menuBtn = $("#mobile-menu-toggle");
    const menu    = $("#mobile-menu");
    const overlay = $("#menu-overlay");
    if (!header || !menuBtn || !menu || !overlay) return;

    const hideOverlay = () => overlay.classList.add("opacity-0", "pointer-events-none");
    const showOverlay = () => overlay.classList.remove("opacity-0", "pointer-events-none");
    const isOpen = () => !menu.classList.contains("translate-x-full");

    const openMenu = () => {
      menu.classList.remove("translate-x-full");
      menuBtn.classList.add("is-active");
      document.body.classList.add("overflow-hidden");
      showOverlay();
      menuBtn.setAttribute("aria-expanded", "true");
    };

    const closeMenu = () => {
      menu.classList.add("translate-x-full");
      menuBtn.classList.remove("is-active");
      document.body.classList.remove("overflow-hidden");
      hideOverlay();
      menuBtn.setAttribute("aria-expanded", "false");
    };

    // Responsive offset under fixed header
    let rafId = null;
    const setMenuOffset = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const h = Math.ceil(header.getBoundingClientRect().height);
        const top = `${h}px`;
        const height = `calc(100vh - ${h}px)`;
        if (menu.style.top !== top) menu.style.top = top;
        if (menu.style.height !== height) menu.style.height = height;
        if (overlay.style.top !== top) overlay.style.top = top;
        if (overlay.style.height !== height) overlay.style.height = height;
      });
    };

    setMenuOffset();
    window.addEventListener("resize", setMenuOffset, { passive: true });
    if ("ResizeObserver" in window) new ResizeObserver(setMenuOffset).observe(header);

    // Wiring
    menuBtn.setAttribute("aria-controls", "mobile-menu");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.addEventListener("click", () => (isOpen() ? closeMenu() : openMenu()));
    overlay.addEventListener("click", closeMenu);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) closeMenu();
    });
    $$("#mobile-menu a").forEach((a) => a.addEventListener("click", closeMenu));
    window.addEventListener("orientationchange", closeMenu);

    // Ensure overlay starts hidden
    hideOverlay();
  }

  // ---------- THEME: Daisy-style checkbox + persistence ----------
  function initTheme() {
    const html   = document.documentElement;
    const cb     = $("#theme-checkbox");      // new swap checkbox
    const oldBtn = $("#theme-toggle");        // old button (now hidden, but kept for safety)

    // Apply and persist theme. Also add/remove the 'dark' class for Tailwind dark: utilities.
    const applyTheme = (mode) => {
      html.setAttribute("data-theme", mode);
      if (mode === "dark") html.classList.add("dark");
      else html.classList.remove("dark");
      localStorage.setItem("theme", mode);
      if (cb) cb.checked = (mode === "dark"); // keep swap icons in sync
    };

    // Initial state
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const start = saved || (prefersDark ? "dark" : "light");
    applyTheme(start);

    // New checkbox toggle
    if (cb) {
      cb.addEventListener("change", (e) => {
        applyTheme(e.target.checked ? "dark" : "light");
      });
    }

    // Backwards compatibility: if old button exists, still works
    if (oldBtn) {
      oldBtn.addEventListener("click", () => {
        const isDark = html.classList.contains("dark");
        applyTheme(isDark ? "light" : "dark");
      });
    }
  }

  function initActiveNav() {
  const allNavLinks = () => document.querySelectorAll('.nav-link[href^="#"]');

  allNavLinks().forEach(link => {
    link.addEventListener('click', () => {
      const target = link.getAttribute('href'); // e.g. "#features"
      // Clear previous active
      allNavLinks().forEach(a => a.removeAttribute('aria-current'));
      // Set active on BOTH navs for the same target
      allNavLinks().forEach(a => {
        if (a.getAttribute('href') === target) {
          a.setAttribute('aria-current', 'page');
        }
      });
    });
  });
}


  // Initialise features independently
  initMenu();
  initTheme();
  initActiveNav();
});
