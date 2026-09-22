// OFF GRID — countdown to Foundation Festival 2026
(function () {
  var FEST_START = new Date("2026-10-05T00:00:00");
  var FEST_END = new Date("2026-10-10T00:00:00"); // end of Oct 9

  var grid = document.getElementById("countdown-grid");
  var message = document.getElementById("countdown-message");

  if (!grid) return;

  var els = {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    minutes: document.getElementById("cd-minutes"),
    seconds: document.getElementById("cd-seconds"),
  };

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function render() {
    var now = new Date();

    if (now >= FEST_START && now < FEST_END) {
      grid.style.display = "none";
      message.hidden = false;
      message.textContent = "OFF GRID IS LIVE NOW";
      return;
    }

    if (now >= FEST_END) {
      grid.style.display = "none";
      message.hidden = false;
      message.textContent = "See you next year";
      return;
    }

    var diff = FEST_START - now;
    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    var minutes = Math.floor((diff / (1000 * 60)) % 60);
    var seconds = Math.floor((diff / 1000) % 60);

    els.days.textContent = pad(days);
    els.hours.textContent = pad(hours);
    els.minutes.textContent = pad(minutes);
    els.seconds.textContent = pad(seconds);
  }

  render();
  setInterval(render, 1000);
})();
