// scripts/theme-toggle.js
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

  // ---------- NAV: click-to-activate ----------
  // Keeps desktop and mobile nav in sync using aria-current="page"
  function initActiveNav() {
    const allNavLinks = () => document.querySelectorAll('.nav-link[href^="#"]');

    allNavLinks().forEach((link) => {
      link.addEventListener("click", () => {
        const target = link.getAttribute("href"); // e.g. "#features"
        // Clear previous
        allNavLinks().forEach((a) => a.removeAttribute("aria-current"));
        // Set on both navs for the same target
        allNavLinks().forEach((a) => {
          if (a.getAttribute("href") === target) a.setAttribute("aria-current", "page");
        });
      });
    });
  }

  // ---------- NAV: lightweight scroll-spy (uses section tops + header offset) ----------
function initScrollSpy() {
  const navLinks = Array.from(document.querySelectorAll('a.nav-link[href^="#"]'));
  if (!navLinks.length) return;

  // Map: id -> all matching links (desktop + mobile)
  const idToLinks = {};
  const sections = [];

  for (const a of navLinks) {
    const hash = a.getAttribute('href') || '';
    const id = hash.startsWith('#') ? hash.slice(1) : '';
    if (!id) continue;

    if (!idToLinks[id]) {
      idToLinks[id] = document.querySelectorAll(`a.nav-link[href="#${id}"]`);
      const sec = document.getElementById(id);
      if (sec) sections.push(sec);
    }
  }
  if (!sections.length) return;

  const header = document.querySelector('header');
  const topOffset = () => (header?.offsetHeight || 0) + 8;

  let positions = [];     // [{ id, top }]
  let activeId = null;
  let raf = null;

  const setActive = (id) => {
    if (id === activeId) return;
    navLinks.forEach(a => a.removeAttribute('aria-current'));
    if (id && idToLinks[id]) idToLinks[id].forEach(a => a.setAttribute('aria-current', 'page'));
    activeId = id;
  };

  const recalc = () => {
    positions = sections
      .map(sec => ({
        id: sec.id,
        top: Math.round(window.pageYOffset + sec.getBoundingClientRect().top)
      }))
      .sort((a, b) => a.top - b.top);
  };

  const tick = () => {
    raf = null;
    const pos = window.scrollY + topOffset();

    // pick the last section whose top is above the header line
    let current = positions[0]?.id || null;
    for (let i = 0; i < positions.length; i++) {
      if (pos >= positions[i].top) current = positions[i].id;
      else break;
    }

    // handle very top of page
    if (window.scrollY <= topOffset()) {
      const topId = (idToLinks['home'] && 'home') || (idToLinks['top'] && 'top') || positions[0]?.id;
      setActive(topId || current);
    } else {
      setActive(current);
    }
  };

  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(tick);
  };

  // boot
  recalc();
  // honour hash on load
  const hash = location.hash && location.hash.startsWith('#') ? location.hash.slice(1) : '';
  if (hash && idToLinks[hash]) setActive(hash); else tick();

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { recalc(); tick(); }, { passive: true });
  if ('ResizeObserver' in window && header) new ResizeObserver(() => { recalc(); tick(); }).observe(header);
}


  // Initialise features independently
  initMenu();
  initTheme();
  initActiveNav();
  initScrollSpy();
});
