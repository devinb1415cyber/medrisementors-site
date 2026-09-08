/* Branded page transition.
   Leaving a page: a paper veil with the MedRise logo covers the screen,
   then we navigate. The destination page renders the same veil already
   covering (set pre-paint via a sessionStorage flag), and this script
   lifts it to reveal the fresh page — so there is no white flash.

   Fail-safes: an inline pre-paint script also arms a timeout to clear the
   veil if this file never loads, and prefers-reduced-motion skips it all. */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Arriving through a transition: lift the veil ----
  if (root.classList.contains("bv-show")) {
    try { sessionStorage.removeItem("ptNav"); } catch (e) {}
    // re-enable transitions (they were off for the instant cover), then fade out
    requestAnimationFrame(function () {
      root.classList.remove("bv-instant");
      void document.body.offsetWidth; // force reflow so the next change animates
      requestAnimationFrame(function () { root.classList.remove("bv-show"); });
    });
  }

  if (reduce) return; // no cover animation on the way out either

  // ---- Leaving: cover with the logo, then navigate ----
  var COVER_MS = 400;
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var a = e.target.closest && e.target.closest("a");
    if (!a) return;
    if (a.target && a.target !== "" && a.target !== "_self") return;
    if (a.hasAttribute("download")) return;

    var url;
    try { url = new URL(a.href, location.href); } catch (_) { return; }
    if (url.origin !== location.origin) return;
    if (url.protocol !== "http:" && url.protocol !== "https:") return;
    if (url.pathname === location.pathname) return; // same page / in-page anchor

    e.preventDefault();
    if (root.classList.contains("bv-show")) return;
    try { sessionStorage.setItem("ptNav", "1"); } catch (_) {}
    root.classList.add("bv-show"); // fade the veil in
    setTimeout(function () { location.href = a.href; }, COVER_MS);
  });

  // Returning via the back/forward cache: never leave the veil stuck up.
  window.addEventListener("pageshow", function () {
    root.classList.remove("bv-show", "bv-instant");
    try { sessionStorage.removeItem("ptNav"); } catch (_) {}
  });
})();
