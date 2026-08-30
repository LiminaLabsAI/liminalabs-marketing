/* ============================================================================
   LIMEN — behaviour
   Five things only: theme, the floating nav, the logo lift, scroll reveals,
   and segmented controls. Everything else in the system is CSS.

   To avoid a flash of the wrong theme, put this in <head> before any CSS:
     <script>try{var t=localStorage.getItem("limina-theme");
       if(t)document.documentElement.dataset.theme=t;}catch(e){}</script>
   ========================================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var STORE = "limina-theme";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* --- Theme ------------------------------------------------------------ */
  function currentTheme() {
    if (root.dataset.theme) return root.dataset.theme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function setTheme(next) {
    root.dataset.theme = next;
    try { localStorage.setItem(STORE, next); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next === "dark" ? "#12141C" : "#F5F6FC");
    document.querySelectorAll("[data-lim-theme-toggle]").forEach(function (b) {
      b.setAttribute("aria-label", next === "dark" ? "Switch to light theme" : "Switch to dark theme");
    });
  }

  document.querySelectorAll("[data-lim-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  });
  setTheme(currentTheme());

  /* --- Floating nav ----------------------------------------------------- */
  var nav = document.querySelector("[data-lim-nav]");
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  var toggle = document.querySelector("[data-lim-nav-toggle]");
  var sheet = document.querySelector("[data-lim-nav-sheet]");
  if (toggle && sheet) {
    var openSheet = function (open) {
      sheet.dataset.open = open ? "true" : "false";
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    openSheet(false);

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      openSheet(sheet.dataset.open !== "true");
    });
    sheet.addEventListener("click", function (e) {
      if (e.target.closest("a")) openSheet(false);
    });
    document.addEventListener("click", function (e) {
      if (sheet.dataset.open === "true" && !sheet.contains(e.target)) openSheet(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && sheet.dataset.open === "true") {
        openSheet(false);
        toggle.focus();
      }
    });
  }

  /* --- Lift on entry -----------------------------------------------------
     The logo lift plays once, by design. At the top of a page that means on
     load; anywhere further down, firing on load means nobody ever sees it.
     data-lim-lift waits until the mark is actually on screen.
     The class is dropped again once the last bar lands. A one-shot animation
     must leave no state behind: if .lb-lift stayed on the nav mark, hovering
     it would swap to March and un-hovering would swap back — replaying the
     lift on every mouse-out. */
  function playLift(el) {
    if (el.limLiftEnd) el.removeEventListener("animationend", el.limLiftEnd);
    el.classList.remove("lb-lift");
    void el.getBoundingClientRect(); /* force reflow so the animation restarts */
    el.classList.add("lb-lift");

    var total = el.querySelectorAll(".lb-bar").length;
    var landed = 0;
    el.limLiftEnd = function () {
      if (++landed < total) return;
      el.removeEventListener("animationend", el.limLiftEnd);
      el.limLiftEnd = null;
      el.classList.remove("lb-lift"); /* end state and resting state are identical */
    };
    el.addEventListener("animationend", el.limLiftEnd);
  }

  var lifts = document.querySelectorAll("[data-lim-lift]");
  if (lifts.length && !reduced.matches) {
    if (!("IntersectionObserver" in window)) {
      lifts.forEach(playLift);
    } else {
      var lio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            playLift(en.target);
            lio.unobserve(en.target);
          }
        });
      }, { threshold: 0.5 });
      lifts.forEach(function (el) { lio.observe(el); });
    }
  }

  document.querySelectorAll("[data-lim-lift-replay]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.querySelector(btn.getAttribute("data-lim-lift-replay"));
      if (target) playLift(target);
    });
  });

  /* --- Reveal on scroll -------------------------------------------------- */
  var reveals = document.querySelectorAll(".lim-reveal");
  if (reveals.length) {
    if (!("IntersectionObserver" in window) || reduced.matches) {
      reveals.forEach(function (el) { el.classList.add("is-in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        });
      }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 });
      reveals.forEach(function (el) { io.observe(el); });
      /* Safety net: never leave content invisible. */
      setTimeout(function () {
        reveals.forEach(function (el) { el.classList.add("is-in"); });
      }, 4000);
    }
  }

  /* --- Segmented control -------------------------------------------------
     Roving tabindex, arrow keys, and an optional data-lim-seg-target that
     names the element whose [data-panel] children it shows. */
  document.querySelectorAll("[data-lim-seg]").forEach(function (seg) {
    var buttons = Array.prototype.slice.call(seg.querySelectorAll("button"));
    if (!buttons.length) return;

    var select = function (i, focus) {
      buttons.forEach(function (b, n) {
        b.setAttribute("aria-selected", n === i ? "true" : "false");
        b.tabIndex = n === i ? 0 : -1;
      });
      var targetSel = seg.getAttribute("data-lim-seg-target");
      if (targetSel) {
        var target = document.querySelector(targetSel);
        if (target) {
          target.querySelectorAll("[data-panel]").forEach(function (p, n) {
            p.hidden = n !== i;
          });
        }
      }
      if (focus) buttons[i].focus();
    };

    buttons.forEach(function (b, i) {
      b.addEventListener("click", function () { select(i, false); });
      b.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") n = Math.min(i + 1, buttons.length - 1);
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = Math.max(i - 1, 0);
        if (e.key === "Home") n = 0;
        if (e.key === "End") n = buttons.length - 1;
        if (n !== null) { e.preventDefault(); select(n, true); }
      });
    });

    var initial = buttons.findIndex(function (b) {
      return b.getAttribute("aria-selected") === "true";
    });
    select(initial < 0 ? 0 : initial, false);
  });
})();
