(function () {
  "use strict";

  const BPM = 112;
  const BAR_STEPS = 16;
  const PHRASE_BARS = 4;
  const STEP = 60 / BPM / 4;
  const BAR = STEP * BAR_STEPS;
  const PHRASE = BAR * PHRASE_BARS;
  const SWING = 0.16;
  const STRUM = 0.012;
  const TICK_MS = 25;
  const LOOKAHEAD_HOME = 0.2;
  const LOOKAHEAD_LESSON = 0.12;
  const CATCHUP_SLACK = 0.05;
  const MAX_VOICES = 8;
  const UNLOCK_SETTLE_MS = 1500;
  const STOP_FADE = 0.06;
  const STOP_RELEASE = 0.1;
  const STOP_RESTORE = 0.25;
  const CLAMP = 0.8;
  const SHAPE_KNEE = 0.1;
  const SHAPER_CEILING = 0.89640;
  const SHAPER_POINTS = 2048;
  const CAP_HOME = 0.8;
  const CAP_LESSON = 0.55;
  const REVERB_SEED = 0x5eed1a7c;
  const REVERB_SECONDS = 3;
  const REVERB_PREDELAY = 0.02;
  
  const DRUM_LANES = ["kick", "snare", "clap", "hat", "openhat"];
  const DRUM_VELOCITY = { X: 1, x: 0.75, o: 0.35 };
  const DRUM_DURATION = { kick: 0.3, snare: 0.15, clap: 0.12, hat: 0.03, openhat: 0.2 };
  const BASS_VALUES = ["off", "root", "fifth", "octave"];

  const BASS_DEGREES = {
    Am: { root: "A1", fifth: "E2", octave: "A2" },
    F: { root: "F1", fifth: "C2", octave: "F2" },
    C: { root: "C2", fifth: "G2", octave: "C3" },
    G: { root: "G1", fifth: "D2", octave: "G2" },
  };

  const CHORD_TONES = {
    Am: ["A3", "C4", "E4"],
    F: ["A3", "C4", "F4"],
    C: ["G3", "C4", "E4"],
    G: ["G3", "B3", "D4"],
  };

  const CHORD_IDS = ["Am", "F", "C", "G"];

  const ARRANGE_DRUMS = {
    kick: "X...X...X...X...",
    snare: "....X.......X...",
    hat: "................",
  };

  const ARRANGE_MELODY = ["E4", "D4", "C4", "D4", "E4", "D4", "C4", "C4"];

  const NOTE_OFFSETS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  const TIMING = Object.freeze({
    bpm: BPM,
    barSteps: BAR_STEPS,
    phraseBars: PHRASE_BARS,
    step: STEP,
    stepDur: STEP,
    beat: STEP * 4,
    beatDur: STEP * 4,
    bar: BAR,
    phrase: PHRASE,
    swing: SWING,
    strum: STRUM,
    tickMs: TICK_MS,
    maxVoices: MAX_VOICES,
  });

  const PARITY_FIXTURE = {
    id: "parity-v1",
    bars: [
      {
        chord: "Am",
        drums: { kick: "X...X...X...X...", snare: "....X.......X...", hat: "................" },
        bass: ["root", "off", "fifth", "off"],
        keys: ["C4", null, "E4", null, "G4", null, "C5", null],
      },
      {
        chord: "F",
        drums: {
          kick: "X...X...X...X...",
          snare: "....X.......X...",
          hat: "x.x.x.x.x.x.x.x.",
          openhat: "......x.........",
        },
        bass: ["root", "fifth", "off", "octave"],
        keys: ["A4", null, null, "C5", null, "F4", null, "E4"],
      },
      {
        chord: "C",
        drums: { kick: "X...X...X...X...", snare: "....X.......X...", hat: "x.o.x.o.x.o.x.o." },
        bass: ["root", "off", "fifth", "off"],
        keys: ["G4", "E4", "C4", null, "E4", null, "G4", null],
      },
      {
        chord: "G",
        drums: { kick: "X...X...X...X...", snare: "....X.......X...", hat: "................" },
        bass: ["root", "fifth", "off", "root"],
        keys: ["D4", null, "B4", null, "G4", null, "D4", null],
      },
    ],
  };

  function tone() {
    if (typeof globalThis !== "undefined" && globalThis.Tone) return globalThis.Tone;
    return undefined;
  }

  function audioContextCtor() {
    if (typeof window !== "undefined") {
      if (typeof window.AudioContext === "function") return window.AudioContext;
      if (typeof window.webkitAudioContext === "function") return window.webkitAudioContext;
    }
    if (typeof globalThis !== "undefined") {
      if (typeof globalThis.AudioContext === "function") return globalThis.AudioContext;
      if (typeof globalThis.webkitAudioContext === "function") return globalThis.webkitAudioContext;
    }
    return null;
  }

  function noteToMidi(note) {
    if (typeof note !== "string") return null;
    const match = /^([A-G])(#|b)?(-?\d+)$/.exec(note);
    if (match === null) return null;
    let value = NOTE_OFFSETS[match[1]] + Number(match[3]) * 12 + 12;
    if (match[2] === "#") value += 1;
    else if (match[2] === "b") value -= 1;
    return value;
  }

  const BANDS = {
    melody: [noteToMidi("C4"), noteToMidi("C5")],
    chords: [noteToMidi("G3"), noteToMidi("A4")],
    bass: [noteToMidi("F1"), noteToMidi("C3")],
  };

  function inBand(note, band) {
    const midi = noteToMidi(note);
    if (midi === null) return false;
    const range = BANDS[band];
    return midi >= range[0] && midi <= range[1];
  }

  function shape(x) {
    const magnitude = Math.abs(x);
    const bent =
      magnitude <= CLAMP ? x : Math.sign(x) * (CLAMP + SHAPE_KNEE * Math.tanh((magnitude - CLAMP) / SHAPE_KNEE));
    return Math.min(Math.max(bent, -SHAPER_CEILING), SHAPER_CEILING);
  }

  function clampGain(g, cap) {
    return Math.min(Math.max(g, 0), cap);
  }

  function shaperCurve() {
    const curve = new Float32Array(SHAPER_POINTS);
    for (let i = 0; i < SHAPER_POINTS; i++) curve[i] = shape(-1 + (2 * i) / (SHAPER_POINTS - 1));
    return curve;
  }

  function mulberry32(seed) {
    let state = seed;
    return function () {
      state |= 0;
      state = (state + 0x6d2b79f5) | 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function synthesizeImpulse(sampleRate) {
    const rate = Number.isFinite(sampleRate) && sampleRate > 0 ? sampleRate : 44100;
    const length = Math.round(rate * REVERB_SECONDS);
    const preDelay = Math.round(REVERB_PREDELAY * rate);
    const out = new Float32Array(length + preDelay);
    const rand = mulberry32(REVERB_SEED);
    for (let i = 0; i < length; i++) {
      const noise = 2 * rand() - 1;
      const env = Math.pow(1 - i / length, 2);
      out[preDelay + i] = noise * env;
    }
    return out;
  }

  function impulseBuffer(sampleRate) {
    const data = synthesizeImpulse(sampleRate);
    const Tone = tone();
    let raw = null;
    try {
      raw = Tone.getContext().rawContext;
    } catch {
      raw = null;
    }
    if (raw && typeof raw.createBuffer === "function") {
      const buffer = raw.createBuffer(1, data.length, sampleRate);
      buffer.getChannelData(0).set(data);
      return buffer;
    }
    return data;
  }

  function buildProfileGraph(profile, context) {
    const Tone = tone();
    const isHome = profile === "home";
    const cap = isHome ? CAP_HOME : CAP_LESSON;
    const glue = isHome
      ? new Tone.Compressor({ threshold: -18, ratio: 3, attack: 0.01, release: 0.2 })
      : new Tone.Compressor({ threshold: -6, ratio: 20, knee: 0, attack: 0.003, release: 0.1 });
    const master = new Tone.Gain(cap);
    let shaper = null;
    glue.connect(master);
    if (isHome) {
      master.connect(context.destination);
    } else {
      shaper = new Tone.WaveShaper(shaperCurve(), SHAPER_POINTS);
      shaper.oversample = "none";
      master.connect(shaper);
      shaper.connect(context.destination);
    }
    return { profile: isHome ? "home" : "lesson", cap, glue, master, shaper };
  }

  function buildVoices(destination) {
    const Tone = tone();
    const sampleRate = Tone.getContext().sampleRate;
    const reverb = new Tone.Convolver({ buffer: impulseBuffer(sampleRate), wet: 1 }).connect(destination);
    const echo = new Tone.FeedbackDelay({ delayTime: STEP * 3, feedback: 0.35, wet: 1 });
    echo.chain(new Tone.Filter(2500, "lowpass"), destination);
    const wire = function (node, verb, delay) {
      node.connect(destination);
      if (verb) node.connect(new Tone.Gain(verb).connect(reverb));
      if (delay) node.connect(new Tone.Gain(delay).connect(echo));
      return node;
    };

    const kick = wire(
      new Tone.MembraneSynth({
        pitchDecay: 0.04,
        octaves: 5,
        envelope: { attack: 0.001, decay: 0.45, sustain: 0, release: 0.1 },
        volume: -2,
      }),
    );

    const snare = new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: { attack: 0.001, decay: 0.18, sustain: 0 },
      volume: -8,
    });
    snare.connect(wire(new Tone.Filter({ type: "bandpass", frequency: 2000, Q: 0.8 }), 0.2));
    const snareBody = wire(
      new Tone.MembraneSynth({
        pitchDecay: 0.02,
        octaves: 2,
        envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.05 },
        volume: -10,
      }),
    );

    const clap = new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0 },
      volume: -6,
    });
    clap.connect(wire(new Tone.Filter({ type: "bandpass", frequency: 1200, Q: 1.2 }), 0.25));

    const hatFilter = wire(new Tone.Filter(7500, "highpass"), 0.1);
    const hat = new Tone.NoiseSynth({
      envelope: { attack: 0.001, decay: 0.035, sustain: 0 },
      volume: -14,
    }).connect(hatFilter);
    const openhat = new Tone.NoiseSynth({
      envelope: { attack: 0.001, decay: 0.28, sustain: 0 },
      volume: -17,
    }).connect(hatFilter);

    const bass = wire(
      new Tone.MonoSynth({
        oscillator: { type: "sawtooth" },
        filter: { type: "lowpass", rolloff: -24, Q: 2 },
        envelope: { attack: 0.005, decay: 0.3, sustain: 0.6, release: 0.08 },
        filterEnvelope: {
          attack: 0.005,
          decay: 0.25,
          sustain: 0.25,
          release: 0.1,
          baseFrequency: 90,
          octaves: 3.2,
        },
        volume: -6,
      }),
    );

    const keys = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 8,
      oscillator: { type: "sine" },
      modulation: { type: "sine" },
      envelope: { attack: 0.004, decay: 1.6, sustain: 0.15, release: 1.2 },
      modulationEnvelope: { attack: 0.002, decay: 0.4, sustain: 0.05, release: 0.4 },
      volume: -4,
    });
    const chorus = new Tone.Chorus(3, 2.5, 0.4);
    chorus.width = 0.12;
    chorus.start();
    keys.connect(wire(chorus, 0.3));

    const lead = wire(
      new Tone.MonoSynth({
        oscillator: { type: "square" },
        filter: { type: "lowpass", rolloff: -12, Q: 1 },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.3 },
        filterEnvelope: {
          attack: 0.01,
          decay: 0.2,
          sustain: 0.3,
          release: 0.3,
          baseFrequency: 700,
          octaves: 2,
        },
        volume: -12,
      }),
      0.25,
      0.3,
    );

    const monophonic = [kick, snare, snareBody, clap, hat, openhat, bass, lead];

    function drum(lane, time, vel) {
      if (!Number.isFinite(time) || !Number.isFinite(vel)) return;
      if (lane === "kick") kick.triggerAttackRelease("A1", DRUM_DURATION.kick, time, vel);
      else if (lane === "snare") {
        snare.triggerAttackRelease(DRUM_DURATION.snare, time, vel);
        snareBody.triggerAttackRelease("G3", 0.08, time, vel * 0.6);
      } else if (lane === "clap") {
        clap.triggerAttackRelease(0.008, time, vel * 0.7);
        clap.triggerAttackRelease(0.008, time + 0.012, vel * 0.8);
        clap.triggerAttackRelease(DRUM_DURATION.clap, time + 0.024, vel);
      } else if (lane === "hat") hat.triggerAttackRelease(DRUM_DURATION.hat, time, vel);
      else if (lane === "openhat") openhat.triggerAttackRelease(DRUM_DURATION.openhat, time, vel);
    }

    function note(track, noteValue, dur, time, vel) {
      if (!Number.isFinite(dur) || !Number.isFinite(time) || !Number.isFinite(vel)) return;
      if (noteToMidi(noteValue) === null) return;
      const length = Math.max(dur - 0.01, 0.01);
      if (track === "bass") bass.triggerAttackRelease(noteValue, length, time, vel);
      else if (track === "lead") lead.triggerAttackRelease(noteValue, length, time, vel);
      else if (track === "keys") keys.triggerAttackRelease(noteValue, dur, time, vel);
    }

    function chord(notes, dur, time, vel, strum) {
      if (!Array.isArray(notes)) return;
      if (!Number.isFinite(dur) || !Number.isFinite(time) || !Number.isFinite(vel)) return;
      const usable = notes.filter((value) => noteToMidi(value) !== null).slice(0, MAX_VOICES);
      if (usable.length === 0) return;
      const offset = Number.isFinite(strum) ? strum : STRUM;
      usable.forEach((value, index) => keys.triggerAttackRelease(value, dur, time + index * offset, vel));
    }

    function releaseAll(time) {
      const at = Number.isFinite(time) ? time : 0;
      for (const synth of monophonic) synth.triggerRelease(at);
      keys.releaseAll(at);
    }

    return { kick, snare, clap, hat, openhat, bass, keys, lead, reverb, echo, drum, note, chord, releaseAll };
  }

  function laneCharacters(line) {
    if (typeof line !== "string") return null;
    const compact = line.replace(/\s+/g, "");
    if (compact.length !== BAR_STEPS) return null;
    for (const character of compact) {
      if (character !== "." && DRUM_VELOCITY[character] === undefined) return null;
    }
    return compact.split("");
  }

  function parsePattern(line) {
    if (typeof line !== "string") return null;
    const tokens = line.trim().split(/\s+/);
    if (tokens.length !== BAR_STEPS) return null;
    for (const token of tokens) {
      if (token.length !== 1) return null;
      if (token !== "." && DRUM_VELOCITY[token] === undefined) return null;
    }
    return tokens;
  }

  function emptySteps() {
    const steps = [];
    for (let i = 0; i < BAR_STEPS; i++) steps.push({ step: i + 1, events: [] });
    return steps;
  }

  function compileDrum(payload) {
    if (payload === null || typeof payload !== "object") return null;
    const lanes = payload.lanes;
    if (lanes === null || typeof lanes !== "object") return null;
    const parsed = {};
    let count = 0;
    for (const lane of DRUM_LANES) {
      if (lanes[lane] === undefined) continue;
      const characters = laneCharacters(lanes[lane]);
      if (characters === null) return null;
      parsed[lane] = characters;
      count++;
    }
    if (count === 0) return null;
    const steps = emptySteps();
    for (let i = 0; i < BAR_STEPS; i++) {
      for (const lane of DRUM_LANES) {
        const characters = parsed[lane];
        if (characters === undefined) continue;
        const character = characters[i];
        if (character === ".") continue;
        steps[i].events.push({
          kind: "drum",
          voice: lane,
          notes: [],
          dur: DRUM_DURATION[lane],
          vel: DRUM_VELOCITY[character],
        });
      }
    }
    return { steps };
  }

  function compileBass(payload, chordId) {
    if (payload === null || typeof payload !== "object") return null;
    const cells = payload.cells;
    if (!Array.isArray(cells) || cells.length !== 4) return null;
    for (const cell of cells) {
      if (!BASS_VALUES.includes(cell)) return null;
    }
    const chord = BASS_DEGREES[chordId] ? chordId : "Am";
    const degrees = BASS_DEGREES[chord];
    const steps = emptySteps();
    const dur = 0.9 * STEP * 4;
    for (let beat = 0; beat < 4; beat++) {
      const cell = cells[beat];
      if (cell === "off") continue;
      const noteValue = degrees[cell];
      if (!inBand(noteValue, "bass")) return null;
      steps[beat * 4].events.push({ kind: "note", voice: "bass", notes: [noteValue], dur, vel: 0.7 });
    }
    return { steps };
  }

  function compileKeys(payload) {
    if (payload === null || typeof payload !== "object") return null;
    const slots = payload.slots;
    if (!Array.isArray(slots) || slots.length !== 8) return null;
    const rewrite = payload.rewriteSlots === undefined ? [] : payload.rewriteSlots;
    if (!Array.isArray(rewrite)) return null;
    const seen = new Set();
    let previous = -1;
    for (const index of rewrite) {
      if (!Number.isInteger(index) || index < 0 || index > 7) return null;
      if (seen.has(index) || index <= previous) return null;
      seen.add(index);
      previous = index;
    }
    for (const slot of slots) {
      if (slot === null) continue;
      if (!inBand(slot, "melody")) return null;
    }
    const steps = emptySteps();
    for (let slot = 0; slot < 8; slot++) {
      const value = slots[slot];
      if (value === null) continue;
      const noteValue = seen.has(slot) ? "C4" : value;
      steps[slot * 2].events.push({
        kind: "note",
        voice: "lead",
        notes: [noteValue],
        dur: 2 * STEP,
        vel: 0.75,
      });
    }
    return { steps };
  }

  function compileChords(payload, barIndex) {
    if (payload === null || typeof payload !== "object") return null;
    const progression = payload.progression;
    if (!Array.isArray(progression) || progression.length !== PHRASE_BARS) return null;
    for (const id of progression) {
      const tones = CHORD_TONES[id];
      if (tones === undefined) return null;
      for (const tone of tones) {
        if (!inBand(tone, "chords")) return null;
      }
    }
    const bar = Number.isInteger(barIndex) && barIndex >= 0 && barIndex < PHRASE_BARS ? barIndex : 0;
    const steps = emptySteps();
    steps[0].events.push({
      kind: "chord",
      voice: "chord",
      notes: CHORD_TONES[progression[bar]].slice(),
      dur: 1.6,
      vel: 0.85,
    });
    return { steps };
  }

  function arrangeBassEvents(steps, chordId) {
    const degrees = BASS_DEGREES[chordId];
    const dur = 0.9 * STEP * 4;
    steps[0].events.push({ kind: "note", voice: "bass", notes: [degrees.root], dur, vel: 0.7 });
    steps[8].events.push({ kind: "note", voice: "bass", notes: [degrees.fifth], dur, vel: 0.7 });
  }

  function arrangeDrumEvents(steps) {
    for (const lane of ["kick", "snare", "hat"]) {
      const characters = ARRANGE_DRUMS[lane];
      for (let i = 0; i < BAR_STEPS; i++) {
        const character = characters[i];
        if (character === ".") continue;
        steps[i].events.push({
          kind: "drum",
          voice: lane,
          notes: [],
          dur: DRUM_DURATION[lane],
          vel: DRUM_VELOCITY[character],
        });
      }
    }
  }

  function arrangeChordEvents(steps, chordId) {
    steps[0].events.push({
      kind: "chord",
      voice: "chord",
      notes: CHORD_TONES[chordId].slice(),
      dur: 1.6,
      vel: 0.6,
    });
  }

  function arrangeMelodyEvents(steps) {
    for (let slot = 0; slot < ARRANGE_MELODY.length; slot++) {
      const noteValue = ARRANGE_MELODY[slot];
      if (!inBand(noteValue, "melody")) return false;
      steps[slot * 2].events.push({
        kind: "note",
        voice: "lead",
        notes: [noteValue],
        dur: 2 * STEP,
        vel: 0.7,
      });
    }
    return true;
  }

  function compileArrange(payload) {
    if (payload === null || typeof payload !== "object") return null;
    const blocks = payload.blocks;
    const chordMap = payload.chordMap;
    const layers = payload.layers;
    if (!Array.isArray(blocks) || blocks.length !== PHRASE_BARS) return null;
    for (const block of blocks) {
      if (typeof block !== "string" || !/^[A-D]$/.test(block)) return null;
    }
    if (!Array.isArray(chordMap) || chordMap.length !== PHRASE_BARS) return null;
    for (const id of chordMap) {
      if (CHORD_TONES[id] === undefined) return null;
    }
    if (layers === null || typeof layers !== "object") return null;
    const bars = [];
    for (let bar = 0; bar < PHRASE_BARS; bar++) {
      const chord = chordMap[bar];
      for (const tone of CHORD_TONES[chord]) {
        if (!inBand(tone, "chords")) return null;
      }
      const steps = emptySteps();
      if (layers.drums) arrangeDrumEvents(steps);
      if (layers.bass) arrangeBassEvents(steps, chord);
      if (layers.chords) arrangeChordEvents(steps, chord);
      if (layers.melody && !arrangeMelodyEvents(steps)) return null;
      bars.push({ steps });
    }
    return { bars };
  }

  function fixtureSchedule(fixture) {
    if (fixture === null || typeof fixture !== "object") return null;
    const bars = fixture.bars;
    if (!Array.isArray(bars) || bars.length === 0) return null;
    const progression = bars.map((bar) => bar.chord);
    const collected = [];
    let order = 0;
    for (let index = 0; index < bars.length; index++) {
      const bar = bars[index];
      const plans = [];
      const drumPlan = compileDrum({ lanes: bar.drums || {} });
      if (drumPlan === null) return null;
      plans.push(drumPlan);
      if (bar.bass !== undefined) {
        const bassPlan = compileBass({ cells: bar.bass }, progression[index]);
        if (bassPlan === null) return null;
        plans.push(bassPlan);
      }
      if (bar.keys !== undefined) {
        const keysPlan = compileKeys({ slots: bar.keys, rewriteSlots: bar.rewriteSlots });
        if (keysPlan === null) return null;
        plans.push(keysPlan);
      }
      const chordPlan = compileChords({ progression }, index);
      if (chordPlan === null) return null;
      plans.push(chordPlan);
      for (const plan of plans) {
        for (const stepPlan of plan.steps) {
          for (const event of stepPlan.events) {
            const stepNumber = stepPlan.step;
            const swingOffset = stepNumber % 2 === 0 ? SWING * STEP : 0;
            const at = index * BAR + (stepNumber - 1) * STEP + swingOffset;
            collected.push({ bar: index, step: stepNumber, at, event, order });
            order++;
          }
        }
      }
    }
    collected.sort((a, b) => (a.at === b.at ? a.order - b.order : a.at - b.at));
    return { events: collected };
  }

  function traceOf(schedule) {
    return schedule.events.map((item) => ({
      bar: item.bar,
      step: item.step,
      voice: item.event.voice,
      notes: item.event.notes.slice(),
      dur: item.event.dur,
      vel: item.event.vel,
      at: item.at,
    }));
  }

  function scheduleVoices(voices, schedule) {
    for (const item of schedule.events) {
      const event = item.event;
      if (event.kind === "drum") voices.drum(event.voice, item.at, event.vel);
      else if (event.kind === "chord") voices.chord(event.notes, event.dur, item.at, event.vel, STRUM);
      else voices.note(event.voice, event.notes[0], event.dur, item.at, event.vel);
    }
  }

  function scanBuffer(buffer, trace) {
    const channelCount = typeof buffer.numberOfChannels === "number" ? buffer.numberOfChannels : 2;
    const frameCount = typeof buffer.length === "number" ? buffer.length : 0;
    let peak = 0;
    let nonFinite = 0;
    let atOrAboveUnity = 0;
    for (let channel = 0; channel < channelCount; channel++) {
      const data = buffer.getChannelData(channel);
      for (let frame = 0; frame < data.length; frame++) {
        const value = data[frame];
        if (!Number.isFinite(value)) {
          nonFinite++;
          continue;
        }
        const magnitude = Math.abs(value);
        if (magnitude > peak) peak = magnitude;
        if (magnitude >= 1) atOrAboveUnity++;
      }
    }
    return {
      peak,
      nonFinite,
      atOrAboveUnity,
      frames: frameCount,
      channels: channelCount,
      sampleRate: typeof buffer.sampleRate === "number" ? buffer.sampleRate : 0,
      trace,
    };
  }

  function renderOffline(profile, fixture) {
    const Tone = tone();
    const schedule = fixtureSchedule(fixture === undefined ? PARITY_FIXTURE : fixture);
    const trace = schedule === null ? [] : traceOf(schedule);
    const sampleRate = 48000;
    const channels = 2;
    const seconds = PHRASE + 1.5;
    if (!Tone || typeof Tone.Offline !== "function") {
      return Promise.reject(new Error("renderOffline requires Tone"));
    }
    return Promise.resolve(
      Tone.Offline(
        function (offlineContext) {
          const graph = buildProfileGraph(profile, offlineContext);
          const voices = buildVoices(graph.glue);
          if (schedule !== null) scheduleVoices(voices, schedule);
        },
        seconds,
        channels,
        sampleRate,
      ),
    ).then((buffer) => scanBuffer(buffer, trace));
  }

  function reducedMotion() {
    if (typeof matchMedia !== "function") return false;
    try {
      return matchMedia("(prefers-reduced-motion: reduce)").matches === true;
    } catch {
      return false;
    }
  }

  function create(options) {
    const settings = options === null || typeof options !== "object" ? {} : options;
    const profile = settings.profile === "home" ? "home" : "lesson";
    const lookAhead = profile === "home" ? LOOKAHEAD_HOME : LOOKAHEAD_LESSON;
    const onStep = settings.onStep;
    const onBar = settings.onBar;
    const onStateChange = settings.onStateChange;

    let state = "idle";
    let unlockGen = 0;
    let runGen = 0;
    let ctx = null;
    let graph = null;
    let voices = null;
    let timer = null;
    let settleTimer = null;
    let pendingPromise = null;
    let pendingResolve = null;
    let firstAttempt = true;
    let sawInterrupted = false;
    let muted = false;
    let step = 0;
    let bar = 0;
    let nextTime = 0;
    let barAudibleStart = 0;
    let stepLen = STEP;
    const pendingBars = [];

    const timing = Object.freeze(Object.assign({}, TIMING, { lookAhead }));

    function emit(next) {
      if (next === state) return;
      state = next;
      if (typeof onStateChange !== "function") return;
      try {
        onStateChange(next);
      } catch (error) { void error; }
    }

    function resolveUnlock(value) {
      if (pendingResolve === null) return;
      const resolve = pendingResolve;
      pendingResolve = null;
      pendingPromise = null;
      resolve(value);
    }

    function latency() {
      if (ctx === null) return 0;
      return (ctx.baseLatency || 0) + (ctx.outputLatency || 0);
    }

    function immediate() {
      if (ctx === null) return 0;
      return Math.max(0, ctx.currentTime - latency());
    }

    function clearSettle() {
      if (settleTimer === null) return;
      window.clearTimeout(settleTimer);
      settleTimer = null;
    }

    function clearClock() {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
      runGen += 1;
    }

    function anchorParam(param, at) {
      if (typeof param.cancelAndHoldAtTime === "function") {
        param.cancelAndHoldAtTime(at);
      } else {
        param.cancelScheduledValues(at);
        param.setValueAtTime(clampGain(param.value, graph === null ? 1 : graph.cap), at);
      }
    }

    function writeMaster(target) {
      if (graph === null || ctx === null || ctx.state === "closed") return;
      const param = graph.master.gain;
      const at = ctx.currentTime;
      anchorParam(param, at);
      param.linearRampToValueAtTime(clampGain(target, graph.cap), at + 0.02);
    }

    function runStopEnvelope() {
      if (graph === null || ctx === null || ctx.state === "closed") return;
      const param = graph.master.gain;
      const at = ctx.currentTime;
      const target = muted ? 0 : graph.cap;
      anchorParam(param, at);
      param.linearRampToValueAtTime(0, at + STOP_FADE);
      param.setValueAtTime(0, at + STOP_RELEASE);
      param.linearRampToValueAtTime(clampGain(target, graph.cap), at + STOP_RELEASE + STOP_RESTORE);
      if (voices !== null) voices.releaseAll(at + STOP_RELEASE);
    }

    function latchNoAudio() {
      if (state === "noAudio" || state === "disposed") return;
      unlockGen += 1;
      stop();
      emit("noAudio");
      if (ctx !== null) {
        try {
          ctx.onstatechange = null;
        } catch (error) { void error; }
      }
      resolveUnlock(false);
    }

    function settleSuccess(gen) {
      if (gen !== unlockGen) return;
      clearSettle();
      firstAttempt = false;
      if (state === "disposed" || state === "noAudio") return;
      emit("running");
      resolveUnlock(true);
    }

    function onSettle(gen) {
      settleTimer = null;
      if (gen !== unlockGen) return;
      if (state === "disposed" || state === "noAudio") return;
      const wasFirst = firstAttempt;
      firstAttempt = false;
      if (ctx !== null && ctx.state === "running") {
        emit("running");
        resolveUnlock(true);
        return;
      }
      if (wasFirst && !sawInterrupted) latchNoAudio();
      else emit("suspended");
      resolveUnlock(false);
    }

    function armSettle(gen) {
      clearSettle();
      settleTimer = window.setTimeout(function () {
        onSettle(gen);
      }, UNLOCK_SETTLE_MS);
    }

    function onContextStateChange() {
      if (ctx === null || state === "disposed" || state === "noAudio") return;
      const next = ctx.state;
      if (next === "interrupted") {
        sawInterrupted = true;
        emit("interrupted");
        return;
      }
      if (next === "running") {
        if (state === "unlocking" || state === "interrupted" || state === "suspended") settleSuccess(unlockGen);
        return;
      }
      if (next === "suspended" && state === "running") emit("suspended");
    }

    function ensureContext() {
      if (ctx !== null) return true;
      const Ctor = audioContextCtor();
      if (typeof Ctor !== "function") return false;
      try {
        ctx = new Ctor({ latencyHint: "interactive" });
      } catch {
        try {
          ctx = new Ctor();
        } catch {
          ctx = null;
          return false;
        }
      }
      const Tone = tone();
      if (!Tone || typeof Tone.setContext !== "function") {
        ctx = null;
        return false;
      }
      try {
        Tone.setContext(ctx);
        graph = buildProfileGraph(profile, ctx);
        voices = buildVoices(graph.glue);
      } catch {
        ctx = null;
        graph = null;
        voices = null;
        return false;
      }
      try {
        ctx.onstatechange = onContextStateChange;
      } catch (error) { void error; }
      if (muted) writeMaster(0);
      return true;
    }

    function beginResume(gen) {
      if (ctx === null) return;
      if (ctx.state === "running") {
        settleSuccess(gen);
        return;
      }
      let resumed;
      try {
        resumed = ctx.resume();
      } catch {
        latchNoAudio();
        return;
      }
      Promise.resolve(resumed).then(
        function () {
          if (gen !== unlockGen) return;
          if (ctx !== null && ctx.state === "running") settleSuccess(gen);
          else resolveUnlock(true);
        },
        function () {
          if (gen !== unlockGen) return;
          latchNoAudio();
        },
      );
    }

    function unlock() {
      if (state === "noAudio" || state === "disposed") return Promise.resolve(false);
      if (state === "running") return Promise.resolve(true);
      if (pendingPromise !== null) return pendingPromise;
      const gen = ++unlockGen;
      emit("unlocking");
      const promise = new Promise(function (resolve) {
        pendingResolve = resolve;
      });
      pendingPromise = promise;
      if (!ensureContext()) {
        latchNoAudio();
        return promise;
      }
      armSettle(gen);
      beginResume(gen);
      return promise;
    }

    function stop() {
      if (state === "disposed") return;
      clearClock();
      if (state === "unlocking") {
        unlockGen += 1;
        clearSettle();
        resolveUnlock(false);
      }
      runStopEnvelope();
      if (state === "running" || state === "unlocking") emit("stopped");
    }

    function start() {
      if (ctx === null || voices === null) return false;
      if (state !== "running" && state !== "stopped") return false;
      if (timer !== null) return true;
      runGen += 1;
      const gen = runGen;
      nextTime = immediate() + lookAhead;
      step = 0;
      bar = 0;
      barAudibleStart = nextTime;
      pendingBars.length = 0;
      timer = window.setInterval(function () {
        tick(gen);
      }, TICK_MS);
      if (state === "stopped") emit("running");
      return true;
    }

    function drainBars(now) {
      while (pendingBars.length > 0 && pendingBars[0].audibleTime <= now) {
        const boundary = pendingBars.shift();
        barAudibleStart = boundary.audibleTime;
        if (typeof onBar !== "function") continue;
        try {
          onBar(boundary.bar);
        } catch (error) { void error; }
      }
    }

    function tick(gen) {
      if (gen !== runGen || ctx === null || timer === null) return;
      const now = ctx.currentTime;
      if (nextTime < now) nextTime = now + CATCHUP_SLACK;
      const horizon = now + lookAhead;
      while (nextTime < horizon) {
        const stepNumber = step + 1;
        const gridTime = nextTime + (stepNumber % 2 === 0 ? SWING * stepLen : 0);
        const audibleTime = Math.max(0, gridTime - latency());
        if (step === 0) pendingBars.push({ bar, audibleTime });
        if (typeof onStep === "function") {
          try {
            onStep({ bar, step: stepNumber, gridTime, audibleTime, stepDur: stepLen });
          } catch (error) { void error; }
        }
        step += 1;
        if (step === BAR_STEPS) {
          step = 0;
          bar += 1;
        }
        nextTime += stepLen;
      }
      drainBars(now);
    }

    function position() {
      if (ctx === null || timer === null) return 0;
      const fraction = (immediate() - barAudibleStart) / (stepLen * BAR_STEPS);
      if (!Number.isFinite(fraction) || fraction < 0) return 0;
      const wrapped = fraction >= 1 ? fraction % 1 : fraction;
      return reducedMotion() ? Math.floor(wrapped * BAR_STEPS) / BAR_STEPS : wrapped;
    }

    function setBpm(value) {
      const bpm = Math.min(160, Math.max(60, Math.round(Number(value) || BPM)));
      stepLen = 60 / bpm / 4;
      return bpm;
    }

    function setMuted(value) {
      muted = value === true;
      if (graph !== null) writeMaster(muted ? 0 : graph.cap);
    }

    function drum(lane, time, vel) {
      if (voices === null) return;
      voices.drum(lane, time, vel);
    }

    function note(track, noteValue, dur, time, vel) {
      if (voices === null) return;
      voices.note(track, noteValue, dur, time, vel);
    }

    function chord(notes, dur, time, vel, strum) {
      if (voices === null) return;
      voices.chord(notes, dur, time, vel, strum);
    }

    function releaseAll(time) {
      if (voices === null) return;
      voices.releaseAll(time);
    }

    function onVisibility() {
      if (ctx === null || state === "disposed" || state === "noAudio") return;
      const hidden = typeof document !== "undefined" && document.hidden === true;
      if (hidden) {
        setMuted(true);
        if (profile === "lesson") stop();
        return;
      }
      setMuted(false);
      if (profile === "home" && ctx.state !== "running") {
        try {
          Promise.resolve(ctx.resume()).catch(function () {});
        } catch (error) { void error; }
      }
    }

    function onPageHide(event) {
      if (event && event.persisted === true) {
        stop();
        return;
      }
      dispose();
    }

    function onPageShow(event) {
      if (!event || event.persisted !== true) return;
      if (state === "disposed") return;
      if (profile === "home") {
        if (ctx !== null && ctx.state !== "running") {
          try {
            Promise.resolve(ctx.resume()).catch(function () {});
          } catch (error) { void error; }
        }
        return;
      }
      if (state === "running") emit("stopped");
    }

    function dispose() {
      if (state === "disposed") return;
      unlockGen += 1;
      clearClock();
      clearSettle();
      if (typeof window !== "undefined" && typeof window.removeEventListener === "function") {
        window.removeEventListener("pagehide", onPageHide);
        window.removeEventListener("pageshow", onPageShow);
      }
      if (typeof document !== "undefined" && typeof document.removeEventListener === "function") {
        document.removeEventListener("visibilitychange", onVisibility);
      }
      if (voices !== null) {
        try {
          voices.releaseAll(immediate());
        } catch (error) { void error; }
      }
      if (ctx !== null) {
        try {
          ctx.onstatechange = null;
        } catch (error) { void error; }
        try {
          Promise.resolve(ctx.close()).catch(function () {});
        } catch (error) { void error; }
      }
      emit("disposed");
      resolveUnlock(false);
      ctx = null;
      graph = null;
      voices = null;
    }

    if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
      window.addEventListener("pagehide", onPageHide);
      window.addEventListener("pageshow", onPageShow);
    }
    if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
      document.addEventListener("visibilitychange", onVisibility);
    }

    const engine = {
      unlock,
      start,
      stop,
      setMuted,
      setBpm,
      dispose,
      position,
      immediate,
      timing,
      drum,
      note,
      chord,
      releaseAll,
    };
    Object.defineProperty(engine, "state", {
      get: function () {
        return state;
      },
    });
    return engine;
  }

  Object.assign(window.LM || (window.LM = {}), {
    audio: {
      create,
      renderOffline,
      shape,
      clampGain,
      synthesizeImpulse,
      buildProfileGraph,
      buildVoices,
    },
    music: {
      parsePattern,
      compileDrum,
      compileBass,
      compileKeys,
      compileChords,
      compileArrange,
      fixture: PARITY_FIXTURE,
      bands: BANDS,
      chordTones: CHORD_TONES,
      bassDegrees: BASS_DEGREES,
      chordIds: CHORD_IDS,
    },
  });
})();
