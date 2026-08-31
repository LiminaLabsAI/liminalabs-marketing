/* ============================================================================
   liminalabs.in — the small amount of behaviour the site needs beyond Limen.
   One thing only: the Products menu in the nav.
   ========================================================================= */
(function () {
  "use strict";

  var OPEN_DELAY = 90;   /* ignore a pointer merely passing over the button */
  var CLOSE_DELAY = 260; /* survive the trip from button to panel, and slips */

  document.querySelectorAll("[data-site-menu]").forEach(function (menu) {
    var button = menu.querySelector(".site-menu__button");
    /* The panel lives outside the nav so its backdrop-filter can see the page
       — see .site-menu__panel in site.css. Find it by the button's target. */
    var panel = document.getElementById(button && button.getAttribute("aria-controls"));
    if (!button || !panel) return;

    function place() {
      var r = button.getBoundingClientRect();
      panel.style.top = Math.round(r.bottom + 10) + "px";
      var left = Math.round(r.left);
      var max = window.innerWidth - panel.offsetWidth - 16;
      panel.style.left = Math.max(16, Math.min(left, max)) + "px";
    }

    var openTimer = null;
    var closeTimer = null;

    function clearTimers() {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
      openTimer = closeTimer = null;
    }

    function set(state) {
      clearTimers();
      panel.hidden = !state;
      if (state) place();
      button.setAttribute("aria-expanded", state ? "true" : "false");
      menu.classList.toggle("is-open", state);
    }
    set(false);

    /* Intent, not raw events: a pointer crossing the button should not open
       the menu, and a pointer travelling toward the panel should not close it. */
    function wantOpen() {
      clearTimeout(closeTimer);
      if (!panel.hidden) return;
      openTimer = setTimeout(function () { set(true); }, OPEN_DELAY);
    }
    function wantClose() {
      clearTimeout(openTimer);
      closeTimer = setTimeout(function () {
        if (menu.contains(document.activeElement) || panel.contains(document.activeElement)) return;
        set(false);
      }, CLOSE_DELAY);
    }

    /* Hover covers the button, the panel and the gap the panel bridges in CSS.
       The panel is no longer a descendant, so it needs its own listeners. */
    menu.addEventListener("mouseenter", wantOpen);
    menu.addEventListener("mouseleave", wantClose);
    panel.addEventListener("mouseenter", wantOpen);
    panel.addEventListener("mouseleave", wantClose);
    window.addEventListener("resize", function () { if (!panel.hidden) place(); });

    /* Click is for touch and keyboard, and always wins over the timers. */
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      set(panel.hidden);
    });

    /* A pointer inside the panel must never let a stray close land. */
    panel.addEventListener("mouseenter", function () { clearTimeout(closeTimer); });

    document.addEventListener("click", function (e) {
      if (!menu.contains(e.target) && !panel.contains(e.target)) set(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) { set(false); button.focus(); }
    });
    function inside() {
      var a = document.activeElement;
      return menu.contains(a) || panel.contains(a);
    }
    [menu, panel].forEach(function (el) {
      el.addEventListener("focusin", function () { clearTimeout(closeTimer); });
      el.addEventListener("focusout", function () {
        setTimeout(function () { if (!inside()) set(false); }, 0);
      });
    });
  });
})();
