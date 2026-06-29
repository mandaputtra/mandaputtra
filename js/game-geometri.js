(() => {
  const MAX_ROUNDS = 10;

  const SHAPES = [
    { id: "circle", label: "lingkaran" },
    { id: "square", label: "persegi" },
    { id: "triangle", label: "segitiga" },
    { id: "diamond", label: "belah ketupat" },
    { id: "hexagon", label: "segi enam" },
  ];

  const COLORS = [
    { id: "red", label: "merah", hex: "#f15b5b" },
    { id: "blue", label: "biru", hex: "#4d79ff" },
    { id: "yellow", label: "kuning", hex: "#f6c945" },
    { id: "green", label: "hijau", hex: "#39b67a" },
    { id: "purple", label: "ungu", hex: "#8c62ff" },
  ];

  const SIZES = [
    { id: "small", label: "kecil", radius: 20 },
    { id: "medium", label: "sedang", radius: 26 },
    { id: "large", label: "besar", radius: 32 },
  ];

  const LEVELS = {
    dasar: ["alternateShape", "colorCycle", "sizeCycle", "rotationStep"],
    menengah: ["shapeColorCycle", "shapeSizeCombo", "rotationColorCombo"],
    campuran: [
      "alternateShape",
      "colorCycle",
      "sizeCycle",
      "rotationStep",
      "shapeColorCycle",
      "shapeSizeCombo",
      "rotationColorCombo",
    ],
  };

  const els = {
    round: document.querySelector("#round-value"),
    score: document.querySelector("#score-value"),
    streak: document.querySelector("#streak-value"),
    level: document.querySelector("#level-select"),
    reset: document.querySelector("#reset-game"),
    track: document.querySelector("#pattern-track"),
    options: document.querySelector("#options"),
    error: document.querySelector("#error-text"),
    question: document.querySelector("#question-text"),
    feedback: document.querySelector("#feedback"),
    feedbackTitle: document.querySelector("#feedback-title"),
    feedbackText: document.querySelector("#feedback-text"),
    feedbackAnswer: document.querySelector("#feedback-answer"),
    next: document.querySelector("#next-round"),
    playAgain: document.querySelector("#play-again"),
    summary: document.querySelector("#summary"),
    summaryText: document.querySelector("#summary-text"),
    summaryCorrect: document.querySelector("#summary-correct"),
    summaryScore: document.querySelector("#summary-score"),
    summaryAccuracy: document.querySelector("#summary-accuracy"),
  };

  if (!els.level || !els.track || !els.options) return;

  const state = {
    level: "dasar",
    round: 1,
    score: 0,
    streak: 0,
    correct: 0,
    answered: false,
    current: null,
  };

  function randInt(max) {
    return Math.floor(Math.random() * max);
  }

  function sample(list) {
    return list[randInt(list.length)];
  }

  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = randInt(i + 1);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function pickDistinct(list, count) {
    return shuffle(list).slice(0, count);
  }

  function itemKey(item) {
    return [item.shape, item.color.id, item.size.id, item.rotation].join("|");
  }

  function cloneItem(item) {
    return {
      shape: item.shape,
      color: item.color,
      size: item.size,
      rotation: item.rotation,
    };
  }

  function makeItem(shape, color, size, rotation) {
    return { shape, color, size, rotation };
  }

  function colorById(id) {
    return COLORS.find((entry) => entry.id === id) || COLORS[0];
  }

  function sizeById(id) {
    return SIZES.find((entry) => entry.id === id) || SIZES[1];
  }

  function shapeLabel(id) {
    const entry = SHAPES.find((shape) => shape.id === id);
    return entry ? entry.label : id;
  }

  function describeItem(item) {
    const parts = [shapeLabel(item.shape), item.color.label, item.size.label];
    if (item.rotation % 360 !== 0) {
      parts.push(`diputar ${item.rotation} derajat`);
    }
    return parts.join(", ");
  }

  function polygonPoints(sides, radius, startDeg) {
    const points = [];
    for (let i = 0; i < sides; i += 1) {
      const angle = ((startDeg + (360 / sides) * i) * Math.PI) / 180;
      const x = 50 + Math.cos(angle) * radius;
      const y = 50 + Math.sin(angle) * radius;
      points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }
    return points.join(" ");
  }

  function shapeMarkup(item) {
    const fill = item.color.hex;
    const stroke = "rgba(0, 0, 0, 0.16)";
    const r = item.size.radius;

    switch (item.shape) {
      case "circle":
        return `<circle cx="50" cy="50" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"></circle>`;
      case "square":
        return `<rect x="${50 - r}" y="${50 - r}" width="${r * 2}" height="${r * 2}" rx="7" fill="${fill}" stroke="${stroke}" stroke-width="2"></rect>`;
      case "triangle":
        return `<polygon points="${polygonPoints(3, r + 4, -90)}" fill="${fill}" stroke="${stroke}" stroke-width="2"></polygon>`;
      case "diamond":
        return `<polygon points="${polygonPoints(4, r + 1, -90)}" fill="${fill}" stroke="${stroke}" stroke-width="2"></polygon>`;
      case "hexagon":
        return `<polygon points="${polygonPoints(6, r + 2, -90)}" fill="${fill}" stroke="${stroke}" stroke-width="2"></polygon>`;
      default:
        return `<circle cx="50" cy="50" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"></circle>`;
    }
  }

  function shapeSvg(item) {
    return `
      <div class="geo-shape" aria-hidden="true">
        <svg viewBox="0 0 100 100" role="img" focusable="false">
          <g transform="rotate(${item.rotation} 50 50)">
            ${shapeMarkup(item)}
          </g>
        </svg>
      </div>
    `;
  }

  function buildOptions(answer, extraItems) {
    const unique = [];
    const seen = new Set();

    function push(item) {
      const key = itemKey(item);
      if (seen.has(key)) return;
      seen.add(key);
      unique.push(item);
    }

    push(answer);
    extraItems.forEach(push);

    while (unique.length < 4) {
      const fallback = makeItem(
        sample(SHAPES).id,
        sample(COLORS),
        sample(SIZES),
        sample([0, 45, 90, 135, 180]),
      );
      push(fallback);
    }

    return shuffle(unique.slice(0, 4));
  }

  function createAlternateShape() {
    const [shapeA, shapeB, shapeC, shapeD] = pickDistinct(SHAPES.map((shape) => shape.id), 4);
    const color = sample(COLORS);
    const size = sizeById("medium");
    const sequence = [
      makeItem(shapeA, color, size, 0),
      makeItem(shapeB, color, size, 0),
      makeItem(shapeA, color, size, 0),
      makeItem(shapeB, color, size, 0),
    ];
    const answer = makeItem(shapeA, color, size, 0);

    return {
      rule: "Bentuk bergantian dua-dua.",
      prompt: "Perhatikan bentuk yang bergantian. Objek mana yang harus muncul setelah urutan ini?",
      sequence,
      answer,
      options: buildOptions(answer, [
        makeItem(shapeB, color, size, 0),
        makeItem(shapeC, color, size, 0),
        makeItem(shapeD, color, size, 0),
      ]),
      explanation: `Urutannya bergantian ${shapeLabel(shapeA)} lalu ${shapeLabel(shapeB)}, jadi setelah ${shapeLabel(shapeB)} kembali ke ${shapeLabel(shapeA)}.`,
    };
  }

  function createColorCycle() {
    const [colorA, colorB, colorC, colorD] = pickDistinct(COLORS, 4);
    const shape = sample(["circle", "square", "triangle"]);
    const size = sizeById("medium");
    const sequence = [
      makeItem(shape, colorA, size, 0),
      makeItem(shape, colorB, size, 0),
      makeItem(shape, colorC, size, 0),
      makeItem(shape, colorA, size, 0),
    ];
    const answer = makeItem(shape, colorB, size, 0);

    return {
      rule: "Warna berputar secara berulang.",
      prompt: "Bentuknya tetap, tetapi warnanya mengikuti pola. Pilih warna berikutnya.",
      sequence,
      answer,
      options: buildOptions(answer, [
        makeItem(shape, colorA, size, 0),
        makeItem(shape, colorC, size, 0),
        makeItem(shape, colorD, size, 0),
      ]),
      explanation: `Polanya ${colorA.label}, ${colorB.label}, ${colorC.label}, lalu kembali ke ${colorA.label}. Jadi setelah itu muncul warna ${colorB.label}.`,
    };
  }

  function createSizeCycle() {
    const shape = sample(["circle", "square", "hexagon"]);
    const color = sample(COLORS);
    const [small, medium, large] = SIZES;
    const sequence = [
      makeItem(shape, color, small, 0),
      makeItem(shape, color, medium, 0),
      makeItem(shape, color, large, 0),
      makeItem(shape, color, small, 0),
    ];
    const answer = makeItem(shape, color, medium, 0);

    return {
      rule: "Ukuran berulang dari kecil ke besar.",
      prompt: "Ukuran objek berubah teratur. Pilih objek dengan ukuran yang tepat.",
      sequence,
      answer,
      options: buildOptions(answer, [
        makeItem(shape, color, small, 0),
        makeItem(shape, color, large, 0),
        makeItem(sample(["triangle", "diamond"]), color, medium, 0),
      ]),
      explanation: `Urutannya kecil, sedang, besar, lalu kembali kecil. Maka objek berikutnya berukuran sedang.`,
    };
  }

  function createRotationStep() {
    const shape = sample(["triangle", "diamond", "square"]);
    const color = sample(COLORS);
    const size = sizeById("medium");
    const sequence = [
      makeItem(shape, color, size, 0),
      makeItem(shape, color, size, 45),
      makeItem(shape, color, size, 90),
      makeItem(shape, color, size, 135),
    ];
    const answer = makeItem(shape, color, size, 180);

    return {
      rule: "Arah putaran bertambah 45 derajat.",
      prompt: "Bentuknya sama, tetapi arah putarannya berubah. Pilih putaran berikutnya.",
      sequence,
      answer,
      options: buildOptions(answer, [
        makeItem(shape, color, size, 90),
        makeItem(shape, color, size, 225),
        makeItem(shape, color, size, 0),
      ]),
      explanation: "Setiap langkah diputar 45 derajat lebih jauh, jadi setelah 135 derajat berikutnya adalah 180 derajat.",
    };
  }

  function createShapeColorCycle() {
    const [shapeA, shapeB, shapeC, shapeD] = pickDistinct(SHAPES.map((shape) => shape.id), 4);
    const [colorA, colorB, colorC, colorD] = pickDistinct(COLORS, 4);
    const size = sizeById("medium");
    const sequence = [
      makeItem(shapeA, colorA, size, 0),
      makeItem(shapeB, colorB, size, 0),
      makeItem(shapeC, colorC, size, 0),
      makeItem(shapeA, colorA, size, 0),
    ];
    const answer = makeItem(shapeB, colorB, size, 0);

    return {
      rule: "Bentuk dan warna berpasangan lalu berulang.",
      prompt: "Ada dua pola yang berjalan bersama. Pilih pasangan bentuk dan warna yang benar.",
      sequence,
      answer,
      options: buildOptions(answer, [
        makeItem(shapeB, colorC, size, 0),
        makeItem(shapeC, colorB, size, 0),
        makeItem(shapeD, colorD, size, 0),
      ]),
      explanation: `Pasangannya berulang ${shapeLabel(shapeA)} ${colorA.label}, ${shapeLabel(shapeB)} ${colorB.label}, ${shapeLabel(shapeC)} ${colorC.label}, lalu kembali ke awal. Maka sesudah ${shapeLabel(shapeA)} ${colorA.label} adalah ${shapeLabel(shapeB)} ${colorB.label}.`,
    };
  }

  function createShapeSizeCombo() {
    const [shapeA, shapeB, shapeC] = pickDistinct(SHAPES.map((shape) => shape.id), 3);
    const color = sample(COLORS);
    const [small, medium, large] = SIZES;
    const sequence = [
      makeItem(shapeA, color, small, 0),
      makeItem(shapeB, color, medium, 0),
      makeItem(shapeA, color, large, 0),
      makeItem(shapeB, color, small, 0),
    ];
    const answer = makeItem(shapeA, color, medium, 0);

    return {
      rule: "Bentuk bergantian, ukuran naik lalu mengulang.",
      prompt: "Perhatikan bentuk dan ukuran sekaligus, lalu pilih objek berikutnya.",
      sequence,
      answer,
      options: buildOptions(answer, [
        makeItem(shapeB, color, medium, 0),
        makeItem(shapeA, color, large, 0),
        makeItem(shapeC, color, medium, 0),
      ]),
      explanation: `Bentuknya bergantian ${shapeLabel(shapeA)} dan ${shapeLabel(shapeB)}, sedangkan ukurannya kecil, sedang, besar, kecil. Jadi berikutnya ${shapeLabel(shapeA)} dengan ukuran sedang.`,
    };
  }

  function createRotationColorCombo() {
    const shape = sample(["triangle", "diamond", "hexagon"]);
    const [colorA, colorB, colorC, colorD] = pickDistinct(COLORS, 4);
    const size = sizeById("medium");
    const sequence = [
      makeItem(shape, colorA, size, 0),
      makeItem(shape, colorB, size, 90),
      makeItem(shape, colorC, size, 180),
      makeItem(shape, colorA, size, 270),
    ];
    const answer = makeItem(shape, colorB, size, 0);

    return {
      rule: "Warna berulang tiga langkah dan rotasi berputar seperempat putaran.",
      prompt: "Warna dan putaran berubah bersama. Pilih objek yang tepat untuk melanjutkan pola.",
      sequence,
      answer,
      options: buildOptions(answer, [
        makeItem(shape, colorC, size, 0),
        makeItem(shape, colorB, size, 90),
        makeItem(shape, colorD, size, 0),
      ]),
      explanation: `Warna berulang ${colorA.label}, ${colorB.label}, ${colorC.label}, lalu kembali ${colorA.label}. Rotasinya 0, 90, 180, 270, lalu kembali 0 derajat. Maka jawaban berikutnya adalah warna ${colorB.label} dengan rotasi 0 derajat.`,
    };
  }

  const GENERATORS = {
    alternateShape: createAlternateShape,
    colorCycle: createColorCycle,
    sizeCycle: createSizeCycle,
    rotationStep: createRotationStep,
    shapeColorCycle: createShapeColorCycle,
    shapeSizeCombo: createShapeSizeCombo,
    rotationColorCombo: createRotationColorCombo,
  };

  function setError(message) {
    els.error.textContent = message || "";
  }

  function feedbackClass(isCorrect) {
    return isCorrect ? "geo-feedback is-correct" : "geo-feedback is-wrong";
  }

  function renderTrack() {
    const cards = state.current.sequence
      .map(
        (item, index) => `
          <div class="geo-card">
            <span class="geo-card-label">Langkah ${index + 1}</span>
            ${shapeSvg(item)}
          </div>
        `,
      )
      .join("");

    els.track.innerHTML = `${cards}
      <div class="geo-card is-missing">
        <span class="geo-card-label">Berikutnya</span>
        <div class="geo-missing-mark" aria-hidden="true">?</div>
      </div>`;
  }

  function renderOptions() {
    const letters = ["A", "B", "C", "D"];
    els.options.innerHTML = state.current.options
      .map((item, index) => {
        const key = itemKey(item);
        return `
          <button type="button" class="geo-option" data-key="${key}" aria-label="${describeItem(item)}">
            <span class="geo-option-letter" aria-hidden="true">${letters[index]}</span>
            ${shapeSvg(item)}
            <span class="geo-option-label">${describeItem(item)}</span>
          </button>
        `;
      })
      .join("");
  }

  function renderStats() {
    els.round.textContent = `${state.round}/${MAX_ROUNDS}`;
    els.score.textContent = `${state.score}`;
    els.streak.textContent = `${state.streak}`;
  }

  function renderSummary() {
    const accuracy = Math.round((state.correct / MAX_ROUNDS) * 100);
    let note = "Teruskan latihan supaya makin cepat mengenali pola.";
    if (accuracy >= 90) {
      note = "Hebat! Kamu sangat teliti membaca pola geometri.";
    } else if (accuracy >= 70) {
      note = "Bagus! Kemampuan mengenali pola sudah kuat, tinggal lebih teliti.";
    }

    els.summary.hidden = false;
    els.summaryText.textContent = note;
    els.summaryCorrect.textContent = `${state.correct} dari ${MAX_ROUNDS}`;
    els.summaryScore.textContent = `${state.score}`;
    els.summaryAccuracy.textContent = `${accuracy}%`;
  }

  function clearFeedback() {
    els.feedback.hidden = true;
    els.feedback.className = "geo-feedback";
    els.feedbackTitle.textContent = "";
    els.feedbackText.textContent = "";
    els.feedbackAnswer.textContent = "";
    els.next.hidden = true;
    els.playAgain.hidden = true;
  }

  function renderPuzzle() {
    renderStats();
    els.summary.hidden = true;
    els.question.textContent = state.current.prompt;
    renderTrack();
    renderOptions();
    setError("");
    clearFeedback();
  }

  function setOptionState(selectedKey) {
    const answerKey = itemKey(state.current.answer);
    const buttons = Array.from(els.options.querySelectorAll(".geo-option"));
    buttons.forEach((button) => {
      const key = button.getAttribute("data-key");
      button.disabled = true;
      if (key === answerKey) button.classList.add("is-correct");
      if (selectedKey && key === selectedKey && key !== answerKey) {
        button.classList.add("is-wrong");
      }
    });
  }

  function showFeedback(isCorrect) {
    els.feedback.hidden = false;
    els.feedback.className = feedbackClass(isCorrect);
    els.feedbackTitle.textContent = isCorrect ? "Jawaban benar." : "Masih belum tepat.";
    els.feedbackText.textContent = state.current.explanation;
    els.feedbackAnswer.textContent = `Jawaban yang benar: ${describeItem(state.current.answer)}.`;

    if (state.round >= MAX_ROUNDS) {
      els.playAgain.hidden = false;
      renderSummary();
    } else {
      els.next.hidden = false;
    }
  }

  function nextPuzzle() {
    const available = LEVELS[state.level] || LEVELS.dasar;
    const puzzleName = sample(available);
    state.current = GENERATORS[puzzleName]();
    state.answered = false;
    renderPuzzle();
  }

  function finishAnswer(selectedKey) {
    if (state.answered) return;
    state.answered = true;
    setError("");

    const answerKey = itemKey(state.current.answer);
    const isCorrect = selectedKey === answerKey;

    if (isCorrect) {
      state.correct += 1;
      state.streak += 1;
      state.score += 10 + Math.min(5, state.streak - 1);
    } else {
      state.streak = 0;
    }

    renderStats();
    setOptionState(selectedKey);
    showFeedback(isCorrect);
  }

  function startGame() {
    state.round = 1;
    state.score = 0;
    state.streak = 0;
    state.correct = 0;
    state.answered = false;
    nextPuzzle();
  }

  els.options.addEventListener("click", (event) => {
    const button = event.target.closest(".geo-option");
    if (!button || state.answered) return;
    finishAnswer(button.getAttribute("data-key"));
  });

  els.next.addEventListener("click", () => {
    if (state.round >= MAX_ROUNDS) return;
    state.round += 1;
    nextPuzzle();
  });

  els.playAgain.addEventListener("click", () => {
    startGame();
  });

  els.reset.addEventListener("click", () => {
    startGame();
  });

  els.level.addEventListener("change", () => {
    state.level = els.level.value;
    startGame();
  });

  state.level = els.level.value;
  startGame();
})();
