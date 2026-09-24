// OFF GRID — loading screen, then fade elements in and out on scroll
(function () {
  var root = document.documentElement;
  var loader = document.getElementById("loader");
  var fill = document.getElementById("loader-fill");
  var percent = document.getElementById("loader-percent");

  var REVEAL = ".hero > *, .section__heading, .card, .site-footer";

  function startReveal() {
    var els = document.querySelectorAll(REVEAL);

    // Stagger the hero pieces so they come in one after another
    document.querySelectorAll(".hero > *").forEach(function (el, i) {
      el.style.setProperty("--reveal-delay", i * 0.12 + "s");
    });
    document.querySelectorAll(".card").forEach(function (el, i) {
      el.style.setProperty("--reveal-delay", i * 0.1 + "s");
    });

    els.forEach(function (el) {
      el.classList.add("reveal");
    });

    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    }, { threshold: 0.15 });

    // Let the hidden state paint first so the first reveal animates
    requestAnimationFrame(function () {
      root.classList.remove("is-loading");
      requestAnimationFrame(function () {
        els.forEach(function (el) { observer.observe(el); });
      });
    });
  }

  if (!loader) {
    root.classList.remove("is-loading");
    return;
  }

  var DURATION = 1600; // time for the bar to go 0 → 100%
  var MAX_TIME = 6000; // never block the page if something hangs
  var start = performance.now();
  var pageLoaded = false;
  var finished = false;

  function setProgress(p) {
    fill.style.width = p + "%";
    percent.textContent = p + "%";
  }

  // Count up steadily, but hold at 99% until the page has actually loaded
  function tick(now) {
    if (finished) return;
    var p = Math.min(100, Math.round(((now - start) / DURATION) * 100));
    if (!pageLoaded && now - start < MAX_TIME) p = Math.min(p, 99);
    setProgress(p);
    if (p >= 100) finish();
    else requestAnimationFrame(tick);
  }

  function finish() {
    finished = true;
    setProgress(100);
    setTimeout(function () {
      loader.classList.add("is-done");
      setTimeout(function () {
        loader.remove();
        startReveal();
      }, 500);
    }, 300);
  }

  if (document.readyState === "complete") pageLoaded = true;
  else window.addEventListener("load", function () { pageLoaded = true; });
  requestAnimationFrame(tick);
})();
