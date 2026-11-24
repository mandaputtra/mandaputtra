(function () {
  "use strict";

  const KEY_PROGRESS = "lm:progress:v1";
  const KEY_LANG = "lm:lang:v1";

  const LM_TEXT = {
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
      home: {
        lessons: {
          title: "Enam pelajaran",
        },
      },
      lesson: {
        beats: {
          title: "Ketukan",
          crumb: "Ketukan",
          listName: "Ketukan dan Pola Drum",
          step1: {
            heading: "Langkah 1 — Satu ketukan",
            say: "Bar dimulai dari hitungan pertama. Kick di ketukan satu sudah cukup untuk merasakan denyutnya.",
            try: "Ketuk sel kick di kolom pertama, lalu tekan Putar.",
          },
          step2: {
            heading: "Langkah 2 — Ketukan dua dan empat",
            say: "Snare di ketukan dua dan empat menjawab kick. Ketukan ganjil terasa ringan, ketukan genap terasa mantap.",
            try: "Ketuk sel snare di kolom kedua dan keempat, lalu bandingkan dengan kick.",
          },
          step3: {
            heading: "Langkah 3 — Hitungan per delapan",
            say: "Hi-hat membagi setiap ketukan menjadi dua. Pola jadi lebih rapat tanpa menambah ketukan baru.",
            try: "Nyalakan hi-hat di semua kolom, lalu dengarkan alurnya.",
          },
          step4: {
            heading: "Langkah 4 — Ketukan hantu",
            say: "Ketukan hantu mengisi sela dengan pelan. Pola terasa hidup tanpa menutup ketukan utama.",
            try: "Matikan satu sel hi-hat di kolom keempat supaya muncul sela.",
          },
        },
        "notes-scales": {
          title: "Nada dan Tangga Nada",
          crumb: "Nada",
          listName: "Nada dan Tangga Nada",
          step1: {
            heading: "Langkah 1 — Satu nada",
            say: "Mulai dari satu nada C. Nada ini jadi rumah sebelum kita melangkah.",
            try: "Ketuk tuts paling kanan, lalu dengarkan nadanya.",
          },
          step2: {
            heading: "Langkah 2 — Empat nada pertama",
            say: "C, D, E, dan F membentuk awal tangga nada. Jarak antarnada terasa makin akrab.",
            try: "Ketuk tuts yang menyala satu per satu dari kanan ke kiri.",
          },
          step3: {
            heading: "Langkah 3 — Tujuh nada",
            say: "Tambahkan G, A, dan B. Tujuh nada kini mengisi hampir seluruh tuts.",
            try: "Ketik tuts berikutnya sampai tinggal satu ruang kosong.",
          },
          step4: {
            heading: "Langkah 4 — Tangga nada penuh",
            say: "Satu nada terakhir menutup tangga nada. Delapan nada lengkap dari C ke C.",
            try: "Isi ruang kosong dengan B, lalu mainkan dari bawah ke atas.",
          },
        },
        chords: {
          title: "Akord",
          crumb: "Akord",
          listName: "Akord dan Progresi",
          step1: {
            heading: "Langkah 1 — Empat akord",
            say: "Setiap bar punya satu akord: Am, F, C, dan G. Urutan ini mengalir dan kembali ke awal.",
            try: "Tekan Putar dan ikuti akord yang berganti tiap bar.",
          },
          step2: {
            heading: "Langkah 2 — Dua akord",
            say: "Dua akord cukup untuk satu putaran. Am dan C bergantian dengan tenang.",
            try: "Ketuk pad di bar kedua untuk memutar akordnya.",
          },
          step3: {
            heading: "Langkah 3 — Tiga akord",
            say: "Am, F, dan C memberi gerak yang lebih jauh tanpa kehilangan arah.",
            try: "Ketuk pad untuk mengganti akord di setiap bar.",
          },
          step4: {
            heading: "Langkah 4 — Kembali ke G",
            say: "Akord G menutup putaran dan menarik kembali ke Am.",
            try: "Ubah akord bar keempat menjadi G, lalu mainkan seluruh progresi.",
          },
        },
        basslines: {
          title: "Garis Bass",
          crumb: "Bass",
          listName: "Garis Bass",
          step1: {
            heading: "Langkah 1 — Nada dasar",
            say: "Bass memulai dari nada dasar akord. Satu nada panjang sudah menopang seluruh bar.",
            try: "Ketuk sel pertama sampai bertuliskan Dasar, lalu tekan Putar.",
          },
          step2: {
            heading: "Langkah 2 — Dua ketukan",
            say: "Nada dasar di ketukan satu dan tiga membuat langkah terasa mantap.",
            try: "Nyalakan dua sel bergantian dan rasakan ayunannya.",
          },
          step3: {
            heading: "Langkah 3 — Tambah nada kelima",
            say: "Nada kelima membuka ruang di antara nada dasar. Garis bass jadi bercabang.",
            try: "Ubah sel ketiga menjadi Kelima dan dengarkan geraknya.",
          },
          step4: {
            heading: "Langkah 4 — Naik satu oktaf",
            say: "Nada oktaf memberi puncak kecil sebelum kembali ke nada dasar.",
            try: "Susun pola sampai sel ketiga berisi Oktaf, lalu mainkan.",
          },
        },
        melodies: {
          title: "Melodi",
          crumb: "Melodi",
          listName: "Melodi",
          step1: {
            heading: "Langkah 1 — Frase pendek",
            say: "Lima nada bergerak dan berhenti di ujung bar. Slot terakhir menunggu diisi.",
            try: "Ketuk tuts untuk menambah nada, lalu tekan Putar.",
          },
          step2: {
            heading: "Langkah 2 — Ulang dan ubah",
            say: "Frase yang sama kembali dengan satu nada berbeda. Pengulangan membuat melodi mudah diingat.",
            try: "Isi slot kosong di tengah dan bandingkan dengan bar sebelumnya.",
          },
          step3: {
            heading: "Langkah 3 — Turun bertahap",
            say: "Melodi turun dari G ke C. Arah menurun memberi rasa tenang.",
            try: "Mainkan seluruh frase dan perhatikan arah nadanya.",
          },
          step4: {
            heading: "Langkah 4 — Lengkapi frase",
            say: "Satu slot kosong menahan frase. Mengisinya membuat melodi utuh.",
            try: "Isi slot kosong, lalu dengarkan frase dari awal sampai akhir.",
          },
        },
        "song-structure": {
          title: "Struktur Lagu",
          crumb: "Struktur",
          listName: "Struktur Lagu",
          step1: {
            heading: "Langkah 1 — Satu blok",
            say: "Blok A berisi drum, bass, dan akord. Empat bar yang sama membentuk bagian pertama.",
            try: "Tekan Putar dan dengarkan lapisan yang menyala.",
          },
          step2: {
            heading: "Langkah 2 — Blok B",
            say: "Blok B membawa variasi, dan melodi ikut menyala. Dua blok sudah cukup untuk satu bagian dan jawabannya.",
            try: "Ubah dua blok terakhir menjadi B, lalu mainkan.",
          },
          step3: {
            heading: "Langkah 3 — Berselang-seling",
            say: "A dan B bergantian tiap dua bar. Pergantian menjaga lagu tetap segar.",
            try: "Susun urutan A, B, A, B dan dengarkan perpindahannya.",
          },
          step4: {
            heading: "Langkah 4 — Urutan akhir",
            say: "Empat blok berbeda menutup lagu. Urutan menentukan arah dari awal sampai akhir.",
            try: "Geser blok sampai urutannya B, A, C, D, lalu mainkan.",
          },
        },
      },
      toy: {
        lane: {
          kick: "Kick",
          snare: "Snare",
          hat: "Hi-hat",
        },
        beat: "Ketukan",
        value: {
          off: "Mati",
          root: "Dasar",
          fifth: "Kelima",
          octave: "Oktaf",
        },
        layer: {
          drums: "Drum",
          bass: "Bass",
          chords: "Akord",
          melody: "Melodi",
        },
        group: {
          piano: "Piano",
          chords: "Pad akord",
          arrange: "Susun blok",
        },
      },
      ui: {
        play: "Putar",
        stop: "Berhenti",
        mute: "Bisukan",
        next: "Lanjut",
        back: "Kembali",
        move: {
          earlier: "Geser ke kiri",
          later: "Geser ke kanan",
        },
        done: "Selesai",
        star: "Bintang",
        cta: {
          song: "Buka lagu penuh",
        },
        silent: "Tidak ada suara",
        credit: {
          audio: "Suara oleh Tone.js",
          bird: "Ilustrasi burung: domain publik",
        },
      },
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
      home: {
        lessons: {
          title: "Six lessons",
        },
      },
      lesson: {
        beats: {
          title: "Beats",
          crumb: "Beats",
          listName: "Beats and Drum Patterns",
          step1: {
            heading: "Step 1 — One beat",
            say: "A bar starts on beat one. A single kick is enough to feel the pulse.",
            try: "Tap the kick cell in the first column, then press Play.",
          },
          step2: {
            heading: "Step 2 — Beats two and four",
            say: "A snare on beats two and four answers the kick. Odd beats feel light, even beats feel solid.",
            try: "Tap the snare cell in the second and fourth columns, then compare it with the kick.",
          },
          step3: {
            heading: "Step 3 — Eighth-note motion",
            say: "The hi-hat splits each beat in two. The pattern gets busier without adding new beats.",
            try: "Turn on the hi-hat in every column and follow the flow.",
          },
          step4: {
            heading: "Step 4 — Ghost notes",
            say: "Ghost notes fill the gaps quietly. The pattern comes alive without covering the main beats.",
            try: "Turn off one hi-hat cell in the fourth column to open a gap.",
          },
        },
        "notes-scales": {
          title: "Notes and Scales",
          crumb: "Notes",
          listName: "Notes and Scales",
          step1: {
            heading: "Step 1 — One note",
            say: "Start on a single C. This note is home before we take a step.",
            try: "Tap the rightmost key and listen to the note.",
          },
          step2: {
            heading: "Step 2 — The first four notes",
            say: "C, D, E, and F open the scale. The gaps between notes start to feel familiar.",
            try: "Tap the lit keys one by one from right to left.",
          },
          step3: {
            heading: "Step 3 — Seven notes",
            say: "Add G, A, and B. Seven notes now fill nearly every key.",
            try: "Type the next keys until one space is left.",
          },
          step4: {
            heading: "Step 4 — The whole scale",
            say: "One last note closes the scale. Eight notes from C to C.",
            try: "Fill the empty space with B, then play from bottom to top.",
          },
        },
        chords: {
          title: "Chords",
          crumb: "Chords",
          listName: "Chords and Progressions",
          step1: {
            heading: "Step 1 — Four chords",
            say: "Each bar holds one chord: Am, F, C, and G. The order flows and returns to the start.",
            try: "Press Play and follow the chord that changes each bar.",
          },
          step2: {
            heading: "Step 2 — Two chords",
            say: "Two chords can carry a loop. Am and C take turns calmly.",
            try: "Tap the pads in the second bar to cycle their chords.",
          },
          step3: {
            heading: "Step 3 — Three chords",
            say: "Am, F, and C travel further without losing the way home.",
            try: "Tap a pad to change the chord in each bar.",
          },
          step4: {
            heading: "Step 4 — Back to G",
            say: "The G chord closes the loop and pulls back to Am.",
            try: "Set the fourth bar to G, then play the whole progression.",
          },
        },
        basslines: {
          title: "Basslines",
          crumb: "Bass",
          listName: "Basslines",
          step1: {
            heading: "Step 1 — The root",
            say: "The bass starts on the root of the chord. One long note already holds up the bar.",
            try: "Tap the first cell until it shows Root, then press Play.",
          },
          step2: {
            heading: "Step 2 — Two beats",
            say: "The root on beats one and three gives the line a steady stride.",
            try: "Turn on two cells in turn and feel the swing.",
          },
          step3: {
            heading: "Step 3 — Add the fifth",
            say: "The fifth opens space between the roots. The bass line starts to branch.",
            try: "Change the third cell to Fifth and listen to the motion.",
          },
          step4: {
            heading: "Step 4 — Up an octave",
            say: "The octave lifts the line before it settles back on the root.",
            try: "Build the pattern until the third cell reads Octave, then play it.",
          },
        },
        melodies: {
          title: "Melodies",
          crumb: "Melody",
          listName: "Melodies",
          step1: {
            heading: "Step 1 — A short phrase",
            say: "Five notes move and rest at the end of the bar. The last slot waits to be filled.",
            try: "Tap the keys to add notes, then press Play.",
          },
          step2: {
            heading: "Step 2 — Repeat and change",
            say: "The same phrase returns with one note changed. Repetition makes a melody easy to remember.",
            try: "Fill the empty slot in the middle and compare it with the bar before.",
          },
          step3: {
            heading: "Step 3 — Stepping down",
            say: "The melody walks down from G to C. A falling line brings calm.",
            try: "Play the whole phrase and follow the direction of the notes.",
          },
          step4: {
            heading: "Step 4 — Complete the phrase",
            say: "One empty slot holds the phrase back. Filling it makes the melody whole.",
            try: "Fill the empty slot, then listen to the phrase from start to end.",
          },
        },
        "song-structure": {
          title: "Song Structure",
          crumb: "Structure",
          listName: "Song Structure",
          step1: {
            heading: "Step 1 — One block",
            say: "Block A carries drums, bass, and chords. Four identical bars make the first section.",
            try: "Press Play and listen to the layers that light up.",
          },
          step2: {
            heading: "Step 2 — Block B",
            say: "Block B brings a variation, and the melody joins in. Two blocks are enough for a section and its answer.",
            try: "Change the last two blocks to B, then play.",
          },
          step3: {
            heading: "Step 3 — Alternating",
            say: "A and B take turns every two bars. The switch keeps the song fresh.",
            try: "Arrange the order A, B, A, B and listen for the change.",
          },
          step4: {
            heading: "Step 4 — The final order",
            say: "Four different blocks close the song. The order sets the way from start to end.",
            try: "Move the blocks until the order reads B, A, C, D, then play.",
          },
        },
      },
      toy: {
        lane: {
          kick: "Kick",
          snare: "Snare",
          hat: "Hi-hat",
        },
        beat: "Beat",
        value: {
          off: "Off",
          root: "Root",
          fifth: "Fifth",
          octave: "Octave",
        },
        layer: {
          drums: "Drums",
          bass: "Bass",
          chords: "Chords",
          melody: "Melody",
        },
        group: {
          piano: "Piano",
          chords: "Chord pads",
          arrange: "Arrange blocks",
        },
      },
      ui: {
        play: "Play",
        stop: "Stop",
        mute: "Mute",
        next: "Next",
        back: "Back",
        move: {
          earlier: "Move earlier",
          later: "Move later",
        },
        done: "Done",
        star: "Star",
        cta: {
          song: "Open the full song",
        },
        silent: "No sound",
        credit: {
          audio: "Audio by Tone.js",
          bird: "Bird illustration: public domain",
        },
      },
    },
  };

  function normalizeLang(raw) {
    return raw === "en" ? "en" : "id";
  }

  function own(node, name) {
    return Object.prototype.hasOwnProperty.call(node, name);
  }

  function leaf(table, key) {
    const parts = String(key).split(".");
    let node = table;
    for (let i = 0; i < parts.length; i++) {
      if (node === null || typeof node !== "object" || !own(node, parts[i])) return undefined;
      node = node[parts[i]];
    }
    return typeof node === "string" && node !== "" ? node : undefined;
  }

  function t(lang, key) {
    const table = LM_TEXT[normalizeLang(lang)];
    if (!table || typeof key !== "string" || key === "") return undefined;
    const nested = leaf(table, key);
    if (nested !== undefined) return nested;
    return own(table, key) && typeof table[key] === "string" && table[key] !== ""
      ? table[key]
      : undefined;
  }

  const langListeners = new Set();

  function langButtons() {
    return document.querySelectorAll("button[data-lang]");
  }

  function apply(root, lang) {
    const scope = root || document;
    const value = normalizeLang(lang);
    const nodes = scope.querySelectorAll("[data-i18n]");
    for (let i = 0; i < nodes.length; i++) {
      const text = t(value, nodes[i].getAttribute("data-i18n"));
      if (text !== undefined) nodes[i].textContent = text;
    }
    const labeled = scope.querySelectorAll("[data-i18n-aria-label]");
    for (let i = 0; i < labeled.length; i++) {
      const text = t(value, labeled[i].getAttribute("data-i18n-aria-label"));
      if (text !== undefined) labeled[i].setAttribute("aria-label", text);
    }
    const titles = scope.querySelectorAll("[data-i18n-title]");
    if (titles.length === 1) {
      const text = t(value, titles[0].getAttribute("data-i18n-title"));
      if (text !== undefined) document.title = text;
    }
    document.documentElement.setAttribute("lang", value);
    if (document.body) document.body.setAttribute("data-lang", value);
    const buttons = langButtons();
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute("aria-pressed", String(buttons[i].getAttribute("data-lang") === value));
    }
  }

  const lang = {
    current() {
      try {
        return normalizeLang(window.localStorage.getItem(KEY_LANG));
      } catch {
        return "id";
      }
    },
    set(next) {
      const value = normalizeLang(next);
      apply(document, value);
      try {
        window.localStorage.setItem(KEY_LANG, value);
      } catch {
        void 0;
      }
      langListeners.forEach(function (fn) {
        fn(value);
      });
      return value;
    },
    onChange(fn) {
      if (typeof fn !== "function") return function () {};
      langListeners.add(fn);
      return function () {
        langListeners.delete(fn);
      };
    },
  };

  Object.assign(window.LM || (window.LM = {}), { text: LM_TEXT, t: t, i18n: { apply: apply }, lang: lang });

  function emptyProgress() {
    return { v: 1, lessons: {} };
  }

  function decodeProgress(raw) {
    try {
      const record = emptyProgress();
      if (typeof raw !== "string" || raw === "") return record;
      const parsed = JSON.parse(raw);
      if (parsed === null || typeof parsed !== "object" || parsed.v !== 1) return record;
      const lessons = parsed.lessons;
      if (lessons === null || typeof lessons !== "object" || Array.isArray(lessons)) return record;
      const ids = Object.keys(lessons);
      for (let i = 0; i < ids.length; i++) {
        const entry = lessons[ids[i]];
        if (entry === null || typeof entry !== "object" || entry.finished !== true) return emptyProgress();
        if (typeof entry.at !== "number" || !isFinite(entry.at)) return emptyProgress();
        const copy = { finished: true };
        if (entry.starred === true) copy.starred = true;
        copy.at = entry.at;
        record.lessons[ids[i]] = copy;
      }
      return record;
    } catch {
      return emptyProgress();
    }
  }

  function mergeProgress(storage, memory) {
    const merged = emptyProgress();
    const ids = Object.keys(storage.lessons).concat(Object.keys(memory.lessons));
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      if (Object.prototype.hasOwnProperty.call(merged.lessons, id)) continue;
      const stored = storage.lessons[id];
      const held = memory.lessons[id];
      const finished = (stored && stored.finished === true) || (held && held.finished === true);
      const starred = (stored && stored.starred === true) || (held && held.starred === true);
      const at = held && held.at !== undefined ? held.at : stored ? stored.at : undefined;
      const entry = { finished: finished === true };
      if (starred) entry.starred = true;
      if (at !== undefined) entry.at = at;
      merged.lessons[id] = entry;
    }
    return merged;
  }

  function cloneProgress(record) {
    const copy = emptyProgress();
    const ids = Object.keys(record.lessons);
    for (let i = 0; i < ids.length; i++) {
      const entry = record.lessons[ids[i]];
      const held = { finished: entry.finished === true };
      if (entry.starred === true) held.starred = true;
      if (entry.at !== undefined) held.at = entry.at;
      copy.lessons[ids[i]] = held;
    }
    return copy;
  }

  let memory = emptyProgress();
  let writable = true;
  const progressListeners = new Set();
  let storageBound = false;

  function safeGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function read() {
    memory = mergeProgress(decodeProgress(safeGet(KEY_PROGRESS)), memory);
    const source = !writable ? "memory" : Object.keys(memory.lessons).length ? "storage" : "empty";
    return { record: cloneProgress(memory), writable: writable, source: source };
  }

  function persist() {
    if (!writable) return;
    try {
      window.localStorage.setItem(KEY_PROGRESS, JSON.stringify(memory));
    } catch {
      writable = false;
    }
  }

  function notifyProgress(record) {
    progressListeners.forEach(function (fn) {
      fn(record);
    });
  }

  function markFinished(slug) {
    const current = read();
    const existing = memory.lessons[slug];
    if (existing && existing.finished === true) return { changed: false, progress: current };
    const entry = { finished: true };
    if (existing && existing.starred === true) entry.starred = true;
    entry.at = existing && existing.at !== undefined ? existing.at : Date.now();
    memory.lessons[slug] = entry;
    persist();
    notifyProgress(cloneProgress(memory));
    return { changed: true, progress: read() };
  }

  function setStarred(slug) {
    const current = read();
    const existing = memory.lessons[slug];
    if (!existing || existing.finished !== true) return null;
    if (existing.starred === true) return { changed: false, progress: current };
    const entry = { finished: true, starred: true };
    if (existing.at !== undefined) entry.at = existing.at;
    memory.lessons[slug] = entry;
    persist();
    notifyProgress(cloneProgress(memory));
    return { changed: true, progress: read() };
  }

  function bindStorage() {
    if (storageBound || typeof window.addEventListener !== "function") return;
    storageBound = true;
    window.addEventListener("storage", function (event) {
      if (event.key !== null && event.key !== KEY_PROGRESS) return;
      try {
        const area = window.localStorage;
        if (event.storageArea && area && event.storageArea !== area) return;
      } catch {
        void 0;
      }
      read();
      notifyProgress(cloneProgress(memory));
    });
  }

  Object.assign(window.LM, {
    progress: {
      get: read,
      markFinished: markFinished,
      setStarred: setStarred,
      onChange(fn) {
        if (typeof fn !== "function") return function () {};
        progressListeners.add(fn);
        return function () {
          progressListeners.delete(fn);
        };
      },
    },
  });

  bindStorage();

  function registerWorker() {
    if (!("serviceWorker" in navigator)) return;
    const secure = window.location.protocol === "https:" || window.location.hostname === "127.0.0.1";
    if (!secure) return;
    try {
      navigator.serviceWorker.register("/sw.js").catch(function () {
        void 0;
      });
    } catch {
      void 0;
    }
  }

  window.addEventListener("load", registerWorker);
})();
