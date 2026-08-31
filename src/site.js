/* ============================================================================
   liminalabs.in — the small amount of behaviour the site needs beyond Limen.
   One thing only: the Products menu in the nav.
   ========================================================================= */
(function () {
  "use strict";

  document.querySelectorAll("[data-site-menu]").forEach(function (menu) {
    var button = menu.querySelector(".site-menu__button");
    var panel = menu.querySelector(".site-menu__panel");
    if (!button || !panel) return;

    function open(state) {
      panel.hidden = !state;
      button.setAttribute("aria-expanded", state ? "true" : "false");
      menu.classList.toggle("is-open", state);
    }
    open(false);

    button.addEventListener("click", function (e) {
      e.stopPropagation();
      open(panel.hidden);
    });
    /* Pointer users expect hover; keyboard users get click and Escape. */
    menu.addEventListener("mouseenter", function () { open(true); });
    menu.addEventListener("mouseleave", function () {
      if (!menu.contains(document.activeElement)) open(false);
    });
    document.addEventListener("click", function (e) {
      if (!menu.contains(e.target)) open(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) { open(false); button.focus(); }
    });
    panel.addEventListener("focusout", function () {
      setTimeout(function () {
        if (!menu.contains(document.activeElement)) open(false);
      }, 0);
    });
  });
})();
