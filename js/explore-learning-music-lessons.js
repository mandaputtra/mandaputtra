(function () {
  "use strict";

  const LESSON_SLUGS = ["beats", "notes-scales", "chords", "basslines", "melodies", "song-structure"];
  const LANES = ["openhat", "hat", "clap", "kick"];
  const STEPS = 16;
  const DEFAULT_BPM = 98;
  const VELOCITY = { X: 1, x: 0.75, o: 0.35 };
  const BASS_VALUES = ["off", "root", "fifth", "octave"];
  const CHORD_CYCLE = ["Am", "F", "C", "G"];
  const KEYBOARD = ["C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4"];
  const ARRANGE_LANES = {
    kick: "X...X...X...X...",
    snare: "....X.......X...",
    hat: "................",
  };
  const BLOCKS = ["A", "B", "C", "D"];
  const GRID = {
    drum: { rows: LANES, multi: true, unit: 1, group: "toy.group.beats" },
    keys: { rows: KEYBOARD, field: "slots", empty: null, unit: 2, group: "toy.group.piano" },
    bass: { rows: BASS_VALUES.slice(1).reverse(), field: "cells", empty: "off", unit: 4, group: "toy.layer.bass" },
    chords: { rows: CHORD_CYCLE, field: "progression", unit: 16, group: "toy.group.chords" },
    arrange: { rows: BLOCKS, field: "blocks", unit: 16, group: "toy.group.arrange" },
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
          payload: { lanes: { openhat: "................", hat: "................", clap: "................", kick: "X..............." } },
          goal: null,
          finale: false,
        },
        {
          family: "drum",
          toy: "drum",
          copy: "lesson.beats.step2",
          payload: { lanes: { openhat: "................", hat: "................", clap: "....X.......X...", kick: "X...X...X...X..." } },
          goal: null,
          finale: false,
        },
        {
          family: "drum",
          toy: "drum",
          copy: "lesson.beats.step3",
          payload: { lanes: { openhat: "................", hat: "X.X.X.X.X.X.X.X.", clap: "....X.......X...", kick: "X...X...X...X..." } },
          goal: null,
          finale: false,
        },
        {
          family: "drum",
          toy: "drum",
          copy: "lesson.beats.step4",
          payload: { lanes: { openhat: "................", hat: "X.X.X.X.X.X.X.X.", clap: "....X.......X...", kick: "X...X...X...X..." } },
          goal: { type: "cells-equal", cells: ["..............X.", "X.X.X.X.X.X.X...", "....X.......X...", "X...X...X...X..."] },
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

  function arraysEqual(left, right) {
    if (left.length !== right.length) return false;
    for (let i = 0; i < left.length; i++) {
      if (left[i] !== right[i]) return false;
    }
    return true;
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

  const ICONS = {
    play: '<path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor"/>',
    mute:
      '<path d="M4 9.5h3.5L12 5v14l-4.5-4.5H4z" fill="currentColor"/>' +
      '<path class="lm-waves" d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>' +
      '<path class="lm-x" d="M15.5 9.5l5 5M20.5 9.5l-5 5"/>',
    clear: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5M10.5 10.5v6M13.5 10.5v6"/>',
  };

  function iconButton(name) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lm-icon";
    button.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      ICONS[name] +
      "</svg>";
    return button;
  }

  function nameButton(button, key) {
    if (button === null) return;
    const label = text(key);
    button.setAttribute("aria-label", label);
    button.title = label;
  }

  function createTransport() {
    const wrap = document.createElement("div");
    wrap.className = "lm-transport";
    ["play", "stop", "mute"].forEach(function (name) {
      const button = iconButton(name);
      button.setAttribute("data-transport", name);
      if (name === "mute") button.setAttribute("aria-pressed", "false");
      if (name === "stop") button.disabled = true;
      nameButton(button, "ui." + name);
      wrap.appendChild(button);
    });
    return wrap;
  }

  function columnCount(step) {
    const spec = GRID[step.family];
    return spec.multi ? STEPS : step.payload[spec.field].length;
  }

  function canClear(spec) {
    return spec.multi === true || spec.empty !== undefined;
  }

  function buildGrid(region, step) {
    const spec = GRID[step.family];
    const columns = columnCount(step);
    region.classList.add("lm-grid");
    if (spec.multi) region.classList.add("lm-wide");
    const bar = document.createElement("div");
    bar.className = "lm-gridbar";
    bar.appendChild(createTransport());
    if (canClear(spec)) {
      const clear = iconButton("clear");
      clear.setAttribute("data-clear", "");
      bar.appendChild(clear);
    }
    const tempo = document.createElement("label");
    tempo.className = "lm-tempo";
    const readout = document.createElement("span");
    readout.setAttribute("data-tempo-readout", "");
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "60";
    slider.max = "160";
    slider.step = "1";
    slider.value = String(DEFAULT_BPM);
    slider.setAttribute("data-tempo", "");
    tempo.append(readout, slider);
    region.append(bar, tempo);
    if (step.family === "arrange") {
      const layers = document.createElement("div");
      layers.className = "lm-layers";
      ["drums", "bass", "chords", "melody"].forEach(function (layer) {
        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("data-layer", layer);
        button.setAttribute("aria-pressed", "true");
        layers.appendChild(button);
      });
      region.appendChild(layers);
    }
    const grid = document.createElement("div");
    grid.className = "lm-beatgrid";
    grid.setAttribute("role", "group");
    spec.rows.forEach(function (row) {
      const line = document.createElement("div");
      line.className = "lm-lane";
      const name = document.createElement("span");
      name.className = "lm-lane-name";
      name.setAttribute("aria-hidden", "true");
      name.setAttribute("data-row-name", row);
      line.appendChild(name);
      for (let column = 0; column < columns; column++) {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "lm-cell";
        cell.setAttribute("data-row", row);
        cell.setAttribute("data-col", String(column));
        cell.tabIndex = -1;
        line.appendChild(cell);
      }
      grid.appendChild(line);
    });
    const numbers = document.createElement("div");
    numbers.className = "lm-lane lm-steps";
    if (columns === STEPS) numbers.classList.add("lm-steps-beat");
    numbers.setAttribute("aria-hidden", "true");
    numbers.appendChild(document.createElement("span"));
    for (let column = 0; column < columns; column++) {
      const number = document.createElement("span");
      number.textContent = String(column + 1);
      numbers.appendChild(number);
    }
    grid.appendChild(numbers);
    region.appendChild(grid);
  }

  function clearChildren(region) {
    while (region.firstChild !== null) region.removeChild(region.firstChild);
  }

  function buildInterior(step) {
    clearChildren(step.toy);
    step.toy.className = "lm-toy";
    buildGrid(step.toy, step);
  }

  function countIn(region, selector) {
    return region.querySelectorAll(selector).length;
  }

  function hasInterior(step) {
    const region = step.toy;
    if (region === null) return false;
    const cells = GRID[step.family].rows.length * columnCount(step);
    return countIn(region, "button[data-row]") === cells && countIn(region, "[data-transport]") === 3;
  }

  function collectControls(region) {
    return {
      cells: Array.from(region.querySelectorAll("button[data-row]")),
      rowNames: Array.from(region.querySelectorAll("[data-row-name]")),
      grid: region.querySelector(".lm-beatgrid"),
      clear: region.querySelector("[data-clear]"),
      tempo: region.querySelector("[data-tempo]"),
      tempoReadout: region.querySelector("[data-tempo-readout]"),
      layers: Array.from(region.querySelectorAll("[data-layer]")),
      play: region.querySelector('[data-transport="play"]'),
      stop: region.querySelector('[data-transport="stop"]'),
      mute: region.querySelector('[data-transport="mute"]'),
    };
  }

  function assertFocusBudget(region) {
    if (region === null) return;
    const total = countIn(region, "button, input, select, textarea, a[href], [tabindex]") - countIn(region, '[tabindex="-1"]');
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
    if (step.family === "drum") return { lanes: Object.assign({}, payload.lanes), bpm: DEFAULT_BPM };
    if (step.family === "bass") return { cells: payload.cells.slice(), bpm: DEFAULT_BPM };
    if (step.family === "keys") return { slots: payload.slots.slice(), rewriteSlots: payload.rewriteSlots.slice(), bpm: DEFAULT_BPM };
    if (step.family === "chords") return { progression: payload.progression.slice(), pads: payload.pads, bpm: DEFAULT_BPM };
    return {
      blocks: payload.blocks.slice(),
      chordMap: payload.chordMap.slice(),
      layers: { drums: payload.layers.drums, bass: payload.layers.bass, chords: payload.layers.chords, melody: payload.layers.melody },
      bpm: DEFAULT_BPM,
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

  function blockChord(state, block) {
    return state.chordMap[BLOCKS.indexOf(block)];
  }

  function goalCells(state) {
    return LANES.map(function (lane) {
      return state.lanes[lane].replace(/[xo]/g, "X");
    });
  }

  function evaluateGoal(step) {
    const goal = step.goal;
    if (goal === null) return false;
    try {
      const state = stateFor(step);
      if (goal.type === "cells-equal") return goal.cells.length === LANES.length && arraysEqual(goalCells(state), goal.cells);
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

  function isOn(step, row, column) {
    const state = stateFor(step);
    if (step.family === "drum") return hasHit(state.lanes[row].charAt(column));
    if (step.family === "keys") return effectiveSlot(state, column) === row;
    return state[GRID[step.family].field][column] === row;
  }

  function isLocked(step, column) {
    const state = stateFor(step);
    if (step.family === "keys") return state.rewriteSlots.indexOf(column) !== -1;
    if (step.family === "chords") return state.pads === false;
    return false;
  }

  function rowName(step, row) {
    if (step.family === "drum") return text("toy.lane." + row);
    if (step.family === "bass") return text("toy.value." + row);
    if (step.family === "arrange") return row + ": " + blockChord(stateFor(step), row);
    return row;
  }

  function renderGrid(step) {
    const state = stateFor(step);
    const controls = step.controls;
    let stop = null;
    controls.cells.forEach(function (cell) {
      const row = cell.getAttribute("data-row");
      const column = Number(cell.getAttribute("data-col"));
      cell.setAttribute("aria-pressed", isOn(step, row, column) ? "true" : "false");
      cell.setAttribute("aria-label", rowName(step, row) + " " + (column + 1));
      cell.disabled = isLocked(step, column);
      if (cell.tabIndex === 0 && !cell.disabled) stop = cell;
    });
    if (stop === null) stop = controls.cells.find(function (cell) {
      return !cell.disabled;
    }) || null;
    controls.cells.forEach(function (cell) {
      cell.tabIndex = cell === stop ? 0 : -1;
    });
    controls.rowNames.forEach(function (node) {
      node.textContent = rowName(step, node.getAttribute("data-row-name"));
    });
    controls.layers.forEach(function (button) {
      const layer = button.getAttribute("data-layer");
      button.setAttribute("aria-pressed", state.layers[layer] ? "true" : "false");
      button.textContent = text("toy.layer." + layer);
    });
    if (controls.grid !== null) controls.grid.setAttribute("aria-label", text(GRID[step.family].group));
    nameButton(controls.clear, "ui.clear");
    if (controls.tempo !== null) controls.tempo.value = String(state.bpm);
    if (controls.tempoReadout !== null) controls.tempoReadout.textContent = text("ui.tempo") + ": " + state.bpm + " bpm";
  }

  function markPlayhead(step, column) {
    if (step.controls === null || step.controls.grid === null || step.controls.grid === undefined) return;
    const grid = step.controls.grid;
    const previous = grid.querySelectorAll("[data-now]");
    for (let i = 0; i < previous.length; i++) previous[i].removeAttribute("data-now");
    if (column < 0) return;
    const cells = grid.querySelectorAll('[data-col="' + column + '"]');
    for (let i = 0; i < cells.length; i++) cells[i].setAttribute("data-now", "");
  }

  function renderToy(step) {
    if (step.root === null || step.toy === null) return;
    if (!step.built || !hasInterior(step)) {
      buildInterior(step);
      step.built = true;
      assertFocusBudget(step.toy);
    }
    step.controls = collectControls(step.toy);
    renderGrid(step);
    renderTransport(step);
  }

  function setThreeTransport(step, state) {
    const controls = step.controls;
    if (controls.play !== null) controls.play.disabled = false;
    if (controls.stop !== null) controls.stop.disabled = !(state === "running" || state === "unlocking");
    if (controls.mute !== null) controls.mute.setAttribute("aria-pressed", muted ? "true" : "false");
    nameButton(controls.play, "ui.play");
    nameButton(controls.stop, "ui.stop");
    nameButton(controls.mute, "ui.mute");
  }

  function renderTransport(step) {
    if (step.controls === null) return;
    setThreeTransport(step, engine === null ? "idle" : engine.state);
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
    if (state !== "running") markPlayhead(step, -1);
    setThreeTransport(step, state);
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
    Object.keys(lanes).forEach(function (lane) {
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
    const chord = blockChord(state, state.blocks[barIndex]);
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
      const unit = GRID[step.family].unit;
      const column = unit === 16 ? barIndex : Math.floor((event.step - 1) / unit);
      const delay = Math.max(0, (event.audibleTime - engine.immediate()) * 1000);
      window.setTimeout(function () {
        if (engine !== null && engine.state === "running" && steps[currentIndex] === step) markPlayhead(step, column);
      }, delay);
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

  function preview(step, row) {
    playWhenReady(function (active) {
      const now = active.immediate();
      if (step.family === "drum") active.drum(row, now, 1);
      else if (step.family === "keys") active.note("lead", row, 2 * active.timing.stepDur, now, 0.75);
      else if (step.family === "bass") {
        const degrees = window.LM.music.bassDegrees[playingChord()];
        if (degrees !== undefined) active.note("bass", degrees[row], 0.9 * active.timing.beatDur, now, 0.7);
      } else {
        const chord = step.family === "chords" ? row : blockChord(stateFor(step), row);
        const tones = window.LM.music.chordTones[chord];
        if (tones === undefined) return;
        active.releaseAll(now);
        active.chord(tones, 1.6, now, 0.85, 0.012);
      }
    });
  }

  function tapCell(step, cell) {
    const state = stateFor(step);
    const spec = GRID[step.family];
    const row = cell.getAttribute("data-row");
    const column = Number(cell.getAttribute("data-col"));
    if (isLocked(step, column)) return;
    const wasOn = isOn(step, row, column);
    if (spec.multi) {
      state.lanes[row] = state.lanes[row].slice(0, column) + (wasOn ? "." : "X") + state.lanes[row].slice(column + 1);
    } else if (!wasOn) {
      state[spec.field][column] = row;
    } else if (spec.empty !== undefined) {
      state[spec.field][column] = spec.empty;
    }
    step.controls.cells.forEach(function (other) {
      other.tabIndex = other === cell ? 0 : -1;
    });
    renderGrid(step);
    if (!wasOn || !canClear(spec)) preview(step, row);
    checkGoal(step);
  }

  function clearGrid(step) {
    const state = stateFor(step);
    const spec = GRID[step.family];
    if (spec.multi) {
      LANES.forEach(function (lane) {
        state.lanes[lane] = ".".repeat(STEPS);
      });
    } else {
      state[spec.field] = state[spec.field].map(function () {
        return spec.empty;
      });
    }
    renderGrid(step);
    checkGoal(step);
  }

  function setTempo(step, value) {
    const state = stateFor(step);
    state.bpm = Math.min(160, Math.max(60, Math.round(Number(value)) || DEFAULT_BPM));
    if (engine !== null) engine.setBpm(state.bpm);
    renderGrid(step);
  }

  function moveCellFocus(step, event) {
    const cells = step.controls === null ? [] : step.controls.cells;
    const index = cells.indexOf(event.target);
    if (index === -1) return;
    const columns = columnCount(step);
    const rows = GRID[step.family].rows.length;
    const moves = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], ArrowUp: [-1, 0] };
    let row = Math.floor(index / columns);
    let column = index % columns;
    let next = null;
    if (event.key === "Home" || event.key === "End") {
      const line = cells.slice(row * columns, row * columns + columns).filter(function (cell) {
        return !cell.disabled;
      });
      next = event.key === "Home" ? line[0] : line[line.length - 1];
    } else {
      const move = moves[event.key];
      if (move === undefined) return;
      do {
        row += move[0];
        column += move[1];
        if (row < 0 || row >= rows || column < 0 || column >= columns) break;
        if (!cells[row * columns + column].disabled) next = cells[row * columns + column];
      } while (next === null);
    }
    event.preventDefault();
    if (next === null || next === undefined) return;
    cells[index].tabIndex = -1;
    next.tabIndex = 0;
    next.focus();
  }

  function toggleLayer(step, button) {
    const state = stateFor(step);
    const layer = button.getAttribute("data-layer");
    if (state.layers[layer] === undefined) return;
    state.layers[layer] = !state.layers[layer];
    renderGrid(step);
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
      markPlayhead(step, -1);
      return;
    }
    if (control === controls.mute) {
      muted = !muted;
      if (engine !== null) engine.setMuted(muted);
      setThreeTransport(step, engine === null ? "idle" : engine.state);
      return;
    }
  }

  function startPlayback() {
    const active = ensureEngine();
    if (active === null) return;
    const current = steps[currentIndex];
    if (current !== undefined) active.setBpm(stateFor(current).bpm);
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
    if (control === controls.play || control === controls.stop || control === controls.mute) {
      handleTransport(step, control);
      return;
    }
    if (control === controls.clear) {
      clearGrid(step);
      return;
    }
    if (controls.cells.indexOf(control) !== -1) {
      tapCell(step, control);
      return;
    }
    if (controls.layers.indexOf(control) !== -1) toggleLayer(step, control);
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
    region.addEventListener("input", function (event) {
      if (event.target.hasAttribute("data-tempo")) setTempo(step, event.target.value);
    });
    region.addEventListener("keydown", function (event) {
      moveCellFocus(step, event);
    });
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
    if (engine !== null) engine.setBpm(stateFor(step).bpm);
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
