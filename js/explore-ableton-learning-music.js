(function () {
  var TEMPO = 102, STEP = 60 / TEMPO / 4, BAR = STEP * 16;
  // [theme, track name, patterns: 16-char strings, one per bar; digit = scale degree, '.' = rest, 'x' = hit]
  var TRACKS = [
    ["a", "Drums", [["x...x...x...x...", "x.x.x.x.x.x.x.x."], ["x..xx..xx..xx..x"], ["x...x...x...x..x", "x...x...x.x.x..."], ["x..x..x.x..x..x."]]],
    ["d", "Bass", [["0...0...3...3...", "5...5...3...3..."], ["0.0.0.0.3.3.3.3."], ["0..0..0.3..3..3.", "5..5..5.3..3..3."], ["0.....0.3.....3."]]],
    ["c", "Chords", [["0...............", "3..............."], ["0...3...0...3..."], ["0.......4.......", "3.......5......."], ["0.0.....3.3....."]]],
    ["e", "Melodies", [["4...5...6...4...", "7...6...5...4..."], ["4.5.6.7.6.5.4.5."], ["4...5.6.7...6...", "5...4...2...4..."], ["7.......6.......", "5.......4......."]]]
  ];
  var MINOR = [0, 2, 3, 5, 7, 8, 10, 12];
  var ctx, clock, nextBar, step = 0;
  var active = [], queued = []; // per track: clip index or -1
  var buttons = [];

  function freq(track, deg) {
    var base = [0, 33, 57, 69][track]; // MIDI base per track (drums unused)
    return 440 * Math.pow(2, (base + 12 + MINOR[deg % 8] - 69 + (deg > 7 ? 12 : 0)) / 12);
  }

  function tone(track, deg, t) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = ["sine", "square", "sawtooth", "triangle"][track];
    o.frequency.value = freq(track, deg);
    var len = [0, STEP * 3, STEP * 6, STEP * 2][track];
    var vol = [0, .18, .08, .15][track];
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(.001, t + len);
    o.connect(g).connect(ctx.destination);
    o.start(t); o.stop(t + len);
  }

  function drum(s, t, accent) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    var kick = s % 8 === 0 || s % 8 === 3 || s % 8 === 6;
    o.type = "sine";
    o.frequency.setValueAtTime(kick ? 150 : 400, t);
    o.frequency.exponentialRampToValueAtTime(kick ? 40 : 200, t + .12);
    g.gain.setValueAtTime(accent ? .5 : .3, t);
    g.gain.exponentialRampToValueAtTime(.001, t + .15);
    o.connect(g).connect(ctx.destination);
    o.start(t); o.stop(t + .16);
  }

  function schedule() {
    while (nextBar < ctx.currentTime + .2) {
      var tm = nextBar;
      if (step === 0) { // bar boundary: apply queued clips
        for (var i = 0; i < TRACKS.length; i++) if (queued[i] !== null) { active[i] = queued[i]; queued[i] = null; }
        render();
      }
      TRACKS.forEach(function (tr, i) {
        if (active[i] < 0) return;
        var bars = tr[2][active[i]];
        var pat = bars[Math.floor(barCount / 1) % bars.length];
        var c = pat[step];
        if (c === ".") return;
        if (i === 0) drum(step, tm, step % 4 === 0);
        else tone(i, +c, tm);
      });
      nextBar += STEP;
      if (++step === 16) { step = 0; barCount++; }
    }
  }
  var barCount = 0;

  function toggle(t, c) {
    ensureAudio();
    var cur = queued[t] !== null ? queued[t] : active[t];
    queued[t] = cur === c ? -1 : c;
    if (!clock) start();
    render();
    save();
  }

  function ensureAudio() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
  }

  function start() {
    nextBar = ctx.currentTime + .05; step = 0; barCount = 0;
    clock = setInterval(schedule, 25);
  }

  function stopIfIdle() {
    if (clock && active.every(function (a) { return a < 0; }) && queued.every(function (q) { return q === null || q < 0; })) {
      clearInterval(clock); clock = null;
    }
  }

  function render() {
    buttons.forEach(function (row, t) {
      row.forEach(function (b, c) {
        b.classList.toggle("on", active[t] === c);
        b.classList.toggle("queued", queued[t] === c);
      });
    });
    stopIfIdle();
  }

  function save() { try { localStorage.setItem("alm-clone", "1"); } catch (e) {} }

  var root = document.getElementById("session");
  TRACKS.forEach(function (tr, t) {
    active[t] = -1; queued[t] = null; buttons[t] = [];
  });
  // grid is row-per-clip, column-per-track
  for (var c = 0; c < 4; c++) {
    TRACKS.forEach(function (tr, t) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "clip t-" + tr[0];
      b.textContent = tr[1] + " " + (c + 1);
      b.setAttribute("aria-pressed", "false");
      (function (t, c) { b.addEventListener("click", function () { toggle(t, c); }); })(t, c);
      buttons[t][c] = b;
      root.appendChild(b);
    });
  }

  var nav = document.getElementById("chapters");
  document.getElementById("menu-open").addEventListener("click", function () { nav.hidden = false; });
  document.getElementById("menu-close").addEventListener("click", function () { nav.hidden = true; });
  document.getElementById("reset").addEventListener("click", function () { location.reload(); });
})();
