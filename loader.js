// OFF GRID — loading screen, logo handoff to the hero, then fade elements in and out on scroll
(function () {
  var root = document.documentElement;
  var loader = document.getElementById("loader");
  var fill = document.getElementById("loader-fill");
  var percent = document.getElementById("loader-percent");
  var loaderLogo = document.getElementById("loader-logo");
  var heroLogo = document.getElementById("hero-logo");

  // The hero logo arrives via the loader handoff, so it's left out of the scroll reveal
  // The footer's content fades, not the footer itself, so its background never flashes out
  var REVEAL = ".hero__subtitle, .hero > :not(.hero__titles), .section__heading, .card, .site-footer > *";
  var VISIBLE_RATIO = 0.2;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = [];

  // Start at the top so the logo handoff lands on the hero
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  // Put the reveal elements in their hidden state straight away, while the loader still
  // covers the page. Doing it at handoff made them fade out first, then back in.
  function hideRevealEls() {
    revealEls = Array.prototype.slice.call(document.querySelectorAll(REVEAL));

    // Stagger the hero pieces and cards so they come in one after another
    revealEls.filter(function (el) { return el.closest(".hero"); }).forEach(function (el, i) {
      el.style.setProperty("--reveal-delay", i * 0.12 + "s");
    });
    document.querySelectorAll(".card").forEach(function (el, i) {
      el.style.setProperty("--reveal-delay", i * 0.1 + "s");
    });

    revealEls.forEach(function (el) {
      el.style.transition = "none";
      el.classList.add("reveal");
    });
    void document.body.offsetHeight; // commit the hidden state before turning transitions back on
    revealEls.forEach(function (el) { el.style.removeProperty("transition"); });
  }

  hideRevealEls();

  // Show the page underneath the loader
  function prepareReveal() {
    root.classList.remove("is-loading");
  }

  function startReveal() {
    showScrollCue();

    if (!("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var el = entry.target;
        if (entry.intersectionRatio >= VISIBLE_RATIO) {
          el.classList.remove("is-above");
          el.classList.add("is-visible");
        } else {
          // Remember which edge it left by, so it slides out (and back in) that way
          el.classList.toggle("is-above", entry.boundingClientRect.top < 0);
          el.classList.remove("is-visible");
        }
      });
    }, { threshold: [0, VISIBLE_RATIO, 0.5] });

    // Let the hidden state paint first so the first reveal animates
    requestAnimationFrame(function () {
      revealEls.forEach(function (el) { observer.observe(el); });
    });

    // The hero stagger is for the first entrance only; scrolling back up shouldn't lag
    setTimeout(function () {
      revealEls.forEach(function (el) {
        if (el.closest(".hero")) el.style.removeProperty("--reveal-delay");
      });
    }, 1500);
  }

  // Side cue pointing to the open calls; hides once they're on screen
  function showScrollCue() {
    var cue = document.getElementById("scroll-cue");
    var target = document.getElementById("open-calls");
    if (!cue || !target) return;

    if (!("IntersectionObserver" in window)) {
      cue.classList.add("is-shown");
      return;
    }

    // Wait for the hero to finish coming in before pointing down
    setTimeout(function () {
      new IntersectionObserver(function (entries) {
        cue.classList.toggle("is-shown", !entries[0].isIntersecting);
      }, { rootMargin: "0px 0px -30% 0px" }).observe(target);
    }, 1000);
  }

  if (!loader) {
    prepareReveal();
    startReveal();
    return;
  }

  var DURATION = 1600; // time for the bar to go 0 → 100%
  var MAX_TIME = 6000; // never block the page if something hangs
  var MOVE_TIME = 900; // logo glide from the loader onto the hero
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

  function done() {
    loader.remove();
    startReveal();
  }

  // Plain fade: used for reduced motion or if the hero logo isn't there
  function fadeOut() {
    prepareReveal();
    loader.classList.add("is-done");
    setTimeout(done, 600);
  }

  // Glide the loader logo onto the hero logo, then dissolve into it
  function handoff() {
    root.classList.add("logo-pending");
    prepareReveal();

    var from = loaderLogo.getBoundingClientRect();
    var to = heroLogo.getBoundingClientRect();
    var scale = to.width / from.width;

    loader.classList.add("is-handoff");
    loaderLogo.style.transformOrigin = "0 0";
    loaderLogo.style.transition = "transform " + MOVE_TIME + "ms cubic-bezier(0.65, 0, 0.35, 1)";
    loaderLogo.style.transform =
      "translate(" + (to.left - from.left) + "px," + (to.top - from.top) + "px) scale(" + scale + ")";

    setTimeout(function () {
      // Hero logo is now directly underneath, so the fade is seamless
      root.classList.remove("logo-pending");
      loaderLogo.style.transition = "opacity 0.4s ease";
      loaderLogo.style.opacity = "0";
      startReveal();
      setTimeout(function () { loader.remove(); }, 400);
    }, MOVE_TIME);
  }

  function finish() {
    finished = true;
    setProgress(100);
    setTimeout(function () {
      if (reduceMotion || !heroLogo || !loaderLogo) fadeOut();
      else handoff();
    }, 300);
  }

  if (document.readyState === "complete") pageLoaded = true;
  else window.addEventListener("load", function () { pageLoaded = true; });
  requestAnimationFrame(tick);
})();
