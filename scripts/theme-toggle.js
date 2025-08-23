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
    const html     = document.documentElement;
    const cbMain   = $("#theme-checkbox");          // desktop
    const cbMobile = $("#theme-checkbox-mobile");   // mobile
    const btnLight = $("#theme-light-trigger");
    const btnDark  = $("#theme-dark-trigger");

    const applyTheme = (mode) => {
      html.setAttribute("data-theme", mode);
      if (mode === "dark") html.classList.add("dark");
      else html.classList.remove("dark");
      localStorage.setItem("theme", mode);
      if (cbMain) cbMain.checked = (mode === "dark");
      if (cbMobile) cbMobile.checked = (mode === "dark");
    };

    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));

    if (cbMain)   cbMain.addEventListener("change", (e) => applyTheme(e.target.checked ? "dark" : "light"));
    if (cbMobile) cbMobile.addEventListener("change", (e) => applyTheme(e.target.checked ? "dark" : "light"));

    // Make the labels clickable
    if (btnLight) btnLight.addEventListener("click", () => applyTheme("light"));
    if (btnDark)  btnDark.addEventListener("click",  () => applyTheme("dark"));
  }

  // ---------- NAV: click-to-activate (kept) ----------
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

  // ---------- NAV: scroll-spy to keep active state in sync while scrolling ----------
  function initScrollSpy() {
    const navLinks = Array.from(document.querySelectorAll('a.nav-link[href^="#"]'));
    if (!navLinks.length || !("IntersectionObserver" in window)) return;

    // Map id -> NodeList of matching links in both navs
    const idToLinks = {};
    const ids = [];
    for (const a of navLinks) {
      const hash = a.getAttribute('href') || '';
      const id = hash.startsWith('#') ? hash.slice(1) : '';
      if (!id) continue;
      if (!idToLinks[id]) {
        idToLinks[id] = document.querySelectorAll(`a.nav-link[href="#${id}"]`);
        ids.push(id);
      }
    }

    // Existing sections
    const sections = ids
      .map(id => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return;

    const header = document.querySelector('header');
    const topOffset = (header?.offsetHeight || 0) + 8; // cushion for the fixed header

    const setActive = (id) => {
      navLinks.forEach(a => a.removeAttribute('aria-current'));
      if (id && idToLinks[id]) {
        idToLinks[id].forEach(a => a.setAttribute('aria-current', 'page'));
      }
    };

    const maybeActivateTop = () => {
      const hasTopLink = !!idToLinks["top"];
      if (hasTopLink && window.scrollY < 100) setActive("top");
    };

    const io = new IntersectionObserver((entries) => {
      // Choose the entry nearest to the top that is intersecting
      let candidate = null;
      let bestTop = Infinity;

      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const rect = entry.target.getBoundingClientRect();
        const distance = Math.abs(rect.top - topOffset);
        if (distance < bestTop) {
          bestTop = distance;
          candidate = entry.target;
        }
      }

      if (candidate) setActive(candidate.id);
    }, {
      root: null,
      rootMargin: `-${topOffset}px 0px -55% 0px`,
      threshold: 0.25
    });

    sections.forEach(sec => io.observe(sec));

    // Initial highlight / top-of-page behaviour
    maybeActivateTop();
    window.addEventListener('scroll', maybeActivateTop, { passive: true });
  }

  // Initialise features independently
  initMenu();
  initTheme();
  initActiveNav();
  initScrollSpy();
});
