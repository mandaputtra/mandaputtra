(function () {
  "use strict";

  const LESSON_SLUGS = ["beats", "notes-scales", "chords", "basslines", "melodies", "song-structure"];
  const LANES = ["kick", "snare", "hat"];
  const VELOCITY = { X: 1, x: 0.75, o: 0.35 };
  const BASS_VALUES = ["off", "root", "fifth", "octave"];
  const CHORD_CYCLE = ["Am", "F", "C", "G"];
  const KEYBOARD = ["C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4"];
  const ARRANGE_LANES = {
    kick: "X...X...X...X...",
    snare: "....X.......X...",
    hat: "................",
  };
  const ARRANGE_MELODY = ["E4", "D4", "C4", "D4", "E4", "D4", "C4", "C4"];

  const LESSON_CTA = { labelKey: "ui.cta.song", href: "/explore/learning-music/" };

  const LESSON_DATA = {
    beats: {
      order: 0,
      titleKey: "lesson.beats.title",
      crumbKey: "lesson.beats.crumb",
      listNameKey: "lesson.beats.listName",
      cta: LESSON_CTA,
      steps: [
        {
          family: "drum",
          toy: "drum",
          copy: "lesson.beats.step1",
          payload: { lanes: { kick: "X...............", snare: "................", hat: "................" } },
          goal: null,
          finale: false,
        },
        {
          family: "drum",
          toy: "drum",
          copy: "lesson.beats.step2",
          payload: { lanes: { kick: "X...X...X...X...", snare: "....X.......X...", hat: "................" } },
          goal: null,
          finale: false,
        },
        {
          family: "drum",
          toy: "drum",
          copy: "lesson.beats.step3",
          payload: { lanes: { kick: "X...X...X...X...", snare: "....X.......X...", hat: "x.x.x.x.x.x.x.x." } },
          goal: null,
          finale: false,
        },
        {
          family: "drum",
          toy: "drum",
          copy: "lesson.beats.step4",
          payload: { lanes: { kick: "X...X...X...X...", snare: "....X.......X...", hat: "x.o.x.o.x.o.x.o." } },
          goal: { type: "cells-equal", cells: [true, true, true, true, false, true, false, true, true, true, true, false] },
          finale: true,
        },
      ],
    },
    "notes-scales": {
      order: 1,
      titleKey: "lesson.notes-scales.title",
      crumbKey: "lesson.notes-scales.crumb",
      listNameKey: "lesson.notes-scales.listName",
      cta: LESSON_CTA,
      steps: [
        {
          family: "keys",
          toy: "keys",
          copy: "lesson.notes-scales.step1",
          payload: { slots: ["C4", null, null, null, null, null, null, null], rewriteSlots: [] },
          goal: null,
          finale: false,
        },
        {
          family: "keys",
          toy: "keys",
          copy: "lesson.notes-scales.step2",
          payload: { slots: ["C4", "D4", "E4", "F4", null, null, null, null], rewriteSlots: [] },
          goal: null,
          finale: false,
        },
        {
          family: "keys",
          toy: "keys",
          copy: "lesson.notes-scales.step3",
          payload: { slots: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", null], rewriteSlots: [] },
          goal: null,
          finale: false,
        },
        {
          family: "keys",
          toy: "keys",
          copy: "lesson.notes-scales.step4",
          payload: { slots: ["C4", "D4", "E4", "F4", "G4", "A4", null, "C5"], rewriteSlots: [] },
          goal: { type: "slots-equal", slots: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"] },
          finale: true,
        },
      ],
    },
    chords: {
      order: 2,
      titleKey: "lesson.chords.title",
      crumbKey: "lesson.chords.crumb",
      listNameKey: "lesson.chords.listName",
      cta: LESSON_CTA,
      steps: [
        {
          family: "chords",
          toy: "chords",
          copy: "lesson.chords.step1",
          payload: { progression: ["Am", "F", "C", "G"], pads: false },
          goal: null,
          finale: false,
        },
        {
          family: "chords",
          toy: "chords",
          copy: "lesson.chords.step2",
          payload: { progression: ["Am", "Am", "C", "C"], pads: true },
          goal: null,
          finale: false,
        },
        {
          family: "chords",
          toy: "chords",
          copy: "lesson.chords.step3",
          payload: { progression: ["Am", "F", "C", "C"], pads: true },
          goal: null,
          finale: false,
        },
        {
          family: "chords",
          toy: "chords",
          copy: "lesson.chords.step4",
          payload: { progression: ["Am", "F", "C", "Am"], pads: true },
          goal: { type: "progression-equal", progression: ["Am", "F", "C", "G"] },
          finale: true,
        },
      ],
    },
    basslines: {
      order: 3,
      titleKey: "lesson.basslines.title",
      crumbKey: "lesson.basslines.crumb",
      listNameKey: "lesson.basslines.listName",
      cta: LESSON_CTA,
      steps: [
        {
          family: "bass",
          toy: "bass",
          copy: "lesson.basslines.step1",
          payload: { cells: ["root", "off", "off", "off"] },
          goal: null,
          finale: false,
        },
        {
          family: "bass",
          toy: "bass",
          copy: "lesson.basslines.step2",
          payload: { cells: ["root", "off", "root", "off"] },
          goal: null,
          finale: false,
        },
        {
          family: "bass",
          toy: "bass",
          copy: "lesson.basslines.step3",
          payload: { cells: ["root", "off", "fifth", "off"] },
          goal: null,
          finale: false,
        },
        {
          family: "bass",
          toy: "bass",
          copy: "lesson.basslines.step4",
          payload: { cells: ["root", "fifth", "off", "root"] },
          goal: { type: "values-equal", values: ["root", "fifth", "octave", "root"] },
          finale: true,
        },
      ],
    },
    melodies: {
      order: 4,
      titleKey: "lesson.melodies.title",
      crumbKey: "lesson.melodies.crumb",
      listNameKey: "lesson.melodies.listName",
      cta: LESSON_CTA,
      steps: [
        {
          family: "keys",
          toy: "keys",
          copy: "lesson.melodies.step1",
          payload: { slots: ["E4", "D4", "C4", "D4", "E4", null, null, "C4"], rewriteSlots: [7] },
          goal: null,
          finale: false,
        },
        {
          family: "keys",
          toy: "keys",
          copy: "lesson.melodies.step2",
          payload: { slots: ["E4", "D4", "C4", "D4", null, null, "C4", "C4"], rewriteSlots: [7] },
          goal: null,
          finale: false,
        },
        {
          family: "keys",
          toy: "keys",
          copy: "lesson.melodies.step3",
          payload: { slots: ["G4", "E4", "C4", "D4", "E4", "D4", "C4", null], rewriteSlots: [] },
          goal: null,
          finale: false,
        },
        {
          family: "keys",
          toy: "keys",
          copy: "lesson.melodies.step4",
          payload: { slots: ["G4", "E4", "C4", "D4", "E4", "D4", null, "C4"], rewriteSlots: [] },
          goal: { type: "slots-equal", slots: ["G4", "E4", "C4", "D4", "E4", "D4", "C4", "C4"] },
          finale: true,
        },
      ],
    },
    "song-structure": {
      order: 5,
      titleKey: "lesson.song-structure.title",
      crumbKey: "lesson.song-structure.crumb",
      listNameKey: "lesson.song-structure.listName",
      cta: LESSON_CTA,
      steps: [
        {
          family: "arrange",
          toy: "arrange",
          copy: "lesson.song-structure.step1",
          payload: { blocks: ["A", "A", "A", "A"], chordMap: ["Am", "F", "C", "G"], layers: { drums: true, bass: true, chords: true, melody: false } },
          goal: null,
          finale: false,
        },
        {
          family: "arrange",
          toy: "arrange",
          copy: "lesson.song-structure.step2",
          payload: { blocks: ["A", "A", "B", "B"], chordMap: ["Am", "F", "C", "G"], layers: { drums: true, bass: true, chords: true, melody: true } },
          goal: null,
          finale: false,
        },
        {
          family: "arrange",
          toy: "arrange",
          copy: "lesson.song-structure.step3",
          payload: { blocks: ["A", "B", "A", "B"], chordMap: ["Am", "F", "C", "G"], layers: { drums: true, bass: true, chords: true, melody: true } },
          goal: null,
          finale: false,
        },
        {
          family: "arrange",
          toy: "arrange",
          copy: "lesson.song-structure.step4",
          payload: { blocks: ["A", "B", "C", "D"], chordMap: ["Am", "F", "C", "G"], layers: { drums: true, bass: true, chords: true, melody: true } },
          goal: { type: "blocks-equal", blocks: ["B", "A", "C", "D"] },
          finale: true,
        },
      ],
    },
  };

  (function deepFreeze(node) {
    if (node === null || typeof node !== "object" || Object.isFrozen(node)) return;
    Object.getOwnPropertyNames(node).forEach(function (name) {
      deepFreeze(node[name]);
    });
    Object.freeze(node);
  })(LESSON_DATA);

  let booted = false;
  let slug;
  let steps = [];
  let currentIndex = -1;
  let engine = null;
  let queue = null;
  let audioSubscribed = true;
  let lastBar = 0;
  let muted = false;
  let starSpoken = false;
  const boundRegions = new WeakSet();

  function readLessonSlug(raw) {
    if (typeof raw !== "string") return undefined;
    if (LESSON_SLUGS.indexOf(raw) === -1) return undefined;
    if (!Object.prototype.hasOwnProperty.call(LESSON_DATA, raw)) return undefined;
    return raw;
  }

  function text(key) {
    const value = window.LM.t(window.LM.lang.current(), key);
    return value === undefined ? "" : value;
  }

  function hasHit(group) {
    return group.indexOf("X") !== -1 || group.indexOf("x") !== -1 || group.indexOf("o") !== -1;
  }

  function velocityOf(group) {
    for (let i = 0; i < group.length; i++) {
      const velocity = VELOCITY[group.charAt(i)];
      if (velocity !== undefined) return velocity;
    }
    return 1;
  }

  function arraysEqual(left, right) {
    if (left.length !== right.length) return false;
    for (let i = 0; i < left.length; i++) {
      if (left[i] !== right[i]) return false;
    }
    return true;
  }

  function drumName(lane, beat) {
    return text("toy.lane." + lane) + " " + text("toy.beat") + " " + beat;
  }

  function bassName(beat, value) {
    return text("toy.beat") + " " + beat + ", " + text("toy.value." + value);
  }

  function createAnnouncementQueue(region) {
    const WINDOW_MS = 1500;
    let pending = null;
    let generation = 0;
    let windowHandle = null;

    function write(message) {
      if (typeof message !== "string" || message === "") return false;
      if (region.textContent === message) return false;
      region.textContent = message;
      return true;
    }

    function openWindow() {
      if (windowHandle !== null) window.clearTimeout(windowHandle);
      windowHandle = window.setTimeout(expire, WINDOW_MS);
    }

    function expire() {
      windowHandle = null;
      if (pending === null) return;
      const message = pending;
      pending = null;
      if (write(message)) openWindow();
    }

    function bumpGeneration() {
      generation += 1;
      return generation;
    }

    function enqueue(token, message) {
      if (token !== generation) return;
      if (typeof message !== "string" || message === "") return;
      if (region.textContent === message) return;
      if (windowHandle !== null) {
        pending = message;
        return;
      }
      if (write(message)) openWindow();
    }

    return { bumpGeneration: bumpGeneration, enqueue: enqueue, generation: function () { return generation; } };
  }

  function focusHeading(step) {
    if (step.h2 !== null && typeof step.h2.focus === "function") {
      step.h2.focus();
      return;
    }
    if (step.root !== null) {
      step.root.setAttribute("tabindex", "-1");
      if (typeof step.root.focus === "function") step.root.focus();
    }
  }

  function announceStep(step) {
    if (queue === null || step.h2 === null) return;
    const sayNode = step.root === null ? null : step.root.querySelector("[data-i18n$='.say']");
    const heading = step.h2.textContent === null ? "" : step.h2.textContent;
    const bubble = sayNode === null || sayNode.textContent === null ? "" : sayNode.textContent;
    const message = bubble === "" ? heading : heading + ". " + bubble;
    queue.enqueue(queue.bumpGeneration(), message);
  }

  function announceStar() {
    if (starSpoken || queue === null) return;
    starSpoken = true;
    queue.enqueue(queue.generation(), text("ui.star"));
  }

  function labelFor(control, region) {
    if (control.labels !== undefined && control.labels !== null && control.labels.length > 0) return control.labels[0];
    const id = control.getAttribute("id");
    if (id === null || id === "") return null;
    return region.querySelector('label[for="' + id + '"]');
  }

  function createTransport(mode) {
    const wrap = document.createElement("div");
    wrap.className = "lm-transport";
    if (mode === "toggle") {
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.setAttribute("data-transport", "toggle");
      toggle.setAttribute("aria-pressed", "false");
      toggle.textContent = text("ui.play");
      wrap.appendChild(toggle);
      return wrap;
    }
    ["play", "stop", "mute"].forEach(function (name) {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("data-transport", name);
      if (name === "mute") button.setAttribute("aria-pressed", "false");
      if (name === "stop") button.disabled = true;
      button.textContent = text("ui." + name);
      wrap.appendChild(button);
    });
    return wrap;
  }

  function buildDrum(region, step) {
    LANES.forEach(function (lane) {
      for (let column = 0; column < 4; column++) {
        const group = step.payload.lanes[lane].slice(column * 4, column * 4 + 4);
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "lm-cell";
        cell.setAttribute("data-lane", lane);
        cell.setAttribute("data-col", String(column));
        cell.setAttribute("data-group", group);
        cell.setAttribute("aria-pressed", hasHit(group) ? "true" : "false");
        cell.setAttribute("aria-label", drumName(lane, column + 1));
        region.appendChild(cell);
      }
    });
    region.appendChild(createTransport("three"));
  }

  function buildBass(region, step) {
    for (let beat = 0; beat < 4; beat++) {
      const value = step.payload.cells[beat];
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "lm-cell";
      cell.setAttribute("data-value", value);
      cell.setAttribute("aria-pressed", value === "off" ? "false" : "true");
      cell.setAttribute("aria-label", bassName(beat + 1, value));
      cell.textContent = text("toy.value." + value);
      region.appendChild(cell);
    }
    region.appendChild(createTransport("three"));
  }

  function buildKeys(region, step) {
    const group = "p" + step.n;
    for (let slot = 0; slot < 8; slot++) {
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = group;
      radio.id = group + "-" + slot;
      radio.value = KEYBOARD[slot];
      const label = document.createElement("label");
      label.setAttribute("for", radio.id);
      label.textContent = KEYBOARD[slot];
      region.appendChild(radio);
      region.appendChild(label);
    }
    const readout = document.createElement("ol");
    readout.className = "lm-slots";
    for (let slot = 0; slot < 8; slot++) readout.appendChild(document.createElement("li"));
    region.appendChild(readout);
    region.appendChild(createTransport("three"));
  }

  function buildChords(region, step) {
    if (step.payload.pads === false) {
      const readout = document.createElement("ol");
      readout.className = "lm-chords";
      for (let bar = 0; bar < 4; bar++) readout.appendChild(document.createElement("li"));
      region.appendChild(readout);
      region.appendChild(createTransport("toggle"));
      return;
    }
    const group = "ch" + step.n;
    for (let bar = 0; bar < 4; bar++) {
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = group;
      radio.id = group + "-" + bar;
      radio.value = step.payload.progression[bar];
      const label = document.createElement("label");
      label.setAttribute("for", radio.id);
      label.textContent = step.payload.progression[bar];
      region.appendChild(radio);
      region.appendChild(label);
    }
    region.appendChild(createTransport("toggle"));
  }

  function buildArrange(region, step) {
    const group = "ar" + step.n;
    for (let bar = 0; bar < 4; bar++) {
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = group;
      radio.id = group + "-" + bar;
      radio.value = step.payload.blocks[bar];
      const label = document.createElement("label");
      label.setAttribute("for", radio.id);
      region.appendChild(radio);
      region.appendChild(label);
    }
    const map = document.createElement("ol");
    map.className = "lm-chordmap";
    for (let bar = 0; bar < 4; bar++) map.appendChild(document.createElement("li"));
    region.appendChild(map);
    ["drums", "bass", "chords", "melody"].forEach(function (layer) {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("data-layer", layer);
      button.setAttribute("aria-pressed", "true");
      button.textContent = text("toy.layer." + layer);
      region.appendChild(button);
    });
    ["earlier", "later"].forEach(function (direction) {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("data-move", direction);
      button.textContent = text("ui.move." + direction);
      region.appendChild(button);
    });
    region.appendChild(createTransport("three"));
  }

  function clearChildren(region) {
    while (region.firstChild !== null) region.removeChild(region.firstChild);
  }

  function buildInterior(step) {
    clearChildren(step.toy);
    step.toy.className = "lm-toy";
    if (step.family === "drum") buildDrum(step.toy, step);
    else if (step.family === "bass") buildBass(step.toy, step);
    else if (step.family === "keys") buildKeys(step.toy, step);
    else if (step.family === "chords") buildChords(step.toy, step);
    else buildArrange(step.toy, step);
  }

  function countIn(region, selector) {
    return region.querySelectorAll(selector).length;
  }

  function hasInterior(step) {
    const region = step.toy;
    if (region === null) return false;
    if (step.family === "drum") return countIn(region, "button[data-group]") === 12 && countIn(region, "[data-transport]") === 3;
    if (step.family === "bass") return countIn(region, "button[data-value]") === 4 && countIn(region, "[data-transport]") === 3;
    if (step.family === "keys") {
      return countIn(region, "input[type=radio]") === 8 && countIn(region, "ol.lm-slots li") === 8 && countIn(region, "[data-transport]") === 3;
    }
    if (step.family === "chords") {
      if (step.payload.pads === false) return countIn(region, "ol.lm-chords li") === 4 && countIn(region, "[data-transport]") === 1;
      return countIn(region, "input[type=radio]") === 4 && countIn(region, "[data-transport]") === 1;
    }
    return (
      countIn(region, "input[type=radio]") === 4 &&
      countIn(region, "[data-layer]") === 4 &&
      countIn(region, "[data-move]") === 2 &&
      countIn(region, "ol.lm-chordmap li") === 4 &&
      countIn(region, "[data-transport]") === 3
    );
  }

  function collectControls(region) {
    return {
      cells: Array.from(region.querySelectorAll("button[data-group]")),
      bassCells: Array.from(region.querySelectorAll("button[data-value]")),
      radios: Array.from(region.querySelectorAll("input[type=radio]")),
      slots: Array.from(region.querySelectorAll("ol.lm-slots li")),
      chordReadout: Array.from(region.querySelectorAll("ol.lm-chords li")),
      chordMap: Array.from(region.querySelectorAll("ol.lm-chordmap li")),
      layers: Array.from(region.querySelectorAll("[data-layer]")),
      earlier: region.querySelector('[data-move="earlier"]'),
      later: region.querySelector('[data-move="later"]'),
      play: region.querySelector('[data-transport="play"]'),
      stop: region.querySelector('[data-transport="stop"]'),
      mute: region.querySelector('[data-transport="mute"]'),
      toggle: region.querySelector('[data-transport="toggle"]'),
    };
  }

  function assertFocusBudget(region) {
    if (region === null) return;
    const total = countIn(region, "button, input, select, textarea, a[href], [tabindex]");
    if (total <= 16) return;
    const development =
      window.location.protocol === "file:" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (!development) return;
    throw new Error("focus budget exceeded: " + total);
  }

  function createToyState(step) {
    const payload = step.payload;
    if (step.family === "drum") {
      return { lanes: { kick: payload.lanes.kick, snare: payload.lanes.snare, hat: payload.lanes.hat } };
    }
    if (step.family === "bass") return { cells: payload.cells.slice() };
    if (step.family === "keys") return { slots: payload.slots.slice(), rewriteSlots: payload.rewriteSlots.slice(), selected: 0 };
    if (step.family === "chords") return { progression: payload.progression.slice(), pads: payload.pads, selected: 0 };
    return {
      blocks: payload.blocks.slice(),
      chordMap: payload.chordMap.slice(),
      layers: { drums: payload.layers.drums, bass: payload.layers.bass, chords: payload.layers.chords, melody: payload.layers.melody },
      selected: 0,
      moved: [false, false, false, false],
    };
  }

  function stateFor(step) {
    if (step.state === null) step.state = createToyState(step);
    return step.state;
  }

  function effectiveSlot(state, slot) {
    if (state.rewriteSlots.indexOf(slot) !== -1) return "C4";
    return state.slots[slot];
  }

  function firstEmptySlot(state) {
    for (let slot = 0; slot < 8; slot++) {
      if (state.rewriteSlots.indexOf(slot) !== -1) continue;
      if (state.slots[slot] === null) return slot;
    }
    return -1;
  }

  function goalCells(state) {
    const cells = [];
    LANES.forEach(function (lane) {
      for (let column = 0; column < 4; column++) {
        cells.push(hasHit(state.lanes[lane].slice(column * 4, column * 4 + 4)));
      }
    });
    return cells;
  }

  function evaluateGoal(step) {
    const goal = step.goal;
    if (goal === null) return false;
    try {
      const state = stateFor(step);
      if (goal.type === "cells-equal") return goal.cells.length === 12 && arraysEqual(goalCells(state), goal.cells);
      if (goal.type === "values-equal") return arraysEqual(state.cells, goal.values);
      if (goal.type === "slots-equal") {
        const rendered = [];
        for (let slot = 0; slot < 8; slot++) rendered.push(effectiveSlot(state, slot));
        return arraysEqual(rendered, goal.slots);
      }
      if (goal.type === "progression-equal") return arraysEqual(state.progression, goal.progression);
      return arraysEqual(state.blocks, goal.blocks);
    } catch {
      return false;
    }
  }

  function renderDrum(step) {
    const state = stateFor(step);
    step.controls.cells.forEach(function (cell, index) {
      const lane = LANES[Math.floor(index / 4)];
      const column = index % 4;
      const group = state.lanes[lane].slice(column * 4, column * 4 + 4);
      cell.setAttribute("aria-pressed", hasHit(group) ? "true" : "false");
      cell.setAttribute("aria-label", drumName(lane, column + 1));
    });
  }

  function renderBass(step) {
    const state = stateFor(step);
    step.controls.bassCells.forEach(function (cell, index) {
      const value = state.cells[index];
      const word = text("toy.value." + value);
      cell.setAttribute("data-value", word);
      cell.setAttribute("aria-pressed", value === "off" ? "false" : "true");
      cell.setAttribute("aria-label", bassName(index + 1, value));
      cell.textContent = word;
    });
  }

  function renderKeys(step) {
    const state = stateFor(step);
    step.controls.slots.forEach(function (slotNode, index) {
      const value = effectiveSlot(state, index);
      slotNode.textContent = value === null ? "" : value;
    });
    step.controls.radios.forEach(function (radio, index) {
      radio.checked = index === state.selected;
    });
  }

  function renderChords(step) {
    const state = stateFor(step);
    if (state.pads === false) {
      step.controls.chordReadout.forEach(function (node, bar) {
        node.textContent = state.progression[bar];
      });
      return;
    }
    step.controls.radios.forEach(function (radio, bar) {
      const chord = state.progression[bar];
      radio.value = chord;
      radio.checked = bar === state.selected;
      const label = labelFor(radio, step.toy);
      if (label !== null) label.textContent = chord;
    });
  }

  function arrangeName(state, bar) {
    const suffix = state.moved[bar] ? ", bar " + (bar + 1) : "";
    return state.blocks[bar] + " — " + state.chordMap[bar] + suffix;
  }

  function renderArrange(step) {
    const state = stateFor(step);
    step.controls.radios.forEach(function (radio, bar) {
      const name = arrangeName(state, bar);
      radio.value = state.blocks[bar];
      radio.checked = bar === state.selected;
      radio.setAttribute("aria-label", name);
      const label = labelFor(radio, step.toy);
      if (label !== null) label.textContent = name;
    });
    step.controls.chordMap.forEach(function (node, bar) {
      node.textContent = state.chordMap[bar];
    });
    step.controls.layers.forEach(function (button) {
      const layer = button.getAttribute("data-layer");
      button.setAttribute("aria-pressed", state.layers[layer] ? "true" : "false");
      button.textContent = text("toy.layer." + layer);
    });
    if (step.controls.earlier !== null) step.controls.earlier.disabled = state.selected === 0;
    if (step.controls.later !== null) step.controls.later.disabled = state.selected === 3;
  }

  function renderToy(step) {
    if (step.root === null || step.toy === null) return;
    if (!step.built || !hasInterior(step)) {
      buildInterior(step);
      step.built = true;
      assertFocusBudget(step.toy);
    }
    step.controls = collectControls(step.toy);
    if (step.family === "drum") renderDrum(step);
    else if (step.family === "bass") renderBass(step);
    else if (step.family === "keys") renderKeys(step);
    else if (step.family === "chords") renderChords(step);
    else renderArrange(step);
    renderTransport(step);
  }

  function setThreeTransport(step, state) {
    const controls = step.controls;
    if (controls.play !== null) controls.play.disabled = false;
    if (controls.stop !== null) controls.stop.disabled = !(state === "running" || state === "unlocking");
    if (controls.mute !== null) {
      controls.mute.setAttribute("aria-pressed", muted ? "true" : "false");
      controls.mute.textContent = text("ui.mute");
    }
    if (controls.play !== null) controls.play.textContent = text("ui.play");
    if (controls.stop !== null) controls.stop.textContent = text("ui.stop");
  }

  function setToggleTransport(step, state) {
    const toggle = step.controls.toggle;
    if (toggle === null) return;
    const playing = state === "running";
    toggle.setAttribute("aria-pressed", playing ? "true" : "false");
    toggle.textContent = playing ? text("ui.stop") : text("ui.play");
  }

  function renderTransport(step) {
    if (step.controls === null) return;
    const state = engine === null ? "idle" : engine.state;
    if (step.controls.toggle !== null) setToggleTransport(step, state);
    else setThreeTransport(step, state);
  }

  function renderEngineState(state) {
    if (!audioSubscribed && state !== "noAudio") return;
    if (state === "disposed") return;
    if (state === "noAudio") {
      audioSubscribed = false;
      enterNoAudio();
      return;
    }
    if (currentIndex < 0) return;
    const step = steps[currentIndex];
    if (step === undefined || step.controls === null) return;
    if (step.controls.toggle !== null) setToggleTransport(step, state);
    else setThreeTransport(step, state);
  }

  function enterNoAudio() {
    const regions = document.querySelectorAll(".lm-toy");
    for (let i = 0; i < regions.length; i++) {
      regions[i].hidden = true;
      regions[i].setAttribute("inert", "");
    }
    const silent = document.querySelector(".lm-silent");
    if (silent !== null) silent.hidden = false;
  }

  function ensureEngine() {
    if (engine !== null) return engine;
    if (typeof window.LM.audio.create !== "function") return null;
    try {
      engine = window.LM.audio.create({
        profile: "lesson",
        onStep: handleStep,
        onBar: handleBar,
        onStateChange: renderEngineState,
      });
    } catch {
      engine = null;
    }
    return engine;
  }

  function playWhenReady(action) {
    const active = ensureEngine();
    if (active === null) return;
    if (active.state === "running") {
      action(active);
      return;
    }
    Promise.resolve(active.unlock())
      .then(function (ok) {
        if (ok) action(active);
      })
      .catch(function () {});
  }

  function playingChord() {
    if (engine === null || engine.state !== "running") return "Am";
    return CHORD_CYCLE[((lastBar % 4) + 4) % 4];
  }

  function scheduleLanes(lanes, sixteenth, gridTime) {
    const index = sixteenth - 1;
    LANES.forEach(function (lane) {
      const group = lanes[lane];
      if (index < 0 || index >= group.length) return;
      const velocity = VELOCITY[group.charAt(index)];
      if (velocity === undefined) return;
      engine.drum(lane, gridTime, velocity);
    });
  }

  function scheduleBass(state, sixteenth, gridTime, barIndex) {
    if (sixteenth % 4 !== 1) return;
    const beat = Math.floor((sixteenth - 1) / 4);
    const value = state.cells[beat];
    if (value === "off") return;
    const degrees = window.LM.music.bassDegrees[CHORD_CYCLE[barIndex]];
    if (degrees === undefined) return;
    engine.note("bass", degrees[value], 0.9 * engine.timing.beatDur, gridTime, 0.7);
  }

  function scheduleKeys(state, sixteenth, gridTime) {
    if (sixteenth % 2 === 0) return;
    const slot = Math.floor((sixteenth - 1) / 2);
    const note = effectiveSlot(state, slot);
    if (note === null) return;
    engine.note("lead", note, 2 * engine.timing.stepDur, gridTime, 0.75);
  }

  function scheduleChords(state, sixteenth, gridTime, barIndex) {
    if (sixteenth !== 1) return;
    const tones = window.LM.music.chordTones[state.progression[barIndex]];
    if (tones === undefined) return;
    engine.chord(tones, 1.6, gridTime, 0.85, 0.012);
  }

  function scheduleArrange(state, sixteenth, gridTime, barIndex) {
    if (state.layers.drums) scheduleLanes(ARRANGE_LANES, sixteenth, gridTime);
    const chord = state.chordMap[barIndex];
    const degrees = window.LM.music.bassDegrees[chord];
    if (state.layers.bass && degrees !== undefined) {
      if (sixteenth === 1) engine.note("bass", degrees.root, 0.9 * engine.timing.beatDur, gridTime, 0.7);
      else if (sixteenth === 9) engine.note("bass", degrees.fifth, 0.9 * engine.timing.beatDur, gridTime, 0.7);
    }
    if (state.layers.chords && sixteenth === 1) {
      const tones = window.LM.music.chordTones[chord];
      if (tones !== undefined) engine.chord(tones, 1.6, gridTime, 0.6, 0.012);
    }
    if (state.layers.melody && sixteenth % 2 === 1) {
      const slot = Math.floor((sixteenth - 1) / 2);
      engine.note("lead", ARRANGE_MELODY[slot], 2 * engine.timing.stepDur, gridTime, 0.7);
    }
  }

  function handleStep(event) {
    if (engine === null || !audioSubscribed) return;
    if (currentIndex < 0) return;
    const step = steps[currentIndex];
    if (step === undefined) return;
    const state = stateFor(step);
    const barIndex = ((event.bar % 4) + 4) % 4;
    try {
      if (step.family === "drum") scheduleLanes(state.lanes, event.step, event.gridTime);
      else if (step.family === "bass") scheduleBass(state, event.step, event.gridTime, barIndex);
      else if (step.family === "keys") scheduleKeys(state, event.step, event.gridTime);
      else if (step.family === "chords") scheduleChords(state, event.step, event.gridTime, barIndex);
      else scheduleArrange(state, event.step, event.gridTime, barIndex);
    } catch {
      void 0;
    }
  }

  function handleBar(bar) {
    lastBar = bar;
  }

  function toggleDrumCell(step, index) {
    const state = stateFor(step);
    const lane = LANES[Math.floor(index / 4)];
    const column = index % 4;
    const authored = step.payload.lanes[lane].slice(column * 4, column * 4 + 4);
    const current = state.lanes[lane].slice(column * 4, column * 4 + 4);
    const wasOn = hasHit(current);
    const next = wasOn ? "...." : authored;
    state.lanes[lane] = state.lanes[lane].slice(0, column * 4) + next + state.lanes[lane].slice(column * 4 + 4);
    renderDrum(step);
    if (!wasOn) {
      const velocity = velocityOf(authored);
      playWhenReady(function (active) {
        active.drum(lane, active.immediate(), velocity);
      });
    }
    checkGoal(step);
  }

  function cycleBass(step, index) {
    const state = stateFor(step);
    const next = BASS_VALUES[(BASS_VALUES.indexOf(state.cells[index]) + 1) % BASS_VALUES.length];
    state.cells[index] = next;
    renderBass(step);
    if (next !== "off") {
      const chord = playingChord();
      playWhenReady(function (active) {
        const degrees = window.LM.music.bassDegrees[chord];
        if (degrees === undefined) return;
        active.note("bass", degrees[next], 0.9 * active.timing.beatDur, active.immediate(), 0.7);
      });
    }
    checkGoal(step);
  }

  function pressKey(step, index) {
    const state = stateFor(step);
    const target = firstEmptySlot(state);
    if (target === -1) return;
    const note = KEYBOARD[index];
    state.slots[target] = note;
    state.selected = index;
    renderKeys(step);
    playWhenReady(function (active) {
      active.note("lead", note, 2 * active.timing.stepDur, active.immediate(), 0.75);
    });
    checkGoal(step);
  }

  function cyclePad(step, bar) {
    const state = stateFor(step);
    const next = CHORD_CYCLE[(CHORD_CYCLE.indexOf(state.progression[bar]) + 1) % CHORD_CYCLE.length];
    state.progression[bar] = next;
    state.selected = bar;
    renderChords(step);
    playWhenReady(function (active) {
      active.releaseAll(active.immediate());
      active.chord(window.LM.music.chordTones[next], 1.6, active.immediate(), 0.85, 0.012);
    });
    checkGoal(step);
  }

  function selectArrange(step, bar) {
    const state = stateFor(step);
    state.selected = bar;
    renderArrange(step);
  }

  function toggleLayer(step, button) {
    const state = stateFor(step);
    const layer = button.getAttribute("data-layer");
    if (state.layers[layer] === undefined) return;
    state.layers[layer] = !state.layers[layer];
    renderArrange(step);
  }

  function moveBlock(step, direction) {
    const state = stateFor(step);
    const from = state.selected;
    const to = from + direction;
    if (to < 0 || to > 3) return;
    const held = state.blocks[from];
    state.blocks[from] = state.blocks[to];
    state.blocks[to] = held;
    state.moved[to] = true;
    renderArrange(step);
    checkGoal(step);
  }

  function checkGoal(step) {
    if (step.n !== 4 || step.goal === null) return;
    if (!evaluateGoal(step)) return;
    const view = window.LM.progress.get();
    const entry = view.record.lessons[slug];
    if (entry === undefined || entry.finished !== true || entry.starred === true) {
      renderCompletion();
      return;
    }
    const result = window.LM.progress.setStarred(slug);
    if (result !== null && result.changed === true) announceStar();
    renderCompletion();
  }

  function handleTransport(step, control) {
    const controls = step.controls;
    if (control === controls.play) {
      startPlayback();
      return;
    }
    if (control === controls.stop) {
      if (engine !== null) engine.stop();
      return;
    }
    if (control === controls.mute) {
      muted = !muted;
      if (engine !== null) engine.setMuted(muted);
      setThreeTransport(step, engine === null ? "idle" : engine.state);
      return;
    }
    if (control === controls.toggle) {
      if (engine !== null && engine.state === "running") engine.stop();
      else startPlayback();
    }
  }

  function startPlayback() {
    const active = ensureEngine();
    if (active === null) return;
    Promise.resolve(active.unlock())
      .then(function (ok) {
        if (!ok) return;
        active.start();
      })
      .catch(function () {});
  }

  function activateControl(step, control) {
    const controls = step.controls;
    if (controls === null) return;
    if (
      control === controls.play ||
      control === controls.stop ||
      control === controls.mute ||
      control === controls.toggle
    ) {
      handleTransport(step, control);
      return;
    }
    const cellIndex = controls.cells.indexOf(control);
    if (cellIndex !== -1) {
      toggleDrumCell(step, cellIndex);
      return;
    }
    const bassIndex = controls.bassCells.indexOf(control);
    if (bassIndex !== -1) {
      cycleBass(step, bassIndex);
      return;
    }
    const layerIndex = controls.layers.indexOf(control);
    if (layerIndex !== -1) {
      toggleLayer(step, control);
      return;
    }
    if (control === controls.earlier) {
      moveBlock(step, -1);
      return;
    }
    if (control === controls.later) {
      moveBlock(step, 1);
      return;
    }
    const radioIndex = controls.radios.indexOf(control);
    if (radioIndex !== -1) {
      if (step.family === "keys") pressKey(step, radioIndex);
      else if (step.family === "chords") cyclePad(step, radioIndex);
      else selectArrange(step, radioIndex);
    }
  }

  function controlFrom(region, target) {
    let node = target;
    while (node !== null && node !== region) {
      const tag = node.tagName;
      if (tag === "BUTTON") return node;
      if (tag === "INPUT") return node;
      if (tag === "LABEL") {
        if (node.control !== undefined && node.control !== null) return node.control;
        const nested = node.querySelector("input");
        if (nested !== null) return nested;
      }
      node = node.parentElement;
    }
    return null;
  }

  function bindRegionEvents(step) {
    if (step.toy === null || boundRegions.has(step.toy)) return;
    boundRegions.add(step.toy);
    const region = step.toy;
    const last = new Map();
    function resolve(event) {
      const control = controlFrom(region, event.target);
      if (control === null) return;
      const now = Date.now();
      const previous = last.get(control);
      if (previous !== undefined && now - previous < 400) return;
      last.set(control, now);
      control.removeAttribute("data-pressed");
      try {
        activateControl(step, control);
      } catch {
        void 0;
      }
    }
    region.addEventListener("pointerup", resolve);
    region.addEventListener("click", resolve);
    region.addEventListener("pointerdown", function (event) {
      const control = controlFrom(region, event.target);
      if (control !== null) control.setAttribute("data-pressed", "true");
    });
    region.addEventListener("pointercancel", function (event) {
      const control = controlFrom(region, event.target);
      if (control !== null) control.removeAttribute("data-pressed");
    });
  }

  function indexShell() {
    const sections = Array.from(document.querySelectorAll(".lm-step"));
    sections.sort(function (left, right) {
      return Number(left.getAttribute("data-step")) - Number(right.getAttribute("data-step"));
    });
    const spec = LESSON_DATA[slug].steps;
    steps = spec.map(function (entry, index) {
      const root = sections[index] === undefined ? null : sections[index];
      return {
        slug: slug,
        n: index + 1,
        family: entry.family,
        payload: entry.payload,
        goal: entry.goal,
        root: root,
        h2: root === null ? null : root.querySelector("h2"),
        toy: root === null ? null : root.querySelector(".lm-toy"),
        back: root === null ? null : root.querySelector('[data-nav="back"]'),
        next: root === null ? null : root.querySelector('[data-nav="next"]'),
        state: null,
        controls: null,
        built: false,
      };
    });
  }

  function renderIndicator(n) {
    const node = document.querySelector(".lm-indicator");
    if (node !== null) node.textContent = n + " / 4";
  }

  function updateNav(step) {
    if (step.back !== null) step.back.disabled = step.n === 1;
    if (step.next !== null && step.next.tagName === "BUTTON") step.next.disabled = false;
  }

  function lessonEntry() {
    const view = window.LM.progress.get();
    return view.record.lessons[slug];
  }

  function isFinished() {
    const entry = lessonEntry();
    return entry !== undefined && entry.finished === true;
  }

  function renderCompletion() {
    const block = document.querySelector(".lm-complete");
    if (block === null) return;
    const entry = lessonEntry();
    const finished = entry !== undefined && entry.finished === true;
    block.hidden = !(finished && currentIndex === 3);
    const star = block.querySelector(".lm-star");
    if (star !== null) star.setAttribute("data-star", entry !== undefined && entry.starred === true ? "1" : "0");
  }

  function applyStep(index, userInitiated) {
    if (index < 0 || index >= steps.length) return;
    currentIndex = index;
    const step = steps[index];
    if (document.body !== null) document.body.setAttribute("data-step", String(step.n));
    for (let i = 0; i < steps.length; i++) {
      if (steps[i].root !== null) steps[i].root.hidden = i !== index;
    }
    if (userInitiated) focusHeading(step);
    renderIndicator(step.n);
    updateNav(step);
    if (step.n === 4 && !isFinished()) window.LM.progress.markFinished(slug);
    bindRegionEvents(step);
    renderToy(step);
    renderCompletion();
    renderEngineState(engine === null ? "idle" : engine.state);
    if (userInitiated) announceStep(step);
  }

  function showStep(n, options) {
    const index = n - 1;
    if (index === currentIndex) return;
    const flags = options === null || typeof options !== "object" ? {} : options;
    applyStep(index, flags.userInitiated === true);
  }

  function bindNavigation() {
    steps.forEach(function (step) {
      if (step.back !== null) {
        step.back.addEventListener("click", function () {
          showStep(step.n - 1, { userInitiated: true });
        });
      }
      if (step.next !== null && step.next.tagName !== "A") {
        step.next.addEventListener("click", function () {
          showStep(step.n + 1, { userInitiated: true });
        });
      }
    });
  }

  function bindLanguage() {
    const buttons = document.querySelectorAll("button[data-lang]");
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function (event) {
        const button = event.currentTarget;
        window.LM.lang.set(button.getAttribute("data-lang"));
      });
    }
    window.LM.lang.onChange(function () {
      try {
        if (currentIndex >= 0 && steps[currentIndex] !== undefined) renderToy(steps[currentIndex]);
      } catch {
        void 0;
      }
    });
  }

  function bindReducedMotion() {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    function apply() {
      if (document.body !== null) document.body.setAttribute("data-motion", query.matches ? "reduce" : "full");
    }
    apply();
    if (typeof query.addEventListener === "function") query.addEventListener("change", apply);
    else if (typeof query.addListener === "function") query.addListener(apply);
  }

  function bindVisibility() {
    document.addEventListener("visibilitychange", function () {
      if (engine === null) return;
      if (document.hidden === true) {
        muted = true;
        engine.setMuted(true);
        engine.stop();
        return;
      }
      muted = false;
      engine.setMuted(false);
    });
  }

  function syncCurrentStep() {
    if (currentIndex < 0) return;
    const step = steps[currentIndex];
    if (step === undefined) return;
    renderIndicator(step.n);
    updateNav(step);
    renderToy(step);
    renderCompletion();
    renderEngineState(engine === null ? "idle" : engine.state);
  }

  function bindPageLifecycle() {
    window.addEventListener("pageshow", function (event) {
      if (!event || event.persisted !== true) return;
      syncCurrentStep();
    });
    window.addEventListener("pagehide", function (event) {
      if (event && event.persisted === true) return;
      if (engine !== null) engine.dispose();
    });
  }

  function bindProgressChanges() {
    window.LM.progress.onChange(function () {
      try {
        renderCompletion();
      } catch {
        void 0;
      }
    });
  }

  function bindLiveRegion() {
    const region = document.getElementById("live");
    if (region !== null) queue = createAnnouncementQueue(region);
  }

  function subscribe(bind) {
    try {
      bind();
    } catch {
      void 0;
    }
  }

  function bindBehaviours() {
    subscribe(bindNavigation);
    subscribe(bindLanguage);
    subscribe(bindReducedMotion);
    subscribe(bindVisibility);
    subscribe(bindPageLifecycle);
    subscribe(bindProgressChanges);
    subscribe(bindLiveRegion);
  }

  function boot() {
    if (booted) return;
    booted = true;
    if (!window.LM || !window.LM.text || !window.LM.audio || !window.LM.progress) return;
    try {
      const body = document.body;
      if (body === null) return;
      const found = readLessonSlug(body.getAttribute("data-lesson"));
      if (found === undefined) return;
      slug = found;
      body.setAttribute("data-ready", "true");
      window.LM.i18n.apply(document, window.LM.lang.current());
      indexShell();
      bindBehaviours();
      applyStep(0, false);
    } catch {
      void 0;
    }
  }

  Object.assign(window.LM || (window.LM = {}), {
    lesson: {
      boot: boot,
    },
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
