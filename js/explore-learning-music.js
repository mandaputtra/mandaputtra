(function () {
const BPM = 112;
const BAR_STEPS = 16;
const PHRASE_BARS = 4;
const STEP = 60 / BPM / 4;
const STRUM = 0.012;
const HOME_LANE = { kick: "kick", snare: "snare", closed: "hat", open: "openhat" };

const PROGRESSION = [
  { bass: { R: "A1", P: "E2", O: "A2" }, keys: ["A3", "C4", "E4", "G4"] },
  { bass: { R: "F1", P: "C2", O: "F2" }, keys: ["A3", "C4", "E4", "F4"] },
  { bass: { R: "C2", P: "G2", O: "C3" }, keys: ["G3", "C4", "E4", "G4"] },
  { bass: { R: "G1", P: "D2", O: "G2" }, keys: ["G3", "B3", "D4", "A4"] },
];

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

const bassClip = (line) => PROGRESSION.map((ch) => melodicBar(line, (tok) => [ch.bass[tok] || tok]));
const chordClip = (line) =>
  PROGRESSION.map((ch) => melodicBar(line, (tok) => (tok === "x" ? ch.keys : [ch.keys[Number(tok) - 1]])));
const melodyClip = (...lines) => lines.map((line) => melodicBar(line, (tok) => [tok]));

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
let engine = null;
let state = initialState();
let view = initialView(false, false, "id");
let rt = { rafId: null };

function initialState() {
  return {
    active: [-1, -1, -1, -1],
    queued: [null, null, null, null],
    bar: -1,
  };
}

function initialView(reducedMotion, noAudio, lang) {
  return {
    shownActive: [-1, -1, -1, -1],
    shownBar: 0,
    boundaryTime: 0,
    events: [],
    audio: "none",
    noAudio,
    reducedMotion,
    lang,
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
  if (d === "pending-on") return window.LM.t(lang, "starting") || "";
  if (d === "pending-off") return window.LM.t(lang, "stopping") || "";
  return "";
}

function commitBoundary(s) {
  const active = s.active.map((a, t) => (s.queued[t] === null ? a : s.queued[t]));
  return { ...s, active, queued: [null, null, null, null], bar: s.bar + 1 };
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

function playEvent(track, ev, time) {
  const vel = ev.vel * (0.9 + Math.random() * 0.1);
  if (track === 0) {
    engine.drum(HOME_LANE[ev.lane], time, vel);
    return;
  }
  const dur = ev.len * STEP;
  if (track === 2) {
    ev.notes.forEach((note, i) => engine.note("keys", note, dur, time + i * STRUM, vel));
    return;
  }
  engine.note(track === 1 ? "bass" : "lead", ev.notes[0], dur - 0.01, time, vel);
}

function playStep(s, bar, stepNumber, gridTime) {
  const b = bar % PHRASE_BARS;
  for (let t = 0; t < 4; t++) {
    if (s.active[t] < 0) continue;
    for (const ev of CLIPS[t][s.active[t]][b][stepNumber - 1]) playEvent(t, ev, gridTime);
  }
}

function stopIfIdle() {
  if (anyActive(state)) return false;
  engine.stop();
  return true;
}

function onStep(info) {
  if (info.step === 1) {
    state = { ...commitBoundary(state), bar: info.bar };
    view.events.push({ time: info.audibleTime, active: state.active.slice(), bar: state.bar });
    if (stopIfIdle()) return;
  }
  playStep(state, state.bar, info.step, info.gridTime);
}

function startIfIdle() {
  if (!anyActive(state)) return;
  if (engine.state !== "running" && engine.state !== "stopped") return;
  if (!engine.start()) return;
  ensureFrame();
}

function ensureAudio() {
  return engine.unlock().then((ok) => {
    if (ok) startIfIdle();
  });
}

function ensureFrame() {
  if (rt.rafId !== null) return;
  rt.rafId = env.raf(frame);
}

function cancelFrame() {
  if (rt.rafId === null) return;
  env.caf(rt.rafId);
  rt.rafId = null;
}

function frame() {
  rt.rafId = null;
  const live = engine.state === "running" || engine.state === "stopped";
  const now = live ? engine.immediate() : 0;
  if (live) view = drainEvents(view, now);
  render(view, state, now);
  if (view.events.length > 0 || engine.state === "running") rt.rafId = env.raf(frame);
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

function renderStarList(progressView) {
  if (els === null || els.lessonsRoot === null) return;
  const held = progressView && progressView.record ? progressView.record : progressView;
  const lessons = held && held.lessons ? held.lessons : {};
  const done = window.LM.t(view.lang, "ui.done");
  const star = window.LM.t(view.lang, "ui.star");
  const rows = els.lessonsRoot.querySelectorAll("li[data-lesson]");
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const slug = row.dataset.lesson;
    if (!slug) continue;
    const entry = lessons[slug];
    const finished = entry !== undefined && entry.finished === true;
    const starred = entry !== undefined && entry.starred === true;
    if (finished) row.dataset.done = "1";
    if (starred) row.dataset.star = "1";
    const mark = row.querySelector(".lm-lesson-state-text");
    const favor = row.querySelector(".lm-lesson-star-text");
    if (mark !== null) mark.textContent = finished && done !== undefined ? done : "";
    if (favor !== null) favor.textContent = starred && star !== undefined ? star : "";
  }
}

function onEngineState(next) {
  view = { ...view, audio: next === "idle" ? "none" : next };
  if (next === "noAudio") view = { ...view, noAudio: true };
  if (next === "running" || next === "stopped") startIfIdle();
  else if (next === "disposed") cancelFrame();
  render(view, state, engine.immediate());
}

function onSessionTap(p) {
  if (view.noAudio) return;
  state = tapGate(state, p, engine.state === "running");
  render(view, state, engine.immediate());
  ensureAudio();
}

function stopAll() {
  state = { ...state, active: [-1, -1, -1, -1], queued: [null, null, null, null], bar: -1 };
  view = { ...view, shownActive: [-1, -1, -1, -1], events: [] };
  cancelFrame();
  engine.stop();
  render(view, state, 0);
}

function onPageShow(event) {
  renderStarList(window.LM.progress.get());
  if (!event.persisted) return;
  if (anyActive(state) && engine.state !== "running") ensureAudio();
}

function onMotionChange(mediaQuery) {
  view = { ...view, reducedMotion: mediaQuery.matches };
  render(view, state, engine.immediate());
}

function applyLang(lang) {
  view = { ...view, lang };
  applyLabels(lang);
  renderStarList(window.LM.progress.get());
  render(view, state, engine.immediate());
}

function applyLabels(lang) {
  for (let t = 0; t < 4; t++) {
    const name = window.LM.t(lang, "track" + t);
    if (name === undefined) continue;
    for (let c = 0; c < 4; c++) els.padLabel[t][c].textContent = name + " " + (c + 1);
  }
}

function browserEnv() {
  return {
    raf: (callback) => window.requestAnimationFrame(callback),
    caf: (id) => window.cancelAnimationFrame(id),
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
  const padLabel = [];
  const progressBars = [];
  for (let t = 0; t < 4; t++) {
    pads.push([]);
    padState.push([]);
    padLabel.push([]);
    progressBars.push([]);
    for (let c = 0; c < 4; c++) {
      const pad = doc.querySelector(`.clip[data-t="${t}"][data-c="${c}"]`);
      const stateNode = pad ? pad.querySelector(".pad-state") : null;
      const labelNode = pad ? pad.querySelector(".pad-label") : null;
      const bar = pad ? pad.querySelector(".progress") : null;
      if (!pad || !stateNode || !labelNode || !bar) throw new Error(`alm: missing pad ${t},${c}`);
      pads[t].push(pad);
      padState[t].push(stateNode);
      padLabel[t].push(labelNode);
      progressBars[t].push(bar);
    }
  }
  return {
    lessonsRoot: doc.getElementById("lm-lessons"),
    langButtons: Array.from(doc.querySelectorAll(".lang button")),
    session: required("session"),
    pads,
    padState,
    padLabel,
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

function bindListeners(dom) {
  dom.session.addEventListener("click", (event) => {
    const p = readPad(event.target);
    if (p !== null) onSessionTap(p);
  });
  dom.stop.addEventListener("click", stopAll);
  dom.resume.addEventListener("click", ensureAudio);
  for (const button of dom.langButtons) {
    button.addEventListener("click", () => window.LM.lang.set(button.dataset.lang));
  }
  window.addEventListener("pageshow", onPageShow);
  if (typeof matchMedia === "function") {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    query.addEventListener("change", () => onMotionChange(query));
  }
}

function init() {
  env = browserEnv();
  els = queryDom(document);
  engine = window.LM.audio.create({ profile: "home", onStep, onStateChange: onEngineState });
  const noAudio = typeof (window.AudioContext || window.webkitAudioContext) !== "function";
  view = initialView(env.reducedMotion(), noAudio, window.LM.lang.current());
  window.LM.i18n.apply(document, view.lang);
  applyLabels(view.lang);
  window.LM.lang.onChange(applyLang);
  window.LM.progress.onChange(renderStarList);
  renderStarList(window.LM.progress.get());
  bindListeners(els);
  render(view, state, 0);
}

document.addEventListener("DOMContentLoaded", init);
})();
