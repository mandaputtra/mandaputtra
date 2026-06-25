(() => {
  const START_BALANCE = 10;

  const MODES = {
    friendly: { pWin: 0.49, descKey: "modeDesc.friendly" },
    normal: { pWin: 0.45, descKey: "modeDesc.normal" },
    brutal: { pWin: 0.4, descKey: "modeDesc.brutal" },
  };

  const I18N = {
    en: {
      t: {
        title: "Can You Beat The Machine?",
        subtitle: "Pick 0 or 1. Bet your money. Try to grow $10.",
        disclaimerMini: "This is a toy. The reveal happens at the end.",
      },
      ui: {
        language: "Language",
        mode: "Mode",
        modeFriendly: "Friendly",
        modeNormal: "Normal",
        modeBrutal: "Brutal",
        winRate: "Win rate",
        balance: "Balance",
        bet: "Your bet",
        pick: "Pick one",
        head: "Head",
        tail: "Tail",
        play: "Play round",
        cashOut: "Cash out",
        reset: "Reset",
        again: "Play again",
        chartTitle: "Your balance over time",
        historyTitle: "Recent rounds",
        round: "Round",
        result: "Result",
        youPicked: "You picked",
        machineShowed: "Machine showed",
        win: "You win",
        lose: "You lose",
      },
      hint: {
        betRules: "Whole dollars only. Minimum $1.",
        betMax: "Max bet is your current balance.",
        chooseFirst: "Pick 0 or 1 first.",
      },
      error: {
        betRequired: "Enter a bet amount.",
        betInteger: "Bet must be a whole number (no decimals).",
        betMin: "Minimum bet is $1.",
        betTooHigh: "You can't bet more than your balance.",
        pickRequired: "Pick 0 or 1.",
      },
      modeDesc: {
        friendly: "Feels fair. Slightly tilted.",
        normal: "Looks fair. Quietly tilted.",
        brutal: "Fast lesson.",
      },
      end: {
        title: "It felt like 50/50. It wasn't.",
        subtitle: "The machine had an edge the whole time.",
        statTitle: "Your run",
        roundsPlayed: "Rounds played",
        wins: "Wins",
        losses: "Losses",
        maxBalance: "Highest balance",
        finalBalance: "Final balance",
        actualMode: "Mode",
        hiddenWinRate: "Your real win rate",
        observedWinRate: "Your observed win rate",
        expectedValue: "Expected value (per $1 bet)",
        explain1:
          "A tiny disadvantage is enough. If you keep playing, the machine only needs time.",
        explain2:
          "This is why online gambling is a joke: the game is designed to outlast you.",
        note: "You can win sometimes and still be expected to lose overall.",
      },
    },
    id: {
      t: {
        title: "Bisa Ngalahin Mesin?",
        subtitle: "Pilih 0 atau 1. Pasang taruhan. Coba kembangin $10.",
        disclaimerMini: "Ini cuma permainan. Rahasianya kebuka di akhir.",
      },
      ui: {
        language: "Bahasa",
        mode: "Mode",
        modeFriendly: "Ramah",
        modeNormal: "Normal",
        modeBrutal: "Brutal",
        winRate: "Peluang menang",
        balance: "Saldo",
        bet: "Taruhan kamu",
        pick: "Pilih satu",
        head: "Kepala",
        tail: "Ekor",
        play: "Mainkan ronde",
        cashOut: "Berhenti",
        reset: "Reset",
        again: "Main lagi",
        chartTitle: "Saldo kamu dari waktu ke waktu",
        historyTitle: "Ronde terakhir",
        round: "Ronde",
        result: "Hasil",
        youPicked: "Kamu pilih",
        machineShowed: "Mesin keluarin",
        win: "Kamu menang",
        lose: "Kamu kalah",
      },
      hint: {
        betRules: "Harus angka bulat. Minimal $1.",
        betMax: "Taruhan maksimal = saldo kamu.",
        chooseFirst: "Pilih 0 atau 1 dulu.",
      },
      error: {
        betRequired: "Masukkan jumlah taruhan.",
        betInteger: "Taruhan harus angka bulat (tanpa desimal).",
        betMin: "Taruhan minimal $1.",
        betTooHigh: "Taruhan tidak boleh lebih dari saldo.",
        pickRequired: "Pilih 0 atau 1.",
      },
      modeDesc: {
        friendly: "Terasa adil. Sedikit miring.",
        normal: "Kelihatan adil. Diam-diam miring.",
        brutal: "Pelajaran cepat.",
      },
      end: {
        title: "Kelihatannya kayak 50/50. Tapi enggak.",
        subtitle: "Dari awal, mesin punya keunggulan.",
        statTitle: "Hasil permainan kamu",
        roundsPlayed: "Jumlah ronde",
        wins: "Menang",
        losses: "Kalah",
        maxBalance: "Saldo tertinggi",
        finalBalance: "Saldo akhir",
        actualMode: "Mode",
        hiddenWinRate: "Peluang menang sebenarnya",
        observedWinRate: "Peluang menang yang kejadian",
        expectedValue: "Nilai harapan (per taruhan $1)",
        explain1:
          "Rugi sedikit aja udah cukup. Kalau kamu terus main, mesin cuma butuh waktu.",
        explain2:
          "Makanya judi online itu lelucon: gamenya didesain buat ngalahin kamu pelan-pelan.",
        note: "Kamu bisa menang beberapa kali, tapi tetap 'diarahin' buat kalah.",
      },
    },
  };

  const els = {
    mode: document.querySelector("#mode"),
    modeDesc: document.querySelector("#mode-desc"),
    bet: document.querySelector("#bet"),
    balance: document.querySelector("#balance"),
    cashOut: document.querySelector("#cash-out"),
    again: document.querySelector("#again"),
    pick0: document.querySelector("#pick-0"),
    pick1: document.querySelector("#pick-1"),
    error: document.querySelector("#error"),
    result: document.querySelector("#result"),
    resultTitle: document.querySelector("#result-title"),
    resultDetail: document.querySelector("#result-detail"),
    roundDetail: document.querySelector("#round-detail"),
    history: document.querySelector("#history"),
    metaRow: document.querySelector("#meta-row"),
    chartCard: document.querySelector("#chart-card"),
    historyCard: document.querySelector("#history-card"),
    end: document.querySelector("#end"),
    statRounds: document.querySelector("#stat-rounds"),
    statWins: document.querySelector("#stat-wins"),
    statLosses: document.querySelector("#stat-losses"),
    statMax: document.querySelector("#stat-max"),
    statFinal: document.querySelector("#stat-final"),
    statHiddenWin: document.querySelector("#stat-hidden-win"),
    statObservedWin: document.querySelector("#stat-observed-win"),
    statEv: document.querySelector("#stat-ev"),
    winrate: document.querySelector("#winrate"),
    canvas: document.querySelector("#balance-chart"),
    langButtons: Array.from(document.querySelectorAll("[data-lang]")),
  };

  if (!els.mode || !els.bet || !els.canvas) return;

  const state = {
    lang: "en",
    mode: "normal",
    choice: null,
    balance: START_BALANCE,
    round: 0,
    maxBalance: START_BALANCE,
    wins: 0,
    losses: 0,
    ended: false,
    history: [],
  };

  function getLangDefault() {
    const saved = localStorage.getItem("toy-lang");
    if (saved === "en" || saved === "id") return saved;
    const nav = (navigator.language || "").toLowerCase();
    if (nav.startsWith("id")) return "id";
    return "en";
  }

  function t(key) {
    const dict = I18N[state.lang] || I18N.en;
    const parts = key.split(".");
    let cur = dict;
    for (const part of parts) {
      if (!cur || typeof cur !== "object") return key;
      cur = cur[part];
    }
    return typeof cur === "string" ? cur : key;
  }

  function setError(msgKey) {
    els.error.textContent = msgKey ? t(msgKey) : "";
  }

  function formatMoney(n) {
    return `$${n}`;
  }

  function formatPercent(x) {
    return `${Math.round(x * 100)}%`;
  }

  function labelForChoice(n) {
    return n === 0 ? t("ui.head") : t("ui.tail");
  }

  function formatEv(x) {
    const s = x >= 0 ? `+${x.toFixed(2)}` : x.toFixed(2);
    return s;
  }

  function applyTranslations() {
    document.documentElement.lang = state.lang;
    for (const el of document.querySelectorAll("[data-i18n]")) {
      const key = el.getAttribute("data-i18n");
      if (!key) continue;
      el.textContent = t(key);
    }
    els.modeDesc.textContent = t(MODES[state.mode].descKey);
    for (const btn of els.langButtons) {
      btn.classList.toggle("is-selected", btn.getAttribute("data-lang") === state.lang);
    }
  }

  function setLanguage(lang) {
    if (lang !== "en" && lang !== "id") return;
    state.lang = lang;
    localStorage.setItem("toy-lang", lang);
    applyTranslations();
    render();
  }

  function setChoice(n) {
    state.choice = n;
    els.pick0.classList.toggle("is-selected", n === 0);
    els.pick1.classList.toggle("is-selected", n === 1);
  }

  function getPWin() {
    return MODES[state.mode].pWin;
  }

  function validateBet(raw) {
    if (raw === "" || raw == null) return { ok: false, errKey: "error.betRequired" };
    const n = Number(raw);
    if (!Number.isFinite(n)) return { ok: false, errKey: "error.betRequired" };
    if (!Number.isInteger(n)) return { ok: false, errKey: "error.betInteger" };
    if (n < 1) return { ok: false, errKey: "error.betMin" };
    if (n > state.balance) return { ok: false, errKey: "error.betTooHigh" };
    return { ok: true, value: n };
  }

  function playRound() {
    if (state.ended) return;
    setError("");

    if (state.choice !== 0 && state.choice !== 1) {
      setError("error.pickRequired");
      return;
    }

    const betCheck = validateBet(els.bet.value);
    if (!betCheck.ok) {
      setError(betCheck.errKey);
      return;
    }

    const bet = betCheck.value;
    const pWin = getPWin();
    const didWin = Math.random() < pWin;
    const result = didWin ? state.choice : 1 - state.choice;
    const delta = didWin ? bet : -bet;
    const balanceAfter = state.balance + delta;

    state.round += 1;
    state.balance = balanceAfter;
    state.maxBalance = Math.max(state.maxBalance, state.balance);
    if (didWin) state.wins += 1;
    else state.losses += 1;

    state.history.push({
      round: state.round,
      bet,
      choice: state.choice,
      result,
      didWin,
      delta,
      balanceAfter,
    });

    if (state.balance <= 0) {
      state.balance = 0;
      state.ended = true;
      showEnd();
    }

    render();
  }

  function resetGame(nextMode) {
    state.choice = null;
    state.balance = START_BALANCE;
    state.round = 0;
    state.maxBalance = START_BALANCE;
    state.wins = 0;
    state.losses = 0;
    state.ended = false;
    state.history = [];
    if (nextMode) state.mode = nextMode;
    els.mode.value = state.mode;
    els.bet.value = "";
    els.end.hidden = true;
    els.resultTitle.textContent = "";
    els.resultDetail.textContent = "";
    els.roundDetail.textContent = "";
    setError("");
    applyTranslations();
    render();
  }

  function showEnd() {
    const rounds = state.round;
    const wins = state.wins;
    const losses = state.losses;
    const pWin = getPWin();
    const observed = rounds > 0 ? wins / rounds : 0;
    const ev = 2 * pWin - 1;

    els.statRounds.textContent = `${rounds}`;
    els.statWins.textContent = `${wins}`;
    els.statLosses.textContent = `${losses}`;
    els.statMax.textContent = formatMoney(state.maxBalance);
    els.statFinal.textContent = formatMoney(state.balance);
    els.statHiddenWin.textContent = formatPercent(pWin);
    els.statObservedWin.textContent = formatPercent(observed);
    els.statEv.textContent = formatEv(ev);

    els.end.hidden = false;
  }

  function renderResult() {
    const last = state.history[state.history.length - 1];
    if (!last) return;

    els.resultTitle.textContent = t(last.didWin ? "ui.win" : "ui.lose");
    els.resultDetail.textContent = `${t("ui.youPicked")} ${labelForChoice(last.choice)} · ${t("ui.machineShowed")} ${labelForChoice(last.result)}`;
    els.roundDetail.textContent = `${t("ui.round")} ${last.round}`;
  }

  function renderHistory() {
    const rows = state.history.slice(-10).reverse();
    els.history.innerHTML = rows
      .map((r) => {
        const cls = r.didWin ? "is-win" : "is-lose";
        return `<tr>
          <td data-label="${t("ui.round")}">${r.round}</td>
          <td data-label="${t("ui.bet")}">${formatMoney(r.bet)}</td>
          <td data-label="${t("ui.youPicked")}">${labelForChoice(r.choice)}</td>
          <td data-label="${t("ui.result")}" class="${cls}">${labelForChoice(r.result)} · ${t(r.didWin ? "ui.win" : "ui.lose")}</td>
          <td data-label="${t("ui.balance")}">${formatMoney(r.balanceAfter)}</td>
        </tr>`;
      })
      .join("");
  }

  function drawChart() {
    const canvas = els.canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, width, height);

    const series = [{ round: 0, balance: START_BALANCE, didWin: null }].concat(
      state.history.map((h) => ({ round: h.round, balance: h.balanceAfter, didWin: h.didWin })),
    );

    const padX = 18;
    const padY = 18;
    const plotW = Math.max(1, width - padX * 2);
    const plotH = Math.max(1, height - padY * 2);

    const balances = series.map((p) => p.balance);
    const yMin = 0;
    const yMax = Math.max(START_BALANCE, ...balances, 1);
    const yTop = yMax + 1;

    function xAt(i) {
      if (series.length === 1) return padX + plotW / 2;
      return padX + (plotW * i) / (series.length - 1);
    }

    function yAt(balance) {
      const t = (balance - yMin) / (yTop - yMin);
      return padY + plotH - t * plotH;
    }

    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX, padY + plotH);
    ctx.lineTo(padX + plotW, padY + plotH);
    ctx.stroke();

    ctx.strokeStyle = "rgba(0, 0, 0, 0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < series.length; i += 1) {
      const p = series[i];
      const x = xAt(i);
      const y = yAt(p.balance);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    for (let i = 0; i < series.length; i += 1) {
      const p = series[i];
      const x = xAt(i);
      const y = yAt(p.balance);
      let fill = "rgba(0,0,0,0.5)";
      if (p.didWin === true) fill = "#0b6e2b";
      if (p.didWin === false) fill = "#b00020";
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function render() {
    const hasRounds = state.round > 0;

    els.balance.textContent = formatMoney(state.balance);
    els.modeDesc.textContent = t(MODES[state.mode].descKey);

    els.cashOut.disabled = state.ended || state.round === 0;
    els.bet.disabled = state.ended;
    els.pick0.disabled = state.ended;
    els.pick1.disabled = state.ended;
    els.mode.disabled = state.ended || state.round > 0;

    if (els.metaRow) els.metaRow.hidden = !state.ended;
    if (els.winrate) els.winrate.textContent = state.ended ? formatPercent(getPWin()) : "??%";
    if (els.result) els.result.hidden = !hasRounds;
    if (els.chartCard) els.chartCard.hidden = !hasRounds;
    if (els.historyCard) els.historyCard.hidden = !hasRounds;

    if (hasRounds) renderResult();
    renderHistory();
    if (hasRounds) drawChart();
  }

  els.pick0.addEventListener("click", () => {
    setChoice(0);
    playRound();
  });
  els.pick1.addEventListener("click", () => {
    setChoice(1);
    playRound();
  });

  els.cashOut.addEventListener("click", () => {
    if (state.ended) return;
    state.ended = true;
    showEnd();
    render();
  });

  els.again.addEventListener("click", () => resetGame(state.mode));

  els.mode.addEventListener("change", () => {
    const v = els.mode.value;
    if (!MODES[v]) return;
    resetGame(v);
  });

  els.bet.addEventListener("blur", () => {
    const raw = els.bet.value;
    if (raw === "") return;
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    els.bet.value = `${Math.max(1, Math.floor(n))}`;
  });

  for (const btn of els.langButtons) {
    btn.addEventListener("click", () => setLanguage(btn.getAttribute("data-lang")));
  }

  window.addEventListener("resize", () => {
    if (state.round > 0) drawChart();
  });

  state.lang = getLangDefault();
  applyTranslations();
  resetGame("normal");
})();
