(function () {
const BPM = 102;
const STEPS_PER_BAR = 16;
const STEP = 60 / BPM / 4;
const BAR = STEP * STEPS_PER_BAR;
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
const ATTACK = 0.005;
const RELEASE_TAIL = 0.05;
const DUR = [STEP, STEP * 2, STEP * 4, STEP * 2];
const ROOT_HZ = 220;
const OCTAVE = [0, -1, 0, 1];
const SCALES = {
  soft: [0, 2, 3, 5, 7, 10, 10, 12],
  minor: [0, 2, 3, 5, 7, 8, 10, 12],
};
const KINDS = ["drum", "bass", "chords", "melody"];
const LANGS = ["id", "en"];
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
const OSCILLATOR_TYPES = [null, "square", "sawtooth", "triangle"];
const DRUM_SHAPES = {
  kick: { type: "sine", from: 150, to: 50, span: 0.1 },
  snare: { type: "triangle", from: 220, to: 160, span: 0.08 },
  hat: { type: "square", from: 7000, to: 7000, span: 0 },
};
const K = {
  BPM, STEPS_PER_BAR, STEP, BAR, TICK_MS, LOOKAHEAD, CATCHUP_SLACK, MASTER_CAP,
  STOP_FADE, STOP_RESTORE, RESTORE_RAMP, UNLOCK_SETTLE_MS, HIDE_RAMP, SHOW_RAMP,
  ATTACK, RELEASE_TAIL, DUR, ROOT_HZ, OCTAVE,
};

const bar = (pattern) =>
  [...pattern].map((ch) => (ch === "." ? null : ch === "x" ? 0 : Number(ch)));

const TRACKS = [
  {
    kind: KINDS[0],
    gain: 0.35,
    clips: [
      { bars: [bar("x...x...x...x...")] },
      { bars: [bar("x.x.x.x.x.x.x.x."), bar("x...x...x.x.x...")] },
      { bars: [bar("x..xx..xx..xx..x")] },
      { bars: [bar("x...x...x...x..."), bar("..x...x...x...x."), bar("x.x.x.x.x.x.x.x.")] },
    ],
  },
  {
    kind: KINDS[1],
    gain: 0.3,
    clips: [
      { bars: [bar("0...0...3...3..."), bar("5...5...3...3...")] },
      { bars: [bar("0.0.0.0.3.3.3.3.")] },
      { bars: [bar("0..0..0.3..3..3."), bar("5..5..5.3..3..3.")] },
      { bars: [bar("0.....0.3.....3.")] },
    ],
  },
  {
    kind: KINDS[2],
    gain: 0.2,
    clips: [
      { bars: [bar("0..............."), bar("3...............")] },
      { bars: [bar("0...3...0...3...")] },
      { bars: [bar("0.......4......."), bar("3.......5.......")] },
      { bars: [bar("2.......5......."), bar("4...2...5.......")] },
    ],
  },
  {
    kind: KINDS[3],
    gain: 0.25,
    clips: [
      { bars: [bar("4...5...6...4..."), bar("7...6...5...4...")] },
      { bars: [bar("4.5.6.7.6.5.4.5.")] },
      { bars: [bar("4...5.6.7...6..."), bar("5...4...2...4...")] },
      { bars: [bar("7.......6......."), bar("5.......4.......")] },
    ],
  },
];

const defaultEnv = {
  AudioContext: undefined,
  raf: () => 0,
  caf() {},
  setInterval: () => 0,
  clearInterval() {},
  setTimeout: () => 0,
  clearTimeout() {},
  hidden: () => false,
  audioSession: () => null,
  reducedMotion: () => false,
};

let env = defaultEnv;
let els = null;
let state = initialState();
let view = initialView(false, false);
let rt = initialRuntime();

function initialState() {
  return {
    active: [-1, -1, -1, -1],
    queued: [null, null, null, null],
    age: [0, 0, 0, 0],
    step: 0,
    nextBar: 0,
    scale: "soft",
    pendingScale: null,
  };
}

function initialView(reducedMotion, noAudio) {
  return {
    shownActive: [-1, -1, -1, -1],
    shownAge: [0, 0, 0, 0],
    shownScale: "soft",
    boundaryTime: 0,
    events: [],
    audio: "none",
    noAudio,
    reducedMotion,
    lang: "id",
    restored: false,
    glowShown: false,
    hintDismissed: false,
  };
}

function initialRuntime() {
  return {
    ctx: null,
    master: null,
    live: new Set(),
    timer: null,
    rafId: null,
    muteUntil: 0,
    settleTimer: null,
  };
}

function pitch(track, deg, scale) {
  return ROOT_HZ * 2 ** (OCTAVE[track] + SCALES[scale][deg] / 12);
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

function pressed(v, t, c) {
  return String(v.shownActive[t] === c);
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
  const active = s.active.slice();
  const queued = s.queued.slice();
  const age = s.age.slice();
  for (let t = 0; t < 4; t++) {
    let launched = false;
    if (queued[t] !== null) {
      active[t] = queued[t];
      queued[t] = null;
      if (active[t] >= 0) {
        age[t] = 0;
        launched = true;
      }
    }
    if (!launched) age[t] = age[t] + 1;
  }
  return { ...s, active, queued, age };
}

function drumLane(step) {
  if (step % 8 === 0) return "kick";
  if (step % 8 === 4) return "snare";
  return "hat";
}

function notesForStep(s, step, time) {
  const notes = [];
  for (let t = 0; t < 4; t++) {
    if (s.active[t] < 0) continue;
    const clip = TRACKS[t].clips[s.active[t]];
    const deg = clip.bars[s.age[t] % clip.bars.length][step];
    if (deg === null) continue;
    const note = { time, track: t, dur: DUR[t], gain: TRACKS[t].gain };
    if (t === 0) note.lane = drumLane(step);
    else note.pitch = pitch(t, deg, s.scale);
    notes.push(note);
  }
  return notes;
}

function catchUp(nextBar, now) {
  return nextBar < now ? now + CATCHUP_SLACK : nextBar;
}

function drainEvents(v, now) {
  let count = 0;
  while (count < v.events.length && v.events[count].time <= now) count++;
  if (count === 0) return v;
  const last = v.events[count - 1];
  return {
    ...v,
    shownActive: last.active.slice(),
    shownAge: last.age.slice(),
    shownScale: last.scale,
    boundaryTime: last.time,
    events: v.events.slice(count),
  };
}

function progress(v, t, now, barsLen, reducedMotion) {
  let stepNow = Math.min(Math.max(Math.floor((now - v.boundaryTime) / STEP), 0), 15);
  if (reducedMotion) stepNow = Math.floor(stepNow / 4) * 4;
  const bar = v.shownAge[t] % barsLen;
  return (bar * 16 + stepNow) / (barsLen * 16);
}

function clampGain(x) {
  return Math.min(Math.max(x, 0), MASTER_CAP);
}

function restoreTarget(hidden) {
  return hidden ? 0 : MASTER_CAP;
}

const bus = {
  create(ctx) {
    rt.master = ctx.createGain();
    rt.master.gain.value = MASTER_CAP;
    rt.master.connect(ctx.destination);
  },
  gainParam() {
    return rt.master.gain;
  },
  anchor(p, t0) {
    if (p.cancelAndHoldAtTime) {
      p.cancelAndHoldAtTime(t0);
    } else {
      p.cancelScheduledValues(t0);
      p.setValueAtTime(clampGain(p.value), t0);
    }
  },
  rampTo(target, dur) {
    const p = bus.gainParam();
    const t0 = rt.ctx.currentTime;
    bus.anchor(p, t0);
    p.linearRampToValueAtTime(clampGain(target), t0 + dur);
  },
  fadeOutIn(t0, target) {
    const p = bus.gainParam();
    bus.anchor(p, t0);
    p.linearRampToValueAtTime(0, t0 + STOP_FADE);
    p.setValueAtTime(0, t0 + STOP_RESTORE);
    p.linearRampToValueAtTime(clampGain(target), t0 + STOP_RESTORE + RESTORE_RAMP);
  },
};

const voices = {
  play(ctx, master, n) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, n.time);
    g.gain.linearRampToValueAtTime(n.gain, n.time + ATTACK);
    g.gain.setTargetAtTime(0, n.time + n.dur * 0.7, n.dur * 0.1);
    osc.connect(g);
    g.connect(master);
    if (n.lane === undefined) {
      osc.type = OSCILLATOR_TYPES[n.track];
      osc.frequency.setValueAtTime(n.pitch, n.time);
    } else {
      const shape = DRUM_SHAPES[n.lane];
      osc.type = shape.type;
      osc.frequency.setValueAtTime(shape.from, n.time);
      if (shape.span > 0) osc.frequency.exponentialRampToValueAtTime(shape.to, n.time + shape.span);
    }
    osc.start(n.time);
    osc.stop(n.time + n.dur + RELEASE_TAIL);
    rt.live.add(osc);
    osc.onended = () => rt.live.delete(osc);
  },
  cutAll(t) {
    for (const node of rt.live) {
      try {
        node.stop(t);
      } catch {
        try {
          node.disconnect();
        } catch {}
      }
    }
    rt.live.clear();
  },
};

function start() {
  const now = rt.ctx.currentTime;
  const lastEvent = view.events.length ? view.events[view.events.length - 1].time : 0;
  state.nextBar = Math.max(now + CATCHUP_SLACK, rt.muteUntil, lastEvent);
  state.step = 0;
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
  state.nextBar = catchUp(state.nextBar, now);
  while (state.nextBar < now + LOOKAHEAD) {
    if (state.step === 0) {
      state = commitBoundary(state);
      view.events.push({
        time: state.nextBar,
        active: state.active.slice(),
        age: state.age.slice(),
        scale: state.scale,
      });
      if (stopIfIdle()) return;
    }
    for (const note of notesForStep(state, state.step, state.nextBar)) {
      voices.play(rt.ctx, rt.master, note);
    }
    state.nextBar += STEP;
    state.step = (state.step + 1) % STEPS_PER_BAR;
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
  for (let t = 0; t < 4; t++) {
    for (let c = 0; c < 4; c++) {
      const d = displayState(v.shownActive[t], displayQueued(v, s, t), c);
      const pad = els.pads[t][c];
      pad.className = "clip t-" + t + " is-" + d;
      pad.setAttribute("aria-pressed", pressed(v, t, c));
      if (v.noAudio) pad.setAttribute("aria-disabled", "true");
      els.padState[t][c].textContent = stateText(d, v.lang);
      els.progress[t][c].style.width =
        v.shownActive[t] === c
          ? progress(v, t, now, TRACKS[t].clips[c].bars.length, v.reducedMotion) * 100 + "%"
          : "0%";
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
    } catch {
      view = { ...view, noAudio: true };
      state = initialState();
      render(view, state, 0);
      return Promise.resolve();
    }
    const session = env.audioSession();
    if (session) session.type = "playback";
    bus.create(rt.ctx);
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
  state = { ...state, active: [-1, -1, -1, -1], queued: [null, null, null, null], age: [0, 0, 0, 0] };
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
      voices.cutAll(t0 + STOP_FADE);
      bus.fadeOutIn(t0, restoreTarget(env.hidden()));
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
    body: doc.body,
    langButtons: Array.from(doc.querySelectorAll(".lang button")),
    main: required("alm"),
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

function onSessionClick(event) {
  const p = readPad(event.target);
  if (p !== null) onSessionTap(p);
}

function onResumeClick() {
  ensureAudio().then(startIfIdle);
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
  dom.session.addEventListener("click", onSessionClick);
  dom.stop.addEventListener("click", stopAll);
  dom.resume.addEventListener("click", onResumeClick);
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

const core = {
  K,
  TRACKS,
  SCALES,
  KINDS,
  tap,
  tapGate,
  displayState,
  displayQueued,
  pressed,
  anyActive,
  audioBlocked,
  stateText,
  commitBoundary,
  notesForStep,
  catchUp,
  drainEvents,
  progress,
  clampGain,
  restoreTarget,
  pitch,
  initialState,
  initialView,
  tick,
  frame,
  start,
  startIfIdle,
  stopIfIdle,
  stopAll,
  ensureAudio,
  onSessionTap,
  onStateChange,
  onVisibility,
  onPageShow,
  bus,
  voices,
  __setEnv(partial) {
    env = { ...env, ...partial };
  },
  __getState() {
    return { state, view, rt };
  },
  __reset() {
    state = initialState();
    view = initialView(false, false);
    rt = initialRuntime();
    env = defaultEnv;
  },
};

if (typeof module !== "undefined" && module.exports) module.exports = core;
else if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", init);
})();
