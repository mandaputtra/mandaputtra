const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

for (const name of ["navigator", "matchMedia", "location", "history"]) {
  if (name in globalThis) delete globalThis[name];
}

const core = require("../../../js/explore-ableton-learning-music.js");

const { K, TRACKS, SCALES, KINDS } = core;
const ROOT = path.resolve(__dirname, "../../..");
const EPSILON = 1e-9;
const approx = (a, b) => Math.abs(a - b) < EPSILON;

const initial = () => core.initialState();
const withState = (overrides) => ({ ...core.initialState(), ...overrides });

function fakeParam(value = 0, { cancelAndHold = false } = {}) {
  const param = {
    value,
    log: [],
    throwOnRamp: false,
    setValueAtTime(v, t) {
      param.log.push({ method: "setValueAtTime", value: v, time: t });
      return param;
    },
    linearRampToValueAtTime(v, t) {
      if (param.throwOnRamp) throw new Error("ramp failed");
      param.log.push({ method: "linearRampToValueAtTime", value: v, time: t });
      return param;
    },
    exponentialRampToValueAtTime(v, t) {
      param.log.push({ method: "exponentialRampToValueAtTime", value: v, time: t });
      return param;
    },
    setTargetAtTime(v, t, timeConstant) {
      param.log.push({ method: "setTargetAtTime", value: v, time: t, timeConstant });
      return param;
    },
    cancelScheduledValues(t) {
      param.log.push({ method: "cancelScheduledValues", time: t });
      return param;
    },
  };
  if (cancelAndHold) {
    param.cancelAndHoldAtTime = (t) => {
      param.log.push({ method: "cancelAndHoldAtTime", time: t });
      return param;
    };
  }
  return param;
}

const toneLog = { contexts: [], instruments: [], gains: [] };

function fakeInstrument(kind) {
  const instrument = {
    kind,
    calls: [],
    connections: [],
    connect(target) {
      instrument.connections.push(target);
      return instrument;
    },
    triggerAttackRelease(...args) {
      const time = args[kind === "noise" || kind === "metal" ? 1 : 2];
      instrument.calls.push({ method: "triggerAttackRelease", args, time });
      return instrument;
    },
    triggerRelease(time) {
      instrument.calls.push({ method: "triggerRelease", time });
      return instrument;
    },
  };
  toneLog.instruments.push(instrument);
  return instrument;
}

function fakeToneGain(value) {
  const node = {
    gain: fakeParam(value),
    connections: [],
    destinations: 0,
    connect(target) {
      node.connections.push(target);
      return node;
    },
    toDestination() {
      node.destinations += 1;
      return node;
    },
  };
  toneLog.gains.push(node);
  return node;
}

global.Tone = {
  setContext(ctx) {
    toneLog.contexts.push(ctx);
  },
  Gain: function (value) {
    return fakeToneGain(value);
  },
  MembraneSynth: function () {
    return fakeInstrument("membrane");
  },
  NoiseSynth: function () {
    return fakeInstrument("noise");
  },
  MetalSynth: function () {
    return fakeInstrument("metal");
  },
  MonoSynth: function () {
    return fakeInstrument("mono");
  },
  Synth: function () {
    return fakeInstrument("synth");
  },
};

function fakeContext({
  state = "suspended",
  resume = "resolve-running",
  clock = 0,
} = {}) {
  const ctx = {
    state,
    currentTime: clock,
    baseLatency: 0,
    outputLatency: 0,
    destination: { label: "destination" },
    onstatechange: null,
    resumeCalls: 0,
    resume() {
      ctx.resumeCalls += 1;
      if (resume === "reject") return Promise.reject(new Error("blocked"));
      if (resume === "never") return new Promise(() => {});
      if (resume === "resolve-running") ctx.state = "running";
      return Promise.resolve();
    },
  };
  return ctx;
}

const scheduled = () => toneLog.instruments.flatMap((inst) => inst.calls.filter((c) => c.method === "triggerAttackRelease"));
const releases = () => toneLog.instruments.flatMap((inst) => inst.calls.filter((c) => c.method === "triggerRelease"));

function installEnv({ hidden = false, session = null, AudioContext } = {}) {
  toneLog.contexts.length = 0;
  toneLog.instruments.length = 0;
  toneLog.gains.length = 0;
  const env = { hidden, session, frames: [], intervals: [], timeouts: [], cleared: [], cancelled: [] };
  core.__setEnv({
    raf: (callback) => {
      env.frames.push(callback);
      return env.frames.length;
    },
    caf: (id) => {
      env.cancelled.push(id);
    },
    setInterval: (fn, ms) => {
      const handle = { fn, ms, cleared: false };
      env.intervals.push(handle);
      return handle;
    },
    clearInterval: (handle) => {
      handle.cleared = true;
    },
    setTimeout: (fn, ms) => {
      const handle = { fn, ms };
      env.timeouts.push(handle);
      return handle;
    },
    clearTimeout: (handle) => {
      env.cleared.push(handle);
    },
    hidden: () => env.hidden,
    audioSession: () => env.session,
    reducedMotion: () => false,
    AudioContext,
  });
  return env;
}

function contextFactory(ctx) {
  return function () {
    return ctx;
  };
}

function runtime() {
  return core.__getState().rt;
}

function snapshot() {
  return core.__getState();
}

test("runtime supports the required major version", () => {
  assert.ok(Number(process.versions.node.split(".")[0]) >= 20);
});

test("every pad shows exactly one of four display states for every shown and queued clip", () => {
  const allowed = new Set(["off", "pending-on", "pending-off", "playing"]);
  for (let a = -1; a <= 3; a++) {
    for (const q of [null, -1, 0, 1, 2, 3]) {
      for (let c = 0; c <= 3; c++) {
        assert.ok(allowed.has(core.displayState(a, q, c)));
      }
    }
  }
});

test("a shown clip with a different queued clip shows pending-off", () => {
  assert.equal(core.displayState(2, 1, 2), "pending-off");
});

test("a shown clip with a queued stop shows pending-off", () => {
  assert.equal(core.displayState(2, -1, 2), "pending-off");
});

test("a shown clip with nothing queued shows playing", () => {
  assert.equal(core.displayState(0, null, 0), "playing");
});

test("a queued launch of an idle clip shows pending-on", () => {
  assert.equal(core.displayState(-1, 0, 0), "pending-on");
});

test("a tap on a playing pad with nothing queued queues a stop", () => {
  const s = withState({ active: [1, -1, -1, -1] });
  assert.equal(core.tap(s, { t: 0, c: 1 }).queued[0], -1);
});

test("tapping a pad twice returns to the original state whenever the queued slot is empty or matches the target", () => {
  for (let active = -1; active <= 3; active++) {
    for (let c = 0; c <= 3; c++) {
      const target = active === c ? -1 : c;
      for (const queued of [null, target]) {
        const s = withState({ active: [active, -1, -1, -1], queued: [queued, null, null, null] });
        const twice = core.tap(core.tap(s, { t: 0, c }), { t: 0, c });
        assert.equal(twice.queued[0], s.queued[0]);
        assert.equal(twice.active[0], s.active[0]);
      }
    }
  }
});

test("a second tap on a pad cancels its own pending launch even when another clip was queued first", () => {
  const s = withState({ active: [-1, -1, -1, -1], queued: [0, null, null, null] });
  const twice = core.tap(core.tap(s, { t: 0, c: 1 }), { t: 0, c: 1 });
  assert.equal(twice.queued[0], null);
});

test("a second tap on a playing pad cancels a stop when another clip is queued", () => {
  const s = withState({ active: [0, -1, -1, -1], queued: [1, null, null, null] });
  const twice = core.tap(core.tap(s, { t: 0, c: 0 }), { t: 0, c: 0 });
  assert.equal(twice.queued[0], null);
  assert.equal(twice.active[0], 0);
});

test("tapGate keeps a pending launch unchanged while audio is not running", () => {
  const s = withState({ active: [-1, -1, -1, -1], queued: [2, null, null, null] });
  assert.deepEqual(core.tapGate(s, { t: 0, c: 2 }, false), s);
});

test("tapGate queues a stop for a playing pad while audio is not running", () => {
  const s = withState({ active: [1, -1, -1, -1] });
  assert.equal(core.tapGate(s, { t: 0, c: 1 }, false).queued[0], -1);
});

test("tapGate behaves as a plain tap while audio is running", () => {
  const s = withState({ active: [-1, -1, -1, -1], queued: [0, null, null, null] });
  assert.deepEqual(core.tapGate(s, { t: 0, c: 2 }, true), core.tap(s, { t: 0, c: 2 }));
});

test("a launch committed at a bar boundary resets the clip age to zero", () => {
  const s = withState({ queued: [2, null, null, null], age: [5, 0, 0, 0] });
  const next = core.commitBoundary(s);
  assert.equal(next.active[0], 2);
  assert.equal(next.age[0], 0);
});

test("tracks without a launch advance their clip age at each boundary", () => {
  const s = withState({ active: [-1, 0, -1, -1], age: [0, 3, 0, 0] });
  assert.equal(core.commitBoundary(s).age[1], 4);
});

test("a single boundary applies queued changes to all four tracks", () => {
  const s = withState({ queued: [0, 1, 2, 3] });
  assert.deepEqual(core.commitBoundary(s).active, [0, 1, 2, 3]);
});

test("a stop committed at a boundary leaves the track silent", () => {
  const s = withState({ active: [1, -1, -1, -1], queued: [-1, null, null, null] });
  const next = core.commitBoundary(s);
  assert.equal(next.active[0], -1);
  assert.equal(next.queued[0], null);
});

test("a launch after a stop restarts the clip age from zero", () => {
  const stopped = core.commitBoundary(withState({ active: [1, -1, -1, -1], queued: [-1, null, null, null], age: [7, 0, 0, 0] }));
  const relaunched = core.commitBoundary({ ...stopped, queued: [3, null, null, null] });
  assert.equal(relaunched.age[0], 0);
});

test("a clip with one bar, two bars and three bars selects the bar by clip age", () => {
  const drumsThreeBars = { active: [3, -1, -1, -1], queued: [null, null, null, null], age: [0, 0, 0, 0] };
  const step = 2;
  assert.equal(core.notesForStep({ ...drumsThreeBars, age: [0, 0, 0, 0] }, step, 0).length, 0);
  assert.equal(core.notesForStep({ ...drumsThreeBars, age: [1, 0, 0, 0] }, step, 0).length, 1);
  assert.equal(core.notesForStep({ ...drumsThreeBars, age: [3, 0, 0, 0] }, step, 0).length, 0);

  const bassTwoBars = { active: [-1, 0, -1, -1], queued: [null, null, null, null], age: [0, 0, 0, 0], scale: "soft" };
  const firstBar = core.notesForStep({ ...bassTwoBars, age: [0, 0, 0, 0] }, 0, 0)[0];
  const secondBar = core.notesForStep({ ...bassTwoBars, age: [0, 1, 0, 0] }, 0, 0)[0];
  assert.equal(firstBar.pitch, core.pitch(1, 0, "soft"));
  assert.equal(secondBar.pitch, core.pitch(1, 5, "soft"));

  const bassOneBar = { active: [-1, 1, -1, -1], age: [0, 0, 0, 0], scale: "soft" };
  assert.equal(core.notesForStep({ ...bassOneBar, age: [0, 0, 0, 0] }, 0, 0)[0].pitch, core.pitch(1, 0, "soft"));
});

test("a boundary clears every queued change", () => {
  const next = core.commitBoundary(withState({ queued: [0, 1, -1, 3] }));
  assert.deepEqual(next.queued, [null, null, null, null]);
});

test("a launch committed in an undrained event shows pending-on before the drain", () => {
  const view = { ...core.initialView(false, false), shownActive: [-1, -1, -1, -1], events: [{ time: 5, active: [2, -1, -1, -1], age: [0, 0, 0, 0], scale: "soft" }] };
  const d = core.displayState(view.shownActive[0], core.displayQueued(view, initial(), 0), 2);
  assert.equal(d, "pending-on");
});

test("a stop committed in an undrained event shows pending-off before the drain", () => {
  const view = { ...core.initialView(false, false), shownActive: [1, -1, -1, -1], events: [{ time: 5, active: [-1, -1, -1, -1], age: [0, 0, 0, 0], scale: "soft" }] };
  assert.equal(core.displayState(1, core.displayQueued(view, initial(), 0), 1), "pending-off");
});

test("a tap inside the lookahead window on a committed launch shows pending-on until the drain and pending-off after", () => {
  const view = { ...core.initialView(false, false), shownActive: [-1, -1, -1, -1], events: [{ time: 5, active: [2, -1, -1, -1], age: [0, 0, 0, 0], scale: "soft" }] };
  const state = withState({ queued: [-1, null, null, null] });
  assert.equal(core.displayState(-1, core.displayQueued(view, state, 0), 2), "pending-on");
  const drained = core.drainEvents(view, 6);
  assert.equal(core.displayState(drained.shownActive[0], core.displayQueued(drained, state, 0), 2), "pending-off");
});

test("after the drain the queued state decides the displayed pad", () => {
  const view = core.initialView(false, false);
  assert.equal(core.displayQueued(view, withState({ queued: [3, null, null, null] }), 0), 3);
  assert.equal(core.displayQueued(view, initial(), 0), null);
});

test("two tracks changing in one event both show their queued state", () => {
  const view = {
    ...core.initialView(false, false),
    events: [{ time: 5, active: [1, 2, -1, -1], age: [0, 0, 0, 0], scale: "soft" }],
  };
  assert.equal(core.displayQueued(view, initial(), 0), 1);
  assert.equal(core.displayQueued(view, initial(), 1), 2);
});

test("relaunching another clip while one plays shows the playing pad as pending-off and the new pad as pending-on", () => {
  assert.equal(core.displayState(0, 3, 0), "pending-off");
  assert.equal(core.displayState(0, 3, 3), "pending-on");
});

test("progress moves through the bar and steps with the clip bar count", () => {
  const view = { ...core.initialView(false, false), boundaryTime: 10, shownAge: [0, 0, 0, 0] };
  assert.ok(approx(core.progress(view, 0, 10 + 5 * K.STEP + 0.01, 1, false), 5 / 16));
  const laterBar = { ...view, shownAge: [4, 0, 0, 0] };
  assert.ok(approx(core.progress(laterBar, 0, 10, 3, false), 16 / 48));
  assert.ok(approx(core.progress(view, 0, 10 + 15 * K.STEP, 2, false), 15 / 32));
});

test("reduced motion moves progress only in quarter-bar steps", () => {
  const view = { ...core.initialView(true, false), boundaryTime: 10, shownAge: [0, 0, 0, 0] };
  assert.ok(approx(core.progress(view, 0, 10 + 6.5 * K.STEP, 1, true), 4 / 16));
});

test("progress clamps to the last step when the boundary is late", () => {
  const view = { ...core.initialView(false, false), boundaryTime: 10, shownAge: [0, 0, 0, 0] };
  assert.ok(approx(core.progress(view, 0, 100, 1, false), 15 / 16));
});

test("pressed reports true only for the shown clip", () => {
  const view = { ...core.initialView(false, false), shownActive: [2, -1, -1, -1] };
  assert.equal(core.pressed(view, 0, 2), "true");
  assert.equal(core.pressed(view, 0, 1), "false");
});

test("anyActive counts a queued launch and ignores a queued stop alone", () => {
  assert.equal(core.anyActive(withState({ queued: [0, null, null, null] })), true);
  assert.equal(core.anyActive(withState({ queued: [-1, null, null, null] })), false);
  assert.equal(core.anyActive(withState({ active: [1, -1, -1, -1] })), true);
  assert.equal(core.anyActive(initial()), false);
});

test("audio is blocked only when suspended or interrupted with something active", () => {
  const playing = withState({ active: [0, -1, -1, -1] });
  assert.equal(core.audioBlocked({ ...core.initialView(false, false), audio: "suspended" }, playing), true);
  assert.equal(core.audioBlocked({ ...core.initialView(false, false), audio: "interrupted" }, playing), true);
  assert.equal(core.audioBlocked({ ...core.initialView(false, false), audio: "running" }, playing), false);
  assert.equal(core.audioBlocked({ ...core.initialView(false, false), audio: "suspended" }, initial()), false);
});

test("state text is English or Indonesian for pending states and empty otherwise", () => {
  assert.equal(core.stateText("pending-on", "en"), ", starting");
  assert.equal(core.stateText("pending-off", "en"), ", stopping");
  assert.equal(core.stateText("pending-on", "id"), ", akan mulai");
  assert.equal(core.stateText("pending-off", "id"), ", akan berhenti");
  assert.equal(core.stateText("playing", "en"), "");
  assert.equal(core.stateText("off", "id"), "");
});

test("the pure core exposes no later-tier names", () => {
  for (const name of ["initialLang", "scalePending", "parseHash", "serialize", "applyHash"]) {
    assert.equal(name in core, false);
  }
});

test("clamped gain stays between zero and the master cap", () => {
  assert.equal(core.clampGain(-1), 0);
  assert.equal(core.clampGain(5), K.MASTER_CAP);
  assert.equal(core.clampGain(0.3), 0.3);
});

test("the master cap is a fraction strictly between zero and one", () => {
  assert.ok(K.MASTER_CAP < 1 && K.MASTER_CAP > 0);
});

test("restore target is silence while hidden and the cap otherwise", () => {
  assert.equal(core.restoreTarget(true), 0);
  assert.equal(core.restoreTarget(false), K.MASTER_CAP);
});

test("catch-up moves a late next bar to the clock plus slack", () => {
  assert.ok(approx(core.catchUp(5, 10), 10 + K.CATCHUP_SLACK));
  assert.equal(core.catchUp(12, 10), 12);
});

test("notes scheduled after a clock jump never start before the clock", () => {
  const now = 10;
  let nextBar = core.catchUp(0, now);
  const s = withState({ active: [0, 0, 0, 0], age: [0, 0, 0, 0] });
  for (let i = 0; i < 32; i++) {
    for (const note of core.notesForStep(s, i % 16, nextBar)) {
      assert.ok(note.time >= now);
    }
    nextBar += K.STEP;
  }
});

test("drain removes only events whose time has passed and keeps order", () => {
  const view = {
    ...core.initialView(false, false),
    events: [
      { time: 1, active: [0, -1, -1, -1], age: [0, 0, 0, 0], scale: "soft" },
      { time: 2, active: [1, -1, -1, -1], age: [0, 0, 0, 0], scale: "soft" },
      { time: 9, active: [2, -1, -1, -1], age: [0, 0, 0, 0], scale: "soft" },
    ],
  };
  const drained = core.drainEvents(view, 3);
  assert.equal(drained.shownActive[0], 1);
  assert.equal(drained.boundaryTime, 2);
  assert.equal(drained.events.length, 1);
  assert.equal(core.drainEvents(view, 0), view);
});

test("pitch doubles per octave and follows the scale degrees", () => {
  assert.ok(approx(core.pitch(0, 0, "soft"), K.ROOT_HZ));
  assert.ok(approx(core.pitch(1, 0, "soft"), K.ROOT_HZ / 2));
  assert.ok(approx(core.pitch(3, 0, "soft"), K.ROOT_HZ * 2));
  assert.ok(approx(core.pitch(2, 1, "soft"), K.ROOT_HZ * 2 ** (2 / 12)));
});

test("clip data has four tracks in the expected kind order", () => {
  assert.equal(TRACKS.length, 4);
  assert.deepEqual(TRACKS.map((track) => track.kind), KINDS);
  assert.deepEqual(KINDS, ["drum", "bass", "chords", "melody"]);
});

test("each track carries only kind, gain and clips", () => {
  for (const track of TRACKS) {
    assert.deepEqual(Object.keys(track).sort(), ["clips", "gain", "kind"]);
  }
});

test("every track has four clips with at least one bar each", () => {
  for (const track of TRACKS) {
    assert.equal(track.clips.length, 4);
    for (const clip of track.clips) {
      assert.ok(clip.bars.length >= 1);
    }
  }
});

test("every bar has sixteen steps holding a null or a scale degree from zero to seven", () => {
  for (const track of TRACKS) {
    for (const clip of track.clips) {
      for (const bar of clip.bars) {
        assert.equal(bar.length, 16);
        for (const degree of bar) {
          assert.ok(degree === null || (Number.isInteger(degree) && degree >= 0 && degree <= 7));
        }
      }
    }
  }
});

test("every clip sounds at least two notes", () => {
  for (const track of TRACKS) {
    for (const clip of track.clips) {
      const sounding = clip.bars.flat().filter((degree) => degree !== null).length;
      assert.ok(sounding >= 2);
    }
  }
});

test("the tempo constant matches the step length", () => {
  assert.ok(approx(60 / K.STEP / 4, K.BPM));
  assert.ok(approx(K.BAR, K.STEP * K.STEPS_PER_BAR));
});

test("the scale table holds eight degrees per scale", () => {
  assert.equal(SCALES.soft.length, 8);
  assert.equal(SCALES.minor.length, 8);
});

test("summed peak note gain across tracks stays under the headroom limit", () => {
  let sum = 0;
  for (let t = 0; t < TRACKS.length; t++) {
    const track = TRACKS[t];
    const soundSteps = Math.ceil(K.DUR[t] / K.STEP - 1e-9);
    let peak = 0;
    for (const clip of track.clips) {
      const steps = clip.bars.flat();
      const sounding = new Array(steps.length).fill(0);
      steps.forEach((degree, index) => {
        if (degree === null) return;
        for (let k = 0; k < soundSteps; k++) {
          sounding[(index + k) % steps.length] += track.gain;
        }
      });
      peak = Math.max(peak, ...sounding);
    }
    sum += peak;
  }
  assert.ok(sum * K.MASTER_CAP <= 0.891);
});

test("fake audio param records scheduled values and can use the cancel-and-hold variant", () => {
  const plain = fakeParam(1);
  core.bus.anchor(plain, 2);
  assert.deepEqual(plain.log.map((entry) => entry.method), ["cancelScheduledValues", "setValueAtTime"]);
  const holding = fakeParam(1, { cancelAndHold: true });
  core.bus.anchor(holding, 2);
  assert.deepEqual(holding.log.map((entry) => entry.method), ["cancelAndHoldAtTime"]);
});

test("the tap-run loop shows a launched pad as playing once its boundary is audible", async () => {
  core.__reset();
  const ctx = fakeContext({ clock: 10 });
  installEnv({ AudioContext: contextFactory(ctx) });
  await core.onSessionTap({ t: 0, c: 0 });
  assert.equal(snapshot().state.queued[0], 0);
  assert.ok(runtime().timer !== null);
  assert.equal(snapshot().view.audio, "running");

  core.tick();
  assert.equal(snapshot().view.events.length, 1);
  assert.ok(approx(snapshot().view.events[0].time, 10 + K.CATCHUP_SLACK));

  ctx.currentTime = 10.5;
  core.frame();
  assert.equal(core.pressed(snapshot().view, 0, 0), "true");

  await core.onSessionTap({ t: 0, c: 0 });
  for (let i = 0; i < 400 && runtime().timer !== null; i++) {
    ctx.currentTime += 0.05;
    core.tick();
  }
  assert.equal(snapshot().view.events.length, 1);
  assert.equal(runtime().timer, null);
  assert.ok(runtime().rafId !== null);

  ctx.currentTime += 1;
  core.frame();
  assert.equal(core.pressed(snapshot().view, 0, 0), "false");
  assert.equal(runtime().rafId, null);
});

test("stop ramps the master gain to silence within thirty milliseconds and restores by the cut end", async () => {
  core.__reset();
  const ctx = fakeContext({ state: "running", clock: 10 });
  installEnv({ AudioContext: contextFactory(ctx) });
  await core.onSessionTap({ t: 0, c: 0 });
  core.tick();
  assert.ok(scheduled().length > 0);
  const master = runtime().master;
  const t0 = 10.5;
  ctx.currentTime = t0;
  core.stopAll();

  const ramps = master.gain.log.filter((entry) => entry.method === "linearRampToValueAtTime");
  const silence = ramps.find((entry) => entry.value === 0);
  assert.ok(silence.time <= t0 + 0.03 + EPSILON);
  assert.ok(approx(ramps[ramps.length - 1].time, t0 + 0.26));
  for (const entry of master.gain.log) {
    if (entry.value !== undefined) assert.ok(entry.value >= 0 && entry.value <= K.MASTER_CAP);
  }
  assert.equal(releases().length, toneLog.instruments.length);
  for (const release of releases()) assert.ok(release.time <= t0 + 0.03 + EPSILON);
});

test("a second stop repeats safely and a stop while suspended does not throw", async () => {
  core.__reset();
  const ctx = fakeContext({ state: "running", clock: 10 });
  installEnv({ AudioContext: contextFactory(ctx) });
  await core.onSessionTap({ t: 0, c: 0 });
  core.tick();
  core.stopAll();
  assert.doesNotThrow(() => core.stopAll());
  ctx.state = "suspended";
  assert.doesNotThrow(() => core.stopAll());
  assert.deepEqual(snapshot().state.active, [-1, -1, -1, -1]);
});

test("a stop while hidden restores the master gain to zero", async () => {
  core.__reset();
  const ctx = fakeContext({ state: "running", clock: 10 });
  const env = installEnv({ AudioContext: contextFactory(ctx) });
  await core.onSessionTap({ t: 0, c: 0 });
  core.tick();
  env.hidden = true;
  core.stopAll();
  const ramps = runtime().master.gain.log.filter((entry) => entry.method === "linearRampToValueAtTime");
  assert.equal(ramps[ramps.length - 1].value, 0);
});

test("stop releases every instrument at the cut time and sets the cut end", async () => {
  core.__reset();
  const ctx = fakeContext({ state: "running", clock: 10 });
  installEnv({ AudioContext: contextFactory(ctx) });
  await core.onSessionTap({ t: 0, c: 0 });
  core.tick();
  assert.ok(scheduled().length > 0);
  core.stopAll();
  assert.equal(releases().length, 6);
  for (const release of releases()) assert.ok(approx(release.time, 10 + K.STOP_FADE));
  assert.deepEqual(snapshot().state.active, [-1, -1, -1, -1]);
  assert.ok(approx(runtime().muteUntil, 10 + K.STOP_RESTORE + K.RESTORE_RAMP));
});

test("blocked audio keeps a launch pending, shows the resume state and survives a retry tap", async () => {
  core.__reset();
  const ctx = fakeContext({ state: "suspended", resume: "resolve-suspended" });
  installEnv({ AudioContext: contextFactory(ctx) });
  await core.onSessionTap({ t: 0, c: 2 });
  const { state, view, rt } = snapshot();
  assert.equal(view.audio, "suspended");
  assert.equal(core.audioBlocked(view, state), true);
  assert.equal(core.displayState(view.shownActive[0], core.displayQueued(view, state, 0), 2), "pending-on");
  assert.equal(rt.timer, null);
  await core.onSessionTap({ t: 0, c: 2 });
  assert.equal(snapshot().state.queued[0], 2);
});

test("a rejected resume leaves the launch pending without an unhandled failure", async () => {
  core.__reset();
  const ctx = fakeContext({ state: "suspended", resume: "reject" });
  installEnv({ AudioContext: contextFactory(ctx) });
  await core.onSessionTap({ t: 1, c: 1 });
  assert.equal(snapshot().view.audio, "suspended");
  assert.equal(snapshot().state.queued[1], 1);
  assert.equal(runtime().timer, null);
});

test("a state change to running starts the loop for a queued launch", async () => {
  core.__reset();
  const ctx = fakeContext({ state: "suspended", resume: "resolve-suspended" });
  installEnv({ AudioContext: contextFactory(ctx) });
  await core.onSessionTap({ t: 0, c: 0 });
  ctx.state = "running";
  core.onStateChange();
  assert.ok(runtime().timer !== null);
});

test("without a browser audio context the first tap resolves and marks audio unavailable", async () => {
  core.__reset();
  await core.onSessionTap({ t: 0, c: 0 });
  assert.equal(snapshot().view.noAudio, true);
  assert.deepEqual(snapshot().state.queued, [null, null, null, null]);
});

test("the audio session type is set to playback when a context is created", async () => {
  core.__reset();
  const session = { type: "ambient" };
  const ctx = fakeContext({ state: "running" });
  installEnv({ session, AudioContext: contextFactory(ctx) });
  await core.onSessionTap({ t: 0, c: 0 });
  assert.equal(session.type, "playback");
});

test("while audio is still settling the blocked state is hidden until the guard timer fires", async () => {
  core.__reset();
  const ctx = fakeContext({ state: "suspended", resume: "never" });
  const env = installEnv({ AudioContext: contextFactory(ctx) });
  core.onSessionTap({ t: 0, c: 1 });
  assert.equal(snapshot().view.audio, "none");
  assert.equal(core.audioBlocked(snapshot().view, snapshot().state), false);
  assert.equal(env.timeouts.length, 1);
  assert.equal(env.timeouts[0].ms, 1500);
  env.timeouts[0].fn();
  assert.equal(snapshot().view.audio, "suspended");
  assert.equal(core.audioBlocked(snapshot().view, snapshot().state), true);
  assert.equal(runtime().settleTimer, null);
});

test("repeated taps arm exactly one settle guard at a time", () => {
  core.__reset();
  const ctx = fakeContext({ state: "suspended", resume: "never" });
  const env = installEnv({ AudioContext: contextFactory(ctx) });
  core.onSessionTap({ t: 0, c: 1 });
  core.onSessionTap({ t: 0, c: 1 });
  core.onSessionTap({ t: 0, c: 1 });
  assert.equal(env.timeouts.length, 1);
});

test("a resume that settles first clears the recorded guard timer", async () => {
  core.__reset();
  const ctx = fakeContext({ state: "suspended", resume: "resolve-running" });
  const env = installEnv({ AudioContext: contextFactory(ctx) });
  await core.onSessionTap({ t: 0, c: 0 });
  assert.equal(env.cleared.length, 1);
  assert.equal(env.cleared[0], env.timeouts[0]);
});

test("a throwing audio constructor leaves the page silent and state unchanged on later taps", async () => {
  core.__reset();
  installEnv({
    AudioContext: function () {
      throw new Error("no audio");
    },
  });
  await core.onSessionTap({ t: 0, c: 0 });
  const before = snapshot().state;
  assert.equal(snapshot().view.noAudio, true);
  assert.deepEqual(before.queued, [null, null, null, null]);
  await core.onSessionTap({ t: 2, c: 3 });
  assert.equal(snapshot().state, before);
});

test("a start after a stop begins no earlier than the end of the cut", async () => {
  core.__reset();
  const ctx = fakeContext({ state: "running", clock: 10 });
  installEnv({ AudioContext: contextFactory(ctx) });
  await core.onSessionTap({ t: 0, c: 0 });
  core.tick();
  ctx.currentTime = 10.5;
  core.stopAll();
  await core.onSessionTap({ t: 1, c: 0 });
  assert.ok(snapshot().state.nextBar >= runtime().muteUntil);
});

test("a start with undrained events begins at or after the last event and keeps event times ordered", async () => {
  core.__reset();
  const ctx = fakeContext({ state: "running", clock: 0 });
  installEnv({ AudioContext: contextFactory(ctx) });
  const pending = core.onSessionTap({ t: 0, c: 0 });
  snapshot().view.events.push({ time: 20, active: [0, -1, -1, -1], age: [0, 0, 0, 0], scale: "soft" });
  await pending;
  assert.ok(snapshot().state.nextBar >= 20);
  ctx.currentTime = 19.9;
  core.tick();
  const times = snapshot().view.events.map((event) => event.time);
  for (let i = 1; i < times.length; i++) assert.ok(times[i] >= times[i - 1]);
});

test("the active clips change only on bar boundaries across ten bars", async () => {
  core.__reset();
  const ctx = fakeContext({ state: "running", clock: 0 });
  installEnv({ AudioContext: contextFactory(ctx) });
  await core.onSessionTap({ t: 0, c: 0 });
  await core.onSessionTap({ t: 1, c: 1 });
  for (let i = 0; i < 600; i++) {
    ctx.currentTime = i * 0.05;
    const before = JSON.stringify(snapshot().state.active);
    const eventsBefore = snapshot().view.events.length;
    core.tick();
    if (JSON.stringify(snapshot().state.active) !== before) {
      assert.ok(snapshot().view.events.length > eventsBefore);
    }
  }
  const times = snapshot().view.events.map((event) => event.time);
  assert.ok(times.length >= 10);
  for (let i = 1; i < times.length; i++) assert.ok(approx(times[i] - times[i - 1], K.BAR));
});

test("every instrument feeds the master bus and the master reaches the destination once", async () => {
  core.__reset();
  const ctx = fakeContext({ state: "running", clock: 0 });
  installEnv({ AudioContext: contextFactory(ctx) });
  await core.onSessionTap({ t: 0, c: 0 });
  await core.onSessionTap({ t: 2, c: 0 });
  core.tick();
  const master = runtime().master;
  assert.equal(master.destinations, 1);
  assert.equal(toneLog.instruments.length, 6);
  for (const instrument of toneLog.instruments) assert.deepEqual(instrument.connections, [master]);
});

test("drum and bass notes are scheduled on their own instruments with time, pitch and velocity", async () => {
  core.__reset();
  const ctx = fakeContext({ state: "running", clock: 0 });
  installEnv({ AudioContext: contextFactory(ctx) });
  await core.onSessionTap({ t: 0, c: 0 });
  await core.onSessionTap({ t: 1, c: 0 });
  core.tick();
  const kick = toneLog.instruments.find((inst) => inst.kind === "membrane").calls;
  assert.equal(kick[0].args[0], "A1");
  assert.ok(kick[0].time >= 0);
  const bass = toneLog.instruments.find((inst) => inst.kind === "mono").calls;
  assert.ok(bass[0].args[0] > 0);
  assert.ok(bass[0].args[3] > 0 && bass[0].args[3] <= 1);
});

test("no note is scheduled before the clock after the clock jumps forward", async () => {
  core.__reset();
  const ctx = fakeContext({ state: "running", clock: 0 });
  installEnv({ AudioContext: contextFactory(ctx) });
  await core.onSessionTap({ t: 0, c: 0 });
  await core.onSessionTap({ t: 3, c: 2 });
  core.tick();
  const beforeJump = new Set(scheduled());
  ctx.currentTime = 5;
  for (let i = 0; i < 100; i++) {
    core.tick();
    ctx.currentTime += 0.05;
  }
  const afterJump = scheduled().filter((call) => !beforeJump.has(call));
  assert.ok(afterJump.length > 0);
  for (const call of afterJump) assert.ok(call.time >= 5);
});

test("stop inside the lookahead window silences everything and ramps are scheduled after the cut", async () => {
  core.__reset();
  const ctx = fakeContext({ state: "running", clock: 10 });
  installEnv({ AudioContext: contextFactory(ctx) });
  await core.onSessionTap({ t: 0, c: 0 });
  core.tick();
  ctx.currentTime = 10.1;
  core.stopAll();
  assert.deepEqual(snapshot().state.active, [-1, -1, -1, -1]);
  for (const release of releases()) assert.ok(approx(release.time, 10.1 + K.STOP_FADE));
});

test("hiding then stopping then showing ends with a ramp back to the master cap", async () => {
  core.__reset();
  const ctx = fakeContext({ state: "running", clock: 10 });
  const env = installEnv({ AudioContext: contextFactory(ctx) });
  await core.onSessionTap({ t: 0, c: 0 });
  core.tick();
  env.hidden = true;
  core.onVisibility();
  core.stopAll();
  env.hidden = false;
  core.onVisibility();
  const ramps = runtime().master.gain.log.filter((entry) => entry.method === "linearRampToValueAtTime");
  assert.equal(ramps[ramps.length - 1].value, K.MASTER_CAP);
});

test("a restored page with a running context resumes its loop and draws the next frame", async () => {
  core.__reset();
  const ctx = fakeContext({ state: "running", clock: 10 });
  installEnv({ AudioContext: contextFactory(ctx) });
  await core.onSessionTap({ t: 0, c: 0 });
  core.tick();
  ctx.state = "suspended";
  core.frame();
  assert.equal(runtime().rafId, null);
  ctx.state = "running";
  core.onPageShow({ persisted: true });
  assert.ok(runtime().rafId !== null);
  assert.ok(runtime().timer !== null);
});

test("a page restore that is not from the back-forward cache changes nothing", () => {
  core.__reset();
  const ctx = fakeContext({ state: "suspended", clock: 10 });
  installEnv({ AudioContext: contextFactory(ctx) });
  core.__getState().rt.ctx = ctx;
  const before = JSON.stringify(snapshot().view);
  core.onPageShow({ persisted: false });
  assert.equal(JSON.stringify(snapshot().view), before);
  assert.equal(runtime().rafId, null);
});

test("a restored page with a still-suspended context shows blocked audio and no frame loop", async () => {
  core.__reset();
  const ctx = fakeContext({ state: "running", clock: 10 });
  installEnv({ AudioContext: contextFactory(ctx) });
  await core.onSessionTap({ t: 0, c: 0 });
  core.tick();
  ctx.state = "suspended";
  core.frame();
  core.onPageShow({ persisted: true });
  assert.equal(runtime().rafId, null);
  assert.equal(core.audioBlocked(snapshot().view, snapshot().state), true);
});

const ROOT_PATH = ROOT;
const readRepo = (relative) => fs.readFileSync(path.join(ROOT_PATH, relative), "utf8");
const SCRIPT = readRepo("js/explore-ableton-learning-music.js");
const PAGE = readRepo("explore/ableton-learning-music/index.njk");
const STYLE = readRepo("css/explore-ableton-learning-music.css");
const RESET = readRepo("css/reset.css");
const ENTRY = readRepo("explore/index.md");
const ALLOW_URLS = ["https://learningmusic.ableton.com/", "http://www.w3.org/2000/svg"];
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

const CANON = {
  columns: { en: ["Drums", "Bass", "Chords", "Melody"], id: ["Drum", "Bass", "Akord", "Melodi"] },
  stop: { en: "Stop", id: "Berhenti" },
  resume: { en: "Tap to keep playing", id: "Ketuk untuk lanjut bermain" },
  hintSilent: {
    en: "No sound? Ask a grown-up to check the sound.",
    id: "Tidak ada suara? Minta orang dewasa memeriksa suaranya.",
  },
  hintNoaudio: { en: "This browser cannot play the sounds.", id: "Browser ini tidak bisa memutar suara." },
  unofficial: {
    en: "Unofficial. Not made by or affiliated with Ableton.",
    id: "Tidak resmi. Tidak dibuat oleh atau berafiliasi dengan Ableton.",
  },
  inspired: {
    text: { en: "Inspired by Ableton Learning Music", id: "Terinspirasi dari Ableton Learning Music" },
    href: "https://learningmusic.ableton.com/",
  },
  noscript: {
    en: "This page needs JavaScript to play sounds.",
    id: "Halaman ini butuh JavaScript untuk memutar suara.",
  },
};

const VOID = new Set(["meta", "link", "br", "hr", "img", "input", "source"]);
const RAW = new Set(["script", "style"]);

function parseAttributes(text) {
  const attrs = {};
  const re = /([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
  }
  return attrs;
}

function parse(source) {
  const html = source.replace(/^---\n[\s\S]*?\n---\n/, "").replace(/<!doctype[^>]*>/i, "");
  const root = { tag: "#root", attrs: {}, children: [], parent: null };
  const stack = [root];
  const tagRe = /<(\/?)([a-zA-Z][\w-]*)((?:\s+[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*)\s*(\/?)>/y;
  const top = () => stack[stack.length - 1];
  let i = 0;
  while (i < html.length) {
    const lt = html.indexOf("<", i);
    const end = lt === -1 ? html.length : lt;
    if (end > i) top().children.push({ tag: "#text", text: html.slice(i, end), parent: top() });
    if (lt === -1) break;
    tagRe.lastIndex = lt;
    const m = tagRe.exec(html);
    if (!m) {
      top().children.push({ tag: "#text", text: "<", parent: top() });
      i = lt + 1;
      continue;
    }
    const [whole, closing, rawName, attrText, selfClosing] = m;
    const tag = rawName.toLowerCase();
    i = lt + whole.length;
    if (closing) {
      for (let k = stack.length - 1; k > 0; k--) {
        if (stack[k].tag === tag) {
          stack.length = k;
          break;
        }
      }
      continue;
    }
    const node = { tag, attrs: parseAttributes(attrText), children: [], parent: top() };
    top().children.push(node);
    if (RAW.has(tag) && !selfClosing) {
      const close = html.indexOf(`</${tag}`, i);
      const bodyEnd = close === -1 ? html.length : close;
      node.children.push({ tag: "#text", text: html.slice(i, bodyEnd), parent: node });
      i = close === -1 ? html.length : html.indexOf(">", close) + 1;
      continue;
    }
    if (!selfClosing && !VOID.has(tag)) stack.push(node);
  }
  return root;
}

function parseCompound(text) {
  const tests = [];
  const re = /([a-zA-Z][\w-]*)|#([\w-]+)|\.([\w-]+)|\[([\w-]+)(?:="([^"]*)")?\]/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m[1]) tests.push({ tag: m[1].toLowerCase() });
    else if (m[2]) tests.push({ id: m[2] });
    else if (m[3]) tests.push({ cls: m[3] });
    else tests.push({ attr: m[4], value: m[5] });
  }
  return tests;
}

function matchesCompound(node, tests) {
  if (node.tag.startsWith("#")) return false;
  return tests.every((test) => {
    if (test.tag !== undefined) return node.tag === test.tag;
    if (test.id !== undefined) return node.attrs.id === test.id;
    if (test.cls !== undefined) return (node.attrs.class || "").split(/\s+/).includes(test.cls);
    if (!(test.attr in node.attrs)) return false;
    return test.value === undefined || node.attrs[test.attr] === test.value;
  });
}

function matchesChain(node, chain) {
  if (!matchesCompound(node, chain[chain.length - 1])) return false;
  let index = chain.length - 2;
  let cursor = node.parent;
  while (index >= 0 && cursor && cursor.tag !== "#root") {
    if (matchesCompound(cursor, chain[index])) index -= 1;
    cursor = cursor.parent;
  }
  return index < 0;
}

function select(root, selector) {
  const chain = selector.trim().split(/\s*>\s*|\s+/).map(parseCompound);
  const found = [];
  const walk = (node) => {
    for (const child of node.children) {
      if (child.tag.startsWith("#")) continue;
      if (matchesChain(child, chain)) found.push(child);
      walk(child);
    }
  };
  walk(root);
  return found;
}

const collapse = (text) => text.replace(/\s+/g, " ").trim();

function textOf(node, { visible = false } = {}) {
  if (node.tag === "#text") return node.text;
  if (node.tag === "script" || node.tag === "style") return "";
  if (visible && "hidden" in node.attrs) return "";
  return collapse(node.children.map((child) => textOf(child, { visible })).join(" "));
}

function strings(root) {
  const out = [];
  const walk = (node) => {
    if (node.tag === "#text") out.push(node.text);
    for (const name of ["aria-label", "title", "alt"]) {
      if (node.attrs && node.attrs[name] !== undefined) out.push(node.attrs[name]);
    }
    for (const child of node.children || []) walk(child);
  };
  walk(root);
  return out;
}

function hrefs(root) {
  const out = [];
  const walk = (node) => {
    for (const name of ["href", "src"]) {
      if (node.attrs && node.attrs[name] !== undefined) out.push(node.attrs[name]);
    }
    for (const child of node.children || []) walk(child);
  };
  walk(root);
  return out;
}

const DOM = parse(PAGE);
const KID_COPY_SELECTORS = ["h1", "p.alm-intro", "#hint-tap", "#hint-silent", "#hint-noaudio", "#session"];
const DENIED = /\b(volume|turn up|undo|back|previous|mistake|wrong|fail|score|win)\b/i;

function visibleTextPieces(node, out) {
  if (node.tag === "#text") {
    out.push(collapse(node.text));
    return out;
  }
  if (node.tag === "script" || node.tag === "style" || "hidden" in node.attrs) return out;
  for (const child of node.children) visibleTextPieces(child, out);
  return out;
}

function kidSentences() {
  return KID_COPY_SELECTORS.flatMap((selector) => select(DOM, selector).flatMap((node) => visibleTextPieces(node, [])))
    .flatMap((text) => text.split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim()).filter(Boolean));
}

function functionRange(source, name) {
  const start = source.indexOf(`function ${name}(`);
  const open = source.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === "{") depth += 1;
    if (source[i] === "}") {
      depth -= 1;
      if (depth === 0) return [start, i];
    }
  }
  return [start, source.length];
}

function blockRanges(css, headerPattern) {
  const ranges = [];
  const re = new RegExp(headerPattern.source, "g");
  let m;
  while ((m = re.exec(css)) !== null) {
    const open = css.indexOf("{", m.index);
    let depth = 0;
    for (let i = open; i < css.length; i++) {
      if (css[i] === "{") depth += 1;
      if (css[i] === "}") {
        depth -= 1;
        if (depth === 0) {
          ranges.push([open, i]);
          break;
        }
      }
    }
  }
  return ranges;
}

function rules(css) {
  const out = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(css)) !== null) out.push({ selector: m[1].trim(), body: m[2], index: m.index });
  return out;
}

function luminance(hex) {
  const channel = (value) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function tokens(css) {
  const out = {};
  const re = /--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g;
  let m;
  while ((m = re.exec(css)) !== null) out[m[1]] = m[2];
  return out;
}

function padSide(width, height) {
  return Math.max(212, Math.min(height - 56, width - 176, 376));
}

const countOf = (text, pattern) => (text.match(new RegExp(pattern, "g")) || []).length;

test("the script contains no HTML string sinks", () => {
  assert.equal(/innerHTML|outerHTML|insertAdjacentHTML|document\.write/.test(SCRIPT), false);
});

test("no storage, network or dynamic code loading appears in the page, styles or script", () => {
  const forbidden = /localStorage|sessionStorage|indexedDB|document\.cookie|XMLHttpRequest|sendBeacon|WebSocket|EventSource|new Image|fetch\(/;
  for (const source of [SCRIPT, PAGE, STYLE, RESET]) assert.equal(forbidden.test(source), false);
});

test("the page and styles contain no mail links, empty anchors, forms, frames or imports", () => {
  for (const source of [PAGE, STYLE, RESET]) {
    assert.equal(/mailto:|href="#"|<form|<iframe|@import|url\(/.test(source), false);
  }
});

test("every absolute URL in the sources is an allowed one and the SVG namespace appears only in svg tags", () => {
  for (const source of [SCRIPT, PAGE, STYLE]) {
    for (const url of source.match(/https?:\/\/[^"'\s)<>]+/g) || []) {
      assert.ok(ALLOW_URLS.some((allowed) => url.startsWith(allowed)), url);
    }
  }
  const namespaceUses = countOf(PAGE, SVG_NAMESPACE);
  const svgWithNamespace = countOf(PAGE, /<svg[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.equal(namespaceUses, svgWithNamespace);
});

test("the inspired-by link opens without a target and with a safe rel", () => {
  const link = select(DOM, "a.alm-inspired")[0];
  assert.equal(link.attrs.rel, "noopener noreferrer");
  assert.equal("target" in link.attrs, false);
});

test("the script wires exactly one destination connection and two master gain touches", () => {
  assert.equal(countOf(SCRIPT, "toDestination\\(\\)"), 1);
  assert.equal(countOf(SCRIPT, "ctx\\.destination"), 0);
  assert.ok(/try\s*\{\s*rt\.ctx = new env\.AudioContext\(\)/.test(SCRIPT));
});

test("the script calls setTimeout only through the environment in the one guard site", () => {
  const withoutDefaults = SCRIPT
    .replace(/const defaultEnv = \{[\s\S]*?\n\};/, "")
    .replace(/function browserEnv\(\) \{[\s\S]*?\n\}/, "");
  assert.equal(countOf(withoutDefaults, "setTimeout"), 1);
  assert.ok(withoutDefaults.includes("env.setTimeout("));
});

test("the page declares the exact viewport and no zoom restrictions", () => {
  const meta = select(DOM, 'meta[name="viewport"]')[0];
  assert.equal(meta.attrs.content, "width=device-width, initial-scale=1");
  for (const word of ["user-scalable", "maximum-scale", "viewport-fit"]) {
    assert.equal(PAGE.includes(word), false);
  }
});

test("animations, transitions and keyframes live only inside the reduced-motion-safe block", () => {
  const ranges = blockRanges(STYLE, /@media \(prefers-reduced-motion: no-preference\)/);
  const re = /animation|transition|@keyframes/g;
  let m;
  while ((m = re.exec(STYLE)) !== null) {
    assert.ok(ranges.some(([start, end]) => m.index > start && m.index < end), m[0]);
  }
});

test("hover styles live only inside the hover-capable block", () => {
  const ranges = blockRanges(STYLE, /@media \(hover: hover\)/);
  const re = /:hover/g;
  let m;
  while ((m = re.exec(STYLE)) !== null) {
    assert.ok(ranges.some(([start, end]) => m.index > start && m.index < end));
  }
});

test("the stylesheet declares the hidden rule once and uses it for no other selector", () => {
  assert.equal(countOf(STYLE, "\\[hidden\\]"), 1);
  assert.ok(/\[hidden\]\s*\{\s*display:\s*none\s*!important;?\s*\}/.test(STYLE));
});

test("the page hides the resume control and no-audio hint at first paint", () => {
  assert.equal(select(DOM, "#resume")[0].attrs.hidden !== undefined, true);
  assert.equal(select(DOM, "#hint-noaudio")[0].attrs.hidden !== undefined, true);
});

test("all sixteen pads start off, unpressed and each row and column appears once", () => {
  const pads = select(DOM, "button.clip");
  assert.equal(pads.length, 16);
  const seen = new Set();
  for (const pad of pads) {
    assert.ok(pad.attrs.class.split(/\s+/).includes("is-off"));
    assert.equal(pad.attrs["aria-pressed"], "false");
    seen.add(`${pad.attrs["data-t"]},${pad.attrs["data-c"]}`);
  }
  assert.equal(seen.size, 16);
});

test("the page opens with the front matter and an explicit language attribute", () => {
  assert.ok(PAGE.startsWith("---\nlayout: false\n"));
  assert.ok(PAGE.includes('<html lang="id">'));
});

test("the page has exactly one session section with its group role and label", () => {
  const sessions = select(DOM, "#session");
  assert.equal(sessions.length, 1);
  assert.equal(sessions[0].attrs.role, "group");
  assert.equal(sessions[0].attrs["aria-label"], "Lagu kamu");
});

test("the back link to the explore index and the language switch sit in the top bar", () => {
  const back = select(DOM, "header.topbar a.back")[0];
  assert.equal(back.attrs.href, "/explore/");
  const langs = select(DOM, ".lang button").map((node) => node.attrs["data-lang"]);
  assert.deepEqual(langs, ["id", "en"]);
});

test("the no-script message carries the canonical text", () => {
  assert.ok(textOf(select(DOM, "noscript")[0]).includes(CANON.noscript.en));
});

test("the four track names and the unofficial line appear on the page", () => {
  const heads = select(DOM, ".col-head span").map((node) => textOf(node));
  assert.deepEqual(heads, CANON.columns.id);
  assert.equal(textOf(select(DOM, "p.alm-unofficial")[0]), CANON.unofficial.id);
});

test("the entry page lists the title and ends the blurb with the unofficial line", () => {
  const item = ENTRY.split("\n").find((line) => line.includes("/explore/ableton-learning-music/"));
  assert.ok(item.includes("Make a Song"));
  assert.ok(item.includes(CANON.unofficial.en));
});

test("the canonical copy matches the hint, resume, stop, no-audio and footer text", () => {
  assert.equal(textOf(select(DOM, "#hint-silent")[0]), CANON.hintSilent.id);
  assert.equal(textOf(select(DOM, "#hint-noaudio")[0]), CANON.hintNoaudio.id);
  assert.equal(textOf(select(DOM, "#resume")[0]), CANON.resume.id);
  assert.equal(textOf(select(DOM, "#stop")[0]), CANON.stop.id);
  const inspired = select(DOM, "a.alm-inspired")[0];
  assert.equal(textOf(inspired), CANON.inspired.text.id);
  assert.equal(inspired.attrs.href, CANON.inspired.href);
});

test("kid copy avoids every denied word and the grown-ups line stays in the footer", () => {
  for (const sentence of kidSentences()) assert.equal(DENIED.test(sentence), false, sentence);
  const grownUps = select(DOM, "footer#about p.alm-grownups")[0];
  assert.ok(/volume/i.test(textOf(grownUps)));
  assert.equal(kidSentences().some((sentence) => /volume/i.test(sentence)), false);
});

test("every kid sentence has at most eight words", () => {
  const longest = Math.max(...kidSentences().map((sentence) => sentence.split(/\s+/).length));
  assert.ok(longest <= 8, `longest kid sentence has ${longest} words`);
});

test("the word ableton appears only in the unofficial line, the inspired link text and its address", () => {
  const scrubbed = PAGE.replace(/ableton-learning-music/gi, "");
  const total = (scrubbed.match(/ableton/gi) || []).length;
  const link = select(DOM, "a.alm-inspired")[0];
  const allowed = [textOf(select(DOM, "p.alm-unofficial")[0]), textOf(link), link.attrs.href];
  const inAllowed = allowed.reduce((count, text) => count + (text.match(/ableton/gi) || []).length, 0);
  assert.equal(total, inAllowed);
});

test("the script keeps browser globals inside the two browser functions only", () => {
  const allowed = [functionRange(SCRIPT, "browserEnv"), functionRange(SCRIPT, "bindListeners")];
  for (const word of ["navigator", "matchMedia", "location", "history"]) {
    const re = new RegExp(word, "g");
    let m;
    while ((m = re.exec(SCRIPT)) !== null) {
      assert.ok(allowed.some(([start, end]) => m.index >= start && m.index <= end), word);
    }
  }
});

test("the stylesheet never fades pads by opacity, never outlines outside focus, and never pins elements", () => {
  for (const rule of rules(STYLE)) {
    if (rule.selector.includes(".clip")) assert.equal(rule.body.includes("opacity"), false);
    if (rule.body.includes("outline")) assert.ok(rule.selector.includes(":focus-visible"));
  }
  assert.equal(/position:\s*(sticky|fixed)/.test(STYLE), false);
  for (const rule of rules(STYLE)) {
    if (rule.selector === ".controls") assert.equal(/position:/.test(rule.body), false);
  }
});

test("the script declares the tempo once and never reassigns it", () => {
  assert.equal(countOf(SCRIPT, "const BPM\\b"), 1);
  assert.equal(countOf(SCRIPT, "\\bBPM\\s*=(?!=)"), 1);
});

test("the script has no speech, download, network or blob APIs", () => {
  assert.equal(/speechSynthesis|Blob|download|fetch\(/.test(SCRIPT), false);
});

test("the script begins with an immediately invoked function", () => {
  assert.ok(/^\s*\((function|\(\s*\)\s*=>)/.test(SCRIPT));
});

test("track entries carry no legacy name or icon fields", () => {
  for (const track of core.TRACKS) {
    assert.equal("name" in track, false);
    assert.equal("icon" in track, false);
  }
});

test("pad colours stay readable against the dark surfaces", () => {
  const colors = tokens(STYLE);
  for (const key of ["t0", "t1", "t2", "t3"]) {
    assert.ok(contrast(colors[key], colors.off) >= 4.5, `${key} on off`);
    assert.ok(contrast(colors[key], colors.bg) >= 3, `${key} border on bg`);
    assert.ok(contrast(colors.ink, colors[key]) >= 4.5, `ink on ${key}`);
  }
});

test("the landscape rule gives pad sizes of seventy point seven five, fifty-seven and eighty-five pixels", () => {
  assert.ok(STYLE.includes("--head: 36px"));
  assert.ok(STYLE.includes("max(212px, min(100vh - 56px, 100vw - 176px, 376px))"));
  assert.ok(/@supports \(height: 100svh\)/.test(STYLE));
  const pad = (width, height) => Math.max(44, (padSide(width, height) - 36) / 4);
  assert.ok(Math.abs(pad(667, 375) - 70.75) < 1e-9);
  assert.ok(Math.abs(pad(568, 320) - 57) < 1e-9);
  assert.ok(Math.abs(pad(800, 480) - 85) < 1e-9);
});

test("no version two control identifiers or data attributes appear on the page", () => {
  for (const id of ["play-song", "new-song", "scale-soft", "scale-minor", "lang-en", "lang-id", "hint-first"]) {
    assert.equal(PAGE.includes(`id="${id}"`), false);
  }
  assert.equal(PAGE.includes("data-id"), false);
});

const BUILT_PAGE = path.join(ROOT_PATH, "_site/explore/ableton-learning-music/index.html");
const BUILT_EXISTS = fs.existsSync(path.join(ROOT_PATH, "_site"));
const SITE_IGNORED = ["projects", "scratchs", "provness", "ref"];

test("the built page starts with a doctype and loads only the script and two stylesheets", (t) => {
  if (!fs.existsSync(BUILT_PAGE)) return t.skip("run eleventy first");
  const html = fs.readFileSync(BUILT_PAGE, "utf8");
  assert.ok(html.trimStart().toLowerCase().startsWith("<!doctype html>"));
  assert.equal(countOf(html, "<script"), 2);
  assert.ok(html.includes('src="/js/vendor/tone-15.5.66.js"'));
  assert.ok(html.includes('src="/js/explore-ableton-learning-music.js"'));
  assert.equal(countOf(html, "<link"), 2);
  const root = parse(html);
  const linked = hrefs(root);
  for (const value of linked) {
    const local = value.startsWith("/") && !value.startsWith("//") || value.startsWith("#") || !value.includes(":");
    assert.ok(local || ALLOW_URLS.some((allowed) => value.startsWith(allowed)), value);
  }
  assert.ok(fs.existsSync(path.join(ROOT_PATH, "_site/css/reset.css")));
  assert.ok(fs.existsSync(path.join(ROOT_PATH, "_site/css/explore-ableton-learning-music.css")));
});

test("the built page title reads Buat Lagu / Make a Song", (t) => {
  if (!fs.existsSync(BUILT_PAGE)) return t.skip("run eleventy first");
  const html = fs.readFileSync(BUILT_PAGE, "utf8");
  assert.equal(textOf(select(parse(html), "title")[0]), "Buat Lagu / Make a Song");
});

test("the built site contains none of the working folders", (t) => {
  if (!BUILT_EXISTS) return t.skip("run eleventy first");
  for (const dir of SITE_IGNORED) {
    assert.equal(fs.existsSync(path.join(ROOT_PATH, "_site", dir)), false, dir);
  }
});

const TONE_FILES = ["js/vendor/tone-15.5.66.js", "js/vendor/tone-15.5.66.LICENSE.txt"];

function listSite(dir, prefix = "") {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const relative = prefix + entry.name;
    if (entry.isDirectory()) out.push(...listSite(path.join(dir, entry.name), relative + "/"));
    else out.push(relative);
  }
  return out;
}

test("the built site file listing matches the recorded baseline", (t) => {
  if (!BUILT_EXISTS) return t.skip("run eleventy first");
  const results = fs.readFileSync(path.join(ROOT_PATH, "projects/ableton-learning-music/results.md"), "utf8");
  const match = results.match(/^SITE-BEFORE: (.*)$/m);
  if (!match) return t.skip("SITE-BEFORE absent");
  const files = listSite(path.join(ROOT_PATH, "_site"))
    .filter((file) => !SITE_IGNORED.some((dir) => file.startsWith(dir + "/")))
    .filter((file) => !TONE_FILES.includes(file))
    .sort();
  const digest = crypto.createHash("sha256");
  for (const file of files) digest.update(file + "\n");
  assert.equal(digest.digest("hex"), match[1].trim());
});

test("the stylesheet hash matches the recorded value", (t) => {
  const results = fs.readFileSync(path.join(ROOT_PATH, "projects/ableton-learning-music/results.md"), "utf8");
  const match = results.match(/^C-HASH: (.*)$/m);
  if (!match) return t.skip("C-HASH absent");
  const digest = crypto.createHash("sha256").update(fs.readFileSync(path.join(ROOT_PATH, "css/explore-ableton-learning-music.css"))).digest("hex");
  assert.equal(digest, match[1].trim());
});

test("the reference text contains none of the eight-word windows from the page or entry", (t) => {
  const refDir = path.join(ROOT_PATH, "ref");
  const names = fs.existsSync(refDir)
    ? fs.readdirSync(refDir).filter((name) => /\.(txt|md)$/.test(name) && name !== "INDEX.md")
    : [];
  if (names.length === 0) return t.skip("reference text absent: string diff skipped; a release needs a run");
  const normalize = (text) => text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
  const windows = (words) => {
    const out = new Set();
    for (let i = 0; i + 8 <= words.length; i++) out.add(words.slice(i, i + 8).join(" "));
    return out;
  };
  const reference = windows(normalize(names.map((name) => fs.readFileSync(path.join(refDir, name), "utf8")).join(" ")));
  const pageWords = normalize(strings(DOM).join(" ") + " " + ENTRY);
  for (const window of windows(pageWords)) assert.equal(reference.has(window), false, window);
  t.diagnostic("string diff ref files: " + names.join(","));
});
