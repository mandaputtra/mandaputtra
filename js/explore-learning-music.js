(function () {
const BPM = 112;
const BAR_STEPS = 16;
const PHRASE_BARS = 4;
const STEP = 60 / BPM / 4;
const SWING = 0.16;
const STRUM = 0.012;
const TICK_MS = 25;
const LOOKAHEAD = 0.2;
const CATCHUP_SLACK = 0.05;
const MASTER_CAP = 0.8;
const STOP_FADE = 0.03;
const STOP_RESTORE = 0.25;
const RESTORE_RAMP = 0.01;
const UNLOCK_SETTLE_MS = 1500;
const HIDE_RAMP = 0.3;
const SHOW_RAMP = 0.4;
const TEXT = {
  id: {
    back: "Explore",
    title: "Buat Lagu",
    intro: "Pilih satu kotak di setiap kolom.",
    tap: "Ketuk kotak untuk memulai. Ketuk lagi untuk berhenti.",
    noAudio: "Browser ini tidak bisa memutar suara.",
    song: "Lagu kamu",
    stop: "Berhenti",
    resume: "Ketuk untuk lanjut bermain",
    silent: "Tidak ada suara? Minta orang dewasa memeriksa suaranya.",
    grownUps: "Untuk orang dewasa: pelankan volume, terutama saat memakai headphone.",
    unofficial: "Tidak resmi. Tidak dibuat oleh atau berafiliasi dengan Ableton.",
    inspired: "Terinspirasi dari Ableton Learning Music",
    noscript: "Halaman ini butuh JavaScript untuk memutar suara.",
    track0: "Drum",
    track1: "Bass",
    track2: "Akord",
    track3: "Melodi",
    starting: ", akan mulai",
    stopping: ", akan berhenti",
  },
  en: {
    back: "Explore",
    title: "Make a Song",
    intro: "Pick a box in each column.",
    tap: "Tap a box to start it. Tap again to stop.",
    noAudio: "This browser cannot play the sounds.",
    song: "Your song",
    stop: "Stop",
    resume: "Tap to keep playing",
    silent: "No sound? Ask a grown-up to check the sound.",
    grownUps: "Grown-ups: keep the volume low, especially with headphones.",
    unofficial: "Unofficial. Not made by or affiliated with Ableton.",
    inspired: "Inspired by Ableton Learning Music",
    noscript: "This page needs JavaScript to play sounds.",
    track0: "Drums",
    track1: "Bass",
    track2: "Chords",
    track3: "Melody",
    starting: ", starting",
    stopping: ", stopping",
  },
};

// Every clip follows one 4-bar progression (Am7 | Fmaj7 | C | Gadd9),
// so any mix of clips stays in key.
const PROGRESSION = [
  { bass: { R: "A1", P: "E2", O: "A2" }, keys: ["A3", "C4", "E4", "G4"] },
  { bass: { R: "F1", P: "C2", O: "F2" }, keys: ["A3", "C4", "E4", "F4"] },
  { bass: { R: "C2", P: "G2", O: "C3" }, keys: ["G3", "C4", "E4", "G4"] },
  { bass: { R: "G1", P: "D2", O: "G2" }, keys: ["G3", "B3", "D4", "A4"] },
];

// A bar is 16 tokens: a note starts a hit, "-" holds it, "." rests.
function melodicBar(line, pick) {
  const list = line.trim().split(/\s+/);
  if (list.length !== BAR_STEPS) throw new Error("alm: bar needs 16 steps: " + line);
  return list.map((tok, i) => {
    if (tok === "-" || tok === ".") return [];
    let len = 1;
    while (list[i + len] === "-") len++;
    return [{ notes: pick(tok), len, vel: i % 4 === 0 ? 0.9 : 0.7 }];
  });
}

// R = root, P = fifth, O = octave of the current chord.
const bassClip = (line) => PROGRESSION.map((ch) => melodicBar(line, (tok) => [ch.bass[tok] || tok]));
// x = whole chord, 1-4 = one chord tone.
const chordClip = (line) =>
  PROGRESSION.map((ch) => melodicBar(line, (tok) => (tok === "x" ? ch.keys : [ch.keys[Number(tok) - 1]])));
const melodyClip = (...lines) => lines.map((line) => melodicBar(line, (tok) => [tok]));

// Drum lanes: X accent, x hit, o ghost. A lane is one bar, or four bars for fills.
const DRUM_VEL = { X: 1, x: 0.75, o: 0.35 };
function drumClip(lanes) {
  return Array.from({ length: PHRASE_BARS }, (_, b) =>
    Array.from({ length: BAR_STEPS }, (_, step) =>
      Object.entries(lanes).flatMap(([lane, bars]) => {
        const list = [].concat(bars);
        const vel = DRUM_VEL[list[b % list.length][step]];
        return vel ? [{ lane, vel }] : [];
      }),
    ),
  );
}

const CLIPS = [
  [
    drumClip({
      kick: "X.....x...X.....",
      snare: "....X.......X...",
      closed: "x.x.x.x.x.x.x.x.",
    }),
    drumClip({
      kick: "X...X...X...X...",
      snare: "....X.......X...",
      closed: "xo.oxo.oxo.oxo.o",
      open: "..x...x...x...x.",
    }),
    drumClip({
      kick: ["X..x......X.....", "X..x......X.....", "X..x......X.....", "X..x......X..x.x"],
      snare: "....X..o.o..X...",
      closed: "x.xxx.x.x.xxx.x.",
    }),
    drumClip({
      kick: "X.........X..x..",
      snare: ["........X.......", "........X.......", "........X.......", "........X..oX.XX"],
      closed: "x.x.x.x.x.x.x...",
      open: "..............x.",
    }),
  ],
  [
    bassClip("R - - - - - - - - - - - - - . ."),
    bassClip("R . R . O . R . R . O . R . P ."),
    bassClip("R - - R . . O . . R . . P - . ."),
    bassClip("R - . R - . R - . . R - O - . ."),
  ],
  [
    chordClip("x - - - - - - - - - - - - - - -"),
    chordClip(". . x . . . x . . . x . . . x ."),
    chordClip("x - - x - - x - - - x - . . . ."),
    chordClip("1 . 2 . 3 . 4 . 3 . 2 . 1 . 2 ."),
  ],
  [
    melodyClip(
      "E5 - - . E5 . D5 . C5 - - . A4 - - .",
      "C5 - - . C5 . A4 . C5 - - - . . . .",
      "E5 - - . E5 . G5 . E5 - - . D5 - C5 -",
      "D5 - - - - - - - . . B4 . D5 . . .",
    ),
    melodyClip(
      "A4 . C5 . . E5 . . G5 - . E5 . . . .",
      "A4 . C5 . . E5 . . F5 - . E5 . . . .",
      "G4 . C5 . . E5 . . G5 - . E5 . . . .",
      "G4 . B4 . . D5 . . A5 - - - G5 - . .",
    ),
    melodyClip(
      ". . . . . . A5 - G5 - E5 - - - . .",
      ". . . . . . A5 - G5 - E5 - C5 - - -",
      ". . . . . . G5 - E5 - D5 - - - . .",
      ". . . . . . D5 - E5 - D5 - B4 - - -",
    ),
    melodyClip(
      "A4 C5 E5 A5 G5 E5 C5 E5 A4 C5 E5 A5 G5 E5 D5 C5",
      "A4 C5 F5 A5 G5 F5 C5 F5 A4 C5 F5 A5 G5 F5 E5 C5",
      "G4 C5 E5 G5 E5 C5 G4 C5 E5 G5 C6 G5 E5 D5 C5 D5",
      "G4 B4 D5 G5 D5 B4 G4 B4 D5 G5 A5 G5 D5 B4 A4 G4",
    ),
  ],
];

let env = null;
let els = null;
let state = initialState();
let view = initialView(false, false);
let rt = initialRuntime();

function initialState() {
  return {
    active: [-1, -1, -1, -1],
    queued: [null, null, null, null],
    bar: -1,
    step: 0,
    nextBar: 0,
  };
}

function initialView(reducedMotion, noAudio) {
  return {
    shownActive: [-1, -1, -1, -1],
    shownBar: 0,
    boundaryTime: 0,
    events: [],
    audio: "none",
    noAudio,
    reducedMotion,
    lang: "id",
  };
}

function initialRuntime() {
  return {
    ctx: null,
    master: null,
    instruments: null,
    timer: null,
    rafId: null,
    muteUntil: 0,
    settleTimer: null,
  };
}

function tap(s, p) {
  const target = s.active[p.t] === p.c ? -1 : p.c;
  const queued = s.queued.slice();
  queued[p.t] = s.queued[p.t] === target ? null : target;
  return { ...s, queued };
}

function tapGate(s, p, audioRunning) {
  if (!audioRunning && s.queued[p.t] === p.c && s.active[p.t] !== p.c) return s;
  return tap(s, p);
}

function displayState(a, q, c) {
  if (a === c && (q === null || q === c)) return "playing";
  if (a === c) return "pending-off";
  if (q === c) return "pending-on";
  return "off";
}

function displayQueued(v, s, t) {
  const event = v.events.find((e) => e.active[t] !== v.shownActive[t]);
  if (event !== undefined) return event.active[t];
  if (s.queued[t] !== null) return s.queued[t];
  return null;
}

function anyActive(s) {
  return s.active.some((a) => a >= 0) || s.queued.some((q) => q !== null && q >= 0);
}

function audioBlocked(v, s) {
  return (v.audio === "suspended" || v.audio === "interrupted") && anyActive(s);
}

function stateText(d, lang) {
  if (d === "pending-on") return TEXT[lang].starting;
  if (d === "pending-off") return TEXT[lang].stopping;
  return "";
}

function commitBoundary(s) {
  const active = s.active.map((a, t) => (s.queued[t] === null ? a : s.queued[t]));
  return { ...s, active, queued: [null, null, null, null], bar: s.bar + 1 };
}

function notesForStep(s, step, time) {
  const b = s.bar % PHRASE_BARS;
  const at = time + (step % 2 ? SWING * STEP : 0);
  const notes = [];
  for (let t = 0; t < 4; t++) {
    if (s.active[t] < 0) continue;
    for (const ev of CLIPS[t][s.active[t]][b][step]) notes.push({ ...ev, track: t, time: at });
  }
  return notes;
}

function drainEvents(v, now) {
  let count = 0;
  while (count < v.events.length && v.events[count].time <= now) count++;
  if (count === 0) return v;
  const last = v.events[count - 1];
  return {
    ...v,
    shownActive: last.active.slice(),
    shownBar: last.bar,
    boundaryTime: last.time,
    events: v.events.slice(count),
  };
}

function progress(v, now) {
  let stepNow = Math.min(Math.max(Math.floor((now - v.boundaryTime) / STEP), 0), BAR_STEPS - 1);
  if (v.reducedMotion) stepNow = Math.floor(stepNow / 4) * 4;
  return ((v.shownBar % PHRASE_BARS) * BAR_STEPS + stepNow) / (PHRASE_BARS * BAR_STEPS);
}

function clampGain(x) {
  return Math.min(Math.max(x, 0), MASTER_CAP);
}

const bus = {
  anchor(p, t0) {
    if (p.cancelAndHoldAtTime) {
      p.cancelAndHoldAtTime(t0);
    } else {
      p.cancelScheduledValues(t0);
      p.setValueAtTime(clampGain(p.value), t0);
    }
  },
  rampTo(target, dur) {
    const p = rt.master.gain;
    const t0 = rt.ctx.currentTime;
    bus.anchor(p, t0);
    p.linearRampToValueAtTime(clampGain(target), t0 + dur);
  },
  fadeOutIn(t0, target) {
    const p = rt.master.gain;
    bus.anchor(p, t0);
    p.linearRampToValueAtTime(0, t0 + STOP_FADE);
    p.setValueAtTime(0, t0 + STOP_RESTORE);
    p.linearRampToValueAtTime(clampGain(target), t0 + STOP_RESTORE + RESTORE_RAMP);
  },
};

function createInstruments(out) {
  const glue = new Tone.Compressor({ threshold: -18, ratio: 3, attack: 0.01, release: 0.2 }).connect(out);
  const reverb = new Tone.Reverb({ decay: 3, preDelay: 0.02, wet: 1 }).connect(glue);
  const echo = new Tone.FeedbackDelay({ delayTime: STEP * 3, feedback: 0.35, wet: 1 });
  echo.chain(new Tone.Filter(2500, "lowpass"), glue);
  const wire = (node, verb = 0, delay = 0) => {
    node.connect(glue);
    if (verb) node.connect(new Tone.Gain(verb).connect(reverb));
    if (delay) node.connect(new Tone.Gain(delay).connect(echo));
    return node;
  };

  const kick = wire(new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 5,
    envelope: { attack: 0.001, decay: 0.45, sustain: 0, release: 0.1 },
    volume: -2,
  }));
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 0.18, sustain: 0 },
    volume: -8,
  });
  snare.connect(wire(new Tone.Filter({ type: "bandpass", frequency: 2000, Q: 0.8 }), 0.2));
  const snareBody = wire(new Tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 2,
    envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.05 },
    volume: -10,
  }));
  const hatFilter = wire(new Tone.Filter(7500, "highpass"), 0.1);
  const closed = new Tone.NoiseSynth({ envelope: { attack: 0.001, decay: 0.035, sustain: 0 }, volume: -14 }).connect(hatFilter);
  const open = new Tone.NoiseSynth({ envelope: { attack: 0.001, decay: 0.28, sustain: 0 }, volume: -17 }).connect(hatFilter);

  const bass = wire(new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    filter: { type: "lowpass", rolloff: -24, Q: 2 },
    envelope: { attack: 0.005, decay: 0.3, sustain: 0.6, release: 0.08 },
    filterEnvelope: { attack: 0.005, decay: 0.25, sustain: 0.25, release: 0.1, baseFrequency: 90, octaves: 3.2 },
    volume: -6,
  }));
  const keys = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 3,
    modulationIndex: 8,
    oscillator: { type: "sine" },
    modulation: { type: "sine" },
    envelope: { attack: 0.004, decay: 1.6, sustain: 0.15, release: 1.2 },
    modulationEnvelope: { attack: 0.002, decay: 0.4, sustain: 0.05, release: 0.4 },
    volume: -14,
  });
  keys.connect(wire(new Tone.Chorus(3, 2.5, 0.4).start(), 0.3, 0.12));
  const lead = wire(new Tone.MonoSynth({
    oscillator: { type: "square" },
    filter: { type: "lowpass", rolloff: -12, Q: 1 },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.3 },
    filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.3, baseFrequency: 700, octaves: 2 },
    volume: -12,
  }), 0.25, 0.3);

  return {
    drums: {
      kick: (time, vel) => kick.triggerAttackRelease("A1", 0.3, time, vel),
      snare: (time, vel) => {
        snare.triggerAttackRelease(0.15, time, vel);
        snareBody.triggerAttackRelease("G3", 0.08, time, vel * 0.6);
      },
      closed: (time, vel) => closed.triggerAttackRelease(0.03, time, vel),
      open: (time, vel) => open.triggerAttackRelease(0.2, time, vel),
    },
    bass,
    keys,
    lead,
    mono: [kick, snare, snareBody, closed, open, bass, lead],
  };
}

const voices = {
  play(inst, n) {
    const vel = n.vel * (0.9 + Math.random() * 0.1);
    if (n.track === 0) {
      inst.drums[n.lane](n.time, vel);
      return;
    }
    const dur = n.len * STEP;
    if (n.track === 2) {
      n.notes.forEach((note, i) => inst.keys.triggerAttackRelease(note, dur, n.time + i * STRUM, vel));
    } else {
      (n.track === 1 ? inst.bass : inst.lead).triggerAttackRelease(n.notes[0], dur - 0.01, n.time, vel);
    }
  },
  releaseAll(inst, t) {
    for (const synth of inst.mono) synth.triggerRelease(t);
    inst.keys.releaseAll(t);
  },
};

function start() {
  const now = rt.ctx.currentTime;
  const lastEvent = view.events.length ? view.events[view.events.length - 1].time : 0;
  state.nextBar = Math.max(now + CATCHUP_SLACK, rt.muteUntil, lastEvent);
  state.step = 0;
  state.bar = -1;
  rt.timer = env.setInterval(tick, TICK_MS);
  ensureFrame();
}

function ensureFrame() {
  if (rt.rafId !== null) return;
  rt.rafId = env.raf(frame);
}

function startIfIdle() {
  if (rt.ctx === null || rt.ctx.state !== "running") return;
  if (rt.timer !== null) return;
  if (!anyActive(state)) return;
  start();
}

function stopIfIdle() {
  if (state.active.some((a) => a >= 0) || state.queued.some((q) => q !== null)) return false;
  env.clearInterval(rt.timer);
  rt.timer = null;
  return true;
}

function tick() {
  const now = rt.ctx.currentTime;
  if (state.nextBar < now) state.nextBar = now + CATCHUP_SLACK;
  while (state.nextBar < now + LOOKAHEAD) {
    if (state.step === 0) {
      state = commitBoundary(state);
      view.events.push({ time: state.nextBar, active: state.active.slice(), bar: state.bar });
      if (stopIfIdle()) return;
    }
    for (const note of notesForStep(state, state.step, state.nextBar)) {
      voices.play(rt.instruments, note);
    }
    state.nextBar += STEP;
    state.step = (state.step + 1) % BAR_STEPS;
  }
}

function audibleNow() {
  if (rt.ctx === null) return 0;
  return rt.ctx.currentTime - ((rt.ctx.baseLatency || 0) + (rt.ctx.outputLatency || 0));
}

function frame() {
  rt.rafId = null;
  if (rt.ctx === null || rt.ctx.state !== "running") {
    render(view, state, 0);
    return;
  }
  const now = audibleNow();
  view = drainEvents(view, now);
  render(view, state, now);
  if (rt.timer === null && view.events.length === 0) return;
  rt.rafId = env.raf(frame);
}

function render(v, s, now) {
  if (els === null) return;
  const done = progress(v, now) * 100 + "%";
  for (let t = 0; t < 4; t++) {
    for (let c = 0; c < 4; c++) {
      const d = displayState(v.shownActive[t], displayQueued(v, s, t), c);
      const pad = els.pads[t][c];
      pad.className = "clip t-" + t + " is-" + d;
      pad.setAttribute("aria-pressed", String(v.shownActive[t] === c));
      if (v.noAudio) pad.setAttribute("aria-disabled", "true");
      els.padState[t][c].textContent = stateText(d, v.lang);
      els.progress[t][c].style.width = v.shownActive[t] === c ? done : "0%";
    }
  }
  const blocked = audioBlocked(v, s);
  els.session.classList.toggle("paused", blocked);
  els.resume.hidden = !blocked;
  els.hintNoAudio.hidden = !v.noAudio;
}

function known(value) {
  return value === "running" || value === "interrupted" || value === "suspended" ? value : "suspended";
}

function ensureAudio() {
  if (rt.ctx === null) {
    try {
      rt.ctx = new env.AudioContext();
      Tone.setContext(rt.ctx);
    } catch {
      view = { ...view, noAudio: true };
      state = initialState();
      render(view, state, 0);
      return Promise.resolve();
    }
    const session = env.audioSession();
    if (session) session.type = "playback";
    rt.master = new Tone.Gain(MASTER_CAP).toDestination();
    rt.instruments = createInstruments(rt.master);
    rt.ctx.onstatechange = onStateChange;
  }
  if (rt.ctx.state === "running") return Promise.resolve();
  if (rt.settleTimer === null) rt.settleTimer = env.setTimeout(onSettleTimeout, UNLOCK_SETTLE_MS);
  return rt.ctx
    .resume()
    .catch(() => {})
    .then(() => {
      if (rt.settleTimer !== null) {
        env.clearTimeout(rt.settleTimer);
        rt.settleTimer = null;
      }
      view = { ...view, audio: known(rt.ctx.state) };
      render(view, state, audibleNow());
    });
}

function onSettleTimeout() {
  rt.settleTimer = null;
  if (rt.ctx.state === "running") return;
  view = { ...view, audio: known(rt.ctx.state) };
  render(view, state, audibleNow());
}

function onSessionTap(p) {
  if (view.noAudio) return Promise.resolve();
  const running = rt.ctx !== null && rt.ctx.state === "running";
  state = tapGate(state, p, running);
  render(view, state, audibleNow());
  return ensureAudio().then(startIfIdle);
}

function stopAll() {
  state = { ...state, active: [-1, -1, -1, -1], queued: [null, null, null, null], bar: -1 };
  view = { ...view, shownActive: [-1, -1, -1, -1], events: [] };
  if (rt.timer !== null) {
    env.clearInterval(rt.timer);
    rt.timer = null;
  }
  if (rt.rafId !== null) {
    env.caf(rt.rafId);
    rt.rafId = null;
  }
  try {
    if (rt.ctx !== null) {
      const t0 = rt.ctx.currentTime;
      rt.muteUntil = t0 + STOP_RESTORE + RESTORE_RAMP;
      voices.releaseAll(rt.instruments, t0 + STOP_FADE);
      bus.fadeOutIn(t0, env.hidden() ? 0 : MASTER_CAP);
    }
  } finally {
    render(view, state, 0);
  }
}

function onStateChange() {
  view = { ...view, audio: known(rt.ctx.state) };
  if (rt.ctx.state === "running") {
    startIfIdle();
    ensureFrame();
  }
  render(view, state, audibleNow());
}

function onVisibility() {
  if (rt.ctx === null) return;
  const hidden = env.hidden();
  bus.rampTo(hidden ? 0 : MASTER_CAP, hidden ? HIDE_RAMP : SHOW_RAMP);
  if (!hidden && rt.ctx.state !== "running" && anyActive(state)) {
    rt.ctx.resume().catch(() => {});
  }
}

function onPageShow(event) {
  if (!event.persisted) return;
  view = { ...view, audio: rt.ctx ? known(rt.ctx.state) : "none" };
  if (view.audio === "running") {
    startIfIdle();
    ensureFrame();
  }
  render(view, state, audibleNow());
}

function onMotionChange(mediaQuery) {
  view = { ...view, reducedMotion: mediaQuery.matches };
  render(view, state, audibleNow());
}

function browserEnv() {
  return {
    AudioContext: window.AudioContext || window.webkitAudioContext,
    raf: (callback) => window.requestAnimationFrame(callback),
    caf: (id) => window.cancelAnimationFrame(id),
    setInterval: (fn, ms) => window.setInterval(fn, ms),
    clearInterval: (id) => window.clearInterval(id),
    setTimeout: (fn, ms) => window.setTimeout(fn, ms),
    clearTimeout: (id) => window.clearTimeout(id),
    hidden: () => document.hidden,
    audioSession: () => (typeof navigator !== "undefined" && navigator.audioSession) || null,
    reducedMotion: () =>
      typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
}

function queryDom(doc) {
  const required = (id) => {
    const element = doc.getElementById(id);
    if (!element) throw new Error("alm: missing #" + id);
    return element;
  };
  const pads = [];
  const padState = [];
  const progressBars = [];
  for (let t = 0; t < 4; t++) {
    pads.push([]);
    padState.push([]);
    progressBars.push([]);
    for (let c = 0; c < 4; c++) {
      const pad = doc.querySelector(`.clip[data-t="${t}"][data-c="${c}"]`);
      const label = pad ? pad.querySelector(".pad-state") : null;
      const bar = pad ? pad.querySelector(".progress") : null;
      if (!pad || !label || !bar) throw new Error(`alm: missing pad ${t},${c}`);
      pads[t].push(pad);
      padState[t].push(label);
      progressBars[t].push(bar);
    }
  }
  return {
    langButtons: Array.from(doc.querySelectorAll(".lang button")),
    session: required("session"),
    pads,
    padState,
    progress: progressBars,
    stop: required("stop"),
    resume: required("resume"),
    hintNoAudio: required("hint-noaudio"),
  };
}

function readPad(target) {
  const element = target && target.closest ? target.closest(".clip") : null;
  if (element === null || !els.session.contains(element)) return null;
  const t = element.dataset.t;
  const c = element.dataset.c;
  if (!/^[0-3]$/.test(t) || !/^[0-3]$/.test(c)) return null;
  return { t: Number(t), c: Number(c) };
}

function applyText(dom, lang) {
  const text = TEXT[lang];
  document.documentElement.lang = lang;
  document.title = text.title;
  for (const node of document.querySelectorAll("[data-i18n]")) {
    node.textContent = text[node.dataset.i18n];
  }
  dom.session.setAttribute("aria-label", text.song);
  for (let t = 0; t < 4; t++) {
    for (let c = 0; c < 4; c++) {
      dom.pads[t][c].querySelector(".pad-label").textContent = text["track" + t] + " " + (c + 1);
    }
  }
  for (const button of dom.langButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
  }
}

function setLang(lang) {
  view = { ...view, lang };
  applyText(els, lang);
  render(view, state, 0);
}

function bindListeners(dom) {
  dom.session.addEventListener("click", (event) => {
    const p = readPad(event.target);
    if (p !== null) onSessionTap(p);
  });
  dom.stop.addEventListener("click", stopAll);
  dom.resume.addEventListener("click", () => ensureAudio().then(startIfIdle));
  for (const button of dom.langButtons) {
    button.addEventListener("click", () => setLang(button.dataset.lang));
  }
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pageshow", onPageShow);
  if (typeof matchMedia === "function") {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    query.addEventListener("change", () => onMotionChange(query));
  }
}

function init() {
  env = browserEnv();
  els = queryDom(document);
  view = initialView(env.reducedMotion(), typeof env.AudioContext !== "function");
  bindListeners(els);
  applyText(els, view.lang);
  render(view, state, 0);
}

document.addEventListener("DOMContentLoaded", init);
})();
