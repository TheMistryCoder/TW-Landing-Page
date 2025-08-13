document.addEventListener("DOMContentLoaded", () => {
  // ---------- Shortcuts ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => r.querySelectorAll(s);

  // ---------- Elements ----------
  const html       = document.documentElement;
  const header     = $("header");
  const toggleBtn  = $("#theme-toggle");
  const iconSlot   = $("#theme-icon");
  const menuBtn    = $("#mobile-menu-toggle");
  const menu       = $("#mobile-menu");
  const overlay    = $("#menu-overlay");

  if (!header || !menuBtn || !menu || !overlay) return;

  // ---------- State helpers ----------
  const hideOverlay = () => overlay.classList.add("opacity-0", "pointer-events-none");
  const showOverlay = () => overlay.classList.remove("opacity-0", "pointer-events-none");
  const isOpen      = () => !menu.classList.contains("translate-x-full");

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

  // ---------- Responsive offset under fixed header ----------
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

  // ---------- Menu wiring ----------
  menuBtn.setAttribute("aria-controls", "mobile-menu");
  menuBtn.setAttribute("aria-expanded", "false");

  menuBtn.addEventListener("click", () => (isOpen() ? closeMenu() : openMenu()));
  overlay.addEventListener("click", closeMenu);
  document.addEventListener("keydown", (e) => e.key === "Escape" && isOpen() && closeMenu(), { passive: true });
  // Close when a menu link is chosen
  $$("#mobile-menu a").forEach((a) => a.addEventListener("click", closeMenu));

  // Close on orientation change to avoid layout jumps
  window.addEventListener("orientationchange", closeMenu);

  // ---------- Theme toggle ----------
  // --- Theme: icons via template ---
const sunTemplate  = document.getElementById("icon-sun");
const moonTemplate = document.getElementById("icon-moon");

const setIcon = (isDark) => {
  const tpl = isDark ? sunTemplate : moonTemplate;
  iconSlot.innerHTML = ""; // clear
  if (tpl) {
    iconSlot.appendChild(tpl.content.cloneNode(true));
  }
};

const saved = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const isDark = saved === "dark" || (!saved && prefersDark);
html.setAttribute("data-theme", isDark ? "dark" : "light");
setIcon(isDark);

toggleBtn.addEventListener("click", () => {
  const wasDark = html.getAttribute("data-theme") === "dark";
  const next = wasDark ? "light" : "dark";
  html.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  setIcon(next === "dark");
});


  // ---------- Initial visibility ----------
  hideOverlay(); // ensure hidden until opened
});
