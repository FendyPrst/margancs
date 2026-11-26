(function () {
  "use strict";

  const link = document.querySelector("[data-page-transition]");
  const wipe = document.getElementById("pageWipe");
  const panel = document.querySelector(".secret__inner");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Reduced-motion: biarkan browser terus ke page tanpa jeda */
  if (!link || !wipe || reduceMotion) return;

  const EXIT_MS = 560;

  link.addEventListener("click", (event) => {
    /* Hormati klik biasa / tab baru / klik tengah */
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    wipe.classList.add("is-active");
    if (panel) panel.classList.add("is-leaving");

    window.setTimeout(() => window.location.assign(link.href), EXIT_MS);
  });
})();
