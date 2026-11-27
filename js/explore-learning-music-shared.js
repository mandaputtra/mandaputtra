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
          crumb: "Buat Lagu",
          listName: "Ketukan dan Pola Drum",
          step1: {
            heading: "Langkah 1: Satu ketukan",
            say: "Satu bar punya 16 kotak. Setiap empat kotak adalah satu ketukan, jadi ketukan jatuh di kotak 1, 5, 9, dan 13.",
            try: "Ketuk kotak kick di 5, 9, dan 13, lalu ketuk tombol putar.",
          },
          step2: {
            heading: "Langkah 2: Ketukan dua dan empat",
            say: "Clap di ketukan dua dan empat menjawab kick. Ketukan ganjil terasa ringan, ketukan genap terasa mantap.",
            try: "Pindahkan clap ke kotak lain, lalu dengarkan bedanya.",
          },
          step3: {
            heading: "Langkah 3: Hitungan per delapan",
            say: "Closed hat membagi setiap ketukan menjadi dua. Pola jadi lebih rapat tanpa menambah ketukan baru.",
            try: "Geser tempo lebih cepat atau lebih lambat, lalu dengarkan polanya.",
          },
          step4: {
            heading: "Langkah 4: Open hat",
            say: "Open hat berbunyi lebih panjang. Satu open hat di akhir bar mengantar pola kembali ke awal.",
            try: "Nyalakan open hat di kotak 15 dan matikan closed hat di kotak yang sama.",
          },
        },
        "notes-scales": {
          title: "Nada dan Tangga Nada",
          crumb: "Buat Lagu",
          listName: "Nada dan Tangga Nada",
          step1: {
            heading: "Langkah 1: Satu nada",
            say: "Mulai dari satu nada C. Nada ini jadi rumah sebelum kita melangkah. Baris atas berbunyi tinggi, baris bawah berbunyi rendah.",
            try: "Ketuk kotak C4 di kolom lain, lalu ketuk tombol putar.",
          },
          step2: {
            heading: "Langkah 2: Empat nada pertama",
            say: "C, D, E, dan F membentuk awal tangga nada. Setiap nada satu baris lebih tinggi dari nada sebelumnya.",
            try: "Isi kolom 5 sampai 8 dengan nada yang terus naik.",
          },
          step3: {
            heading: "Langkah 3: Tujuh nada",
            say: "Tambahkan G, A, dan B. Tujuh nada kini naik seperti anak tangga.",
            try: "Isi kolom terakhir dengan C5, lalu ketuk tombol putar.",
          },
          step4: {
            heading: "Langkah 4: Tangga nada penuh",
            say: "Satu nada lagi melengkapi tangga nada: delapan nada dari C sampai C.",
            try: "Isi kolom 7 dengan B4, lalu dengarkan nadanya naik dari C4 sampai C5.",
          },
        },
        chords: {
          title: "Akord",
          crumb: "Buat Lagu",
          listName: "Akord dan Progresi",
          step1: {
            heading: "Langkah 1: Empat akord",
            say: "Setiap bar punya satu akord: Am, F, C, dan G. Setelah G, putaran kembali ke Am.",
            try: "Ketuk tombol putar dan perhatikan kotak yang menyala di tiap bar.",
          },
          step2: {
            heading: "Langkah 2: Dua akord",
            say: "Dua akord cukup untuk satu putaran. Am main dua bar, lalu C main dua bar.",
            try: "Ketuk kotak di kolom 2 untuk mengganti akordnya.",
          },
          step3: {
            heading: "Langkah 3: Tiga akord",
            say: "F masuk di bar kedua. Tiga akord membuat putaran lebih beragam daripada dua.",
            try: "Ketuk kotak untuk memilih akord di setiap bar.",
          },
          step4: {
            heading: "Langkah 4: Tutup dengan G",
            say: "Akord G menutup putaran dan menarik kembali ke Am.",
            try: "Pilih G di kolom 4, lalu dengarkan keempat akordnya.",
          },
        },
        basslines: {
          title: "Garis Bass",
          crumb: "Buat Lagu",
          listName: "Garis Bass",
          step1: {
            heading: "Langkah 1: Nada dasar",
            say: "Bass dimulai dari nada dasar akord. Satu nada di ketukan pertama sudah menopang seluruh bar.",
            try: "Ketuk kotak Dasar di kolom lain, lalu ketuk tombol putar.",
          },
          step2: {
            heading: "Langkah 2: Dua ketukan",
            say: "Nada dasar di ketukan satu dan tiga membuat langkah terasa mantap.",
            try: "Nyalakan kotak di kolom 2 dan 4, lalu dengarkan bedanya.",
          },
          step3: {
            heading: "Langkah 3: Tambah nada kelima",
            say: "Kelima lebih tinggi dari nada dasar dan tetap cocok dengan akordnya. Dasar dan kelima bergantian membuat bass bergerak.",
            try: "Pindahkan Kelima ke kolom lain dan dengarkan geraknya.",
          },
          step4: {
            heading: "Langkah 4: Naik satu oktaf",
            say: "Nada oktaf memberi puncak kecil sebelum kembali ke nada dasar.",
            try: "Ketuk kotak Oktaf di kolom 3, lalu ketuk tombol putar.",
          },
        },
        melodies: {
          title: "Melodi",
          crumb: "Buat Lagu",
          listName: "Melodi",
          step1: {
            heading: "Langkah 1: Frase pendek",
            say: "Lima nada bergerak, lalu kolom terakhir selalu pulang ke C.",
            try: "Ketuk kotak di kolom kosong untuk menambah nada, lalu ketuk tombol putar.",
          },
          step2: {
            heading: "Langkah 2: Ulang dan ubah",
            say: "Awal frasenya sama dengan langkah 1, tapi kolom 5 dan 6 kosong. Mengulang dengan sedikit perubahan membuat melodi mudah diingat.",
            try: "Isi kolom 5 dan 6, lalu bandingkan dengan langkah 1.",
          },
          step3: {
            heading: "Langkah 3: Turun bertahap",
            say: "Melodi turun dari G ke C. Arah menurun memberi rasa tenang.",
            try: "Mainkan seluruh frase dan perhatikan arah nadanya.",
          },
          step4: {
            heading: "Langkah 4: Lengkapi frase",
            say: "Kolom 7 masih kosong, jadi frasenya terputus sebelum pulang ke C.",
            try: "Isi kolom 7 dengan C4, lalu dengarkan frasenya dari awal sampai akhir.",
          },
        },
        "song-structure": {
          title: "Struktur Lagu",
          crumb: "Buat Lagu",
          listName: "Struktur Lagu",
          step1: {
            heading: "Langkah 1: Satu blok",
            say: "Blok A berisi drum, bass, dan akord. Empat bar yang sama membentuk bagian pertama.",
            try: "Ketuk tombol putar, lalu matikan satu lapisan dan dengarkan apa yang hilang.",
          },
          step2: {
            heading: "Langkah 2: Blok B",
            say: "Blok B memakai akord F, dan melodi ikut menyala. Dua bar A lalu dua bar B terdengar seperti tanya dan jawab.",
            try: "Ganti satu B menjadi A, lalu dengarkan bedanya.",
          },
          step3: {
            heading: "Langkah 3: Berselang-seling",
            say: "A dan B bergantian setiap bar, jadi akord Am dan F terus bertukar.",
            try: "Matikan Melodi, dengarkan, lalu nyalakan lagi.",
          },
          step4: {
            heading: "Langkah 4: Urutan akhir",
            say: "Empat blok memainkan empat akord: Am, F, C, dan G. Mengubah urutan blok mengubah jalannya lagu.",
            try: "Ketuk kotak sampai urutannya B, A, C, D, lalu ketuk tombol putar.",
          },
        },
      },
      toy: {
        lane: {
          openhat: "Open Hat",
          hat: "Closed Hat",
          clap: "Clap",
          kick: "Kick",
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
          piano: "Nada",
          chords: "Akord",
          arrange: "Blok lagu",
          beats: "Pola drum",
        },
      },
      ui: {
        play: "Putar",
        stop: "Berhenti",
        mute: "Bisukan",
        clear: "Hapus",
        tempo: "Tempo",
        next: "Lanjut",
        back: "Kembali",
        done: "Selesai",
        star: "Bintang",
        cta: {
          song: "Buat lagumu sendiri",
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
          crumb: "Make a Song",
          listName: "Beats and Drum Patterns",
          step1: {
            heading: "Step 1: One beat",
            say: "A bar has 16 boxes. Every four boxes make one beat, so the beats land on boxes 1, 5, 9 and 13.",
            try: "Tap the kick boxes at 5, 9 and 13, then tap play.",
          },
          step2: {
            heading: "Step 2: Beats two and four",
            say: "A clap on beats two and four answers the kick. Odd beats feel light, even beats feel solid.",
            try: "Move a clap to another box, then listen to the difference.",
          },
          step3: {
            heading: "Step 3: Eighth-note motion",
            say: "The closed hat splits each beat in two. The pattern gets busier without adding new beats.",
            try: "Slide the tempo faster or slower and listen to the pattern.",
          },
          step4: {
            heading: "Step 4: Open hat",
            say: "The open hat rings longer. One open hat at the end of the bar leads the pattern back to the start.",
            try: "Turn on the open hat at box 15 and turn off the closed hat in the same box.",
          },
        },
        "notes-scales": {
          title: "Notes and Scales",
          crumb: "Make a Song",
          listName: "Notes and Scales",
          step1: {
            heading: "Step 1: One note",
            say: "Start on a single C. This note is home before we take a step. Higher rows sound higher.",
            try: "Tap the C4 box in another column, then tap play.",
          },
          step2: {
            heading: "Step 2: The first four notes",
            say: "C, D, E, and F open the scale. Each note sits one row above the one before.",
            try: "Fill columns 5 to 8 with notes that keep rising.",
          },
          step3: {
            heading: "Step 3: Seven notes",
            say: "Add G, A, and B. Seven notes now climb like stairs.",
            try: "Fill the last column with C5, then tap play.",
          },
          step4: {
            heading: "Step 4: The whole scale",
            say: "One more note completes the scale: eight notes from C up to C.",
            try: "Fill column 7 with B4, then hear the notes climb from C4 to C5.",
          },
        },
        chords: {
          title: "Chords",
          crumb: "Make a Song",
          listName: "Chords and Progressions",
          step1: {
            heading: "Step 1: Four chords",
            say: "Each bar holds one chord: Am, F, C, and G. After G, the loop goes back to Am.",
            try: "Tap play and watch the box light up in each bar.",
          },
          step2: {
            heading: "Step 2: Two chords",
            say: "Two chords can carry a loop. Am plays for two bars, then C plays for two.",
            try: "Tap a box in column 2 to change its chord.",
          },
          step3: {
            heading: "Step 3: Three chords",
            say: "F comes in on bar two. Three chords give the loop more variety than two.",
            try: "Tap a box to pick the chord for each bar.",
          },
          step4: {
            heading: "Step 4: End on G",
            say: "The G chord closes the loop and pulls back to Am.",
            try: "Pick G in column 4, then listen to all four chords.",
          },
        },
        basslines: {
          title: "Basslines",
          crumb: "Make a Song",
          listName: "Basslines",
          step1: {
            heading: "Step 1: The root",
            say: "The bass starts on the root of the chord. One note on beat one already holds up the bar.",
            try: "Tap the Root box in another column, then tap play.",
          },
          step2: {
            heading: "Step 2: Two beats",
            say: "The root on beats one and three gives the line a steady stride.",
            try: "Turn on boxes in columns 2 and 4 and hear the difference.",
          },
          step3: {
            heading: "Step 3: Add the fifth",
            say: "The fifth sits above the root and still fits the chord. Switching between them makes the bass move.",
            try: "Move the Fifth to another column and listen to the motion.",
          },
          step4: {
            heading: "Step 4: Up an octave",
            say: "The octave lifts the line before it settles back on the root.",
            try: "Tap the Octave box in column 3, then tap play.",
          },
        },
        melodies: {
          title: "Melodies",
          crumb: "Make a Song",
          listName: "Melodies",
          step1: {
            heading: "Step 1: A short phrase",
            say: "Five notes move, then the last column always comes home to C.",
            try: "Tap a box in an empty column to add a note, then tap play.",
          },
          step2: {
            heading: "Step 2: Repeat and change",
            say: "The phrase starts like step 1, but columns 5 and 6 are empty. Repeating with a small change makes a melody easy to remember.",
            try: "Fill columns 5 and 6, then compare it with step 1.",
          },
          step3: {
            heading: "Step 3: Stepping down",
            say: "The melody walks down from G to C. A falling line brings calm.",
            try: "Play the whole phrase and follow the direction of the notes.",
          },
          step4: {
            heading: "Step 4: Complete the phrase",
            say: "Column 7 is still empty, so the phrase breaks off before it gets home to C.",
            try: "Fill column 7 with C4, then listen to the phrase from start to end.",
          },
        },
        "song-structure": {
          title: "Song Structure",
          crumb: "Make a Song",
          listName: "Song Structure",
          step1: {
            heading: "Step 1: One block",
            say: "Block A carries drums, bass, and chords. Four identical bars make the first section.",
            try: "Tap play, then switch off one layer and hear what goes missing.",
          },
          step2: {
            heading: "Step 2: Block B",
            say: "Block B uses the F chord, and the melody joins in. Two bars of A then two bars of B sound like a question and an answer.",
            try: "Change one B back to A and hear the difference.",
          },
          step3: {
            heading: "Step 3: Alternating",
            say: "A and B take turns every bar, so Am and F keep swapping.",
            try: "Switch Melody off, listen, then switch it back on.",
          },
          step4: {
            heading: "Step 4: The final order",
            say: "Four blocks play four chords: Am, F, C, and G. Changing their order changes how the song moves.",
            try: "Tap boxes until the order reads B, A, C, D, then tap play.",
          },
        },
      },
      toy: {
        lane: {
          openhat: "Open Hat",
          hat: "Closed Hat",
          clap: "Clap",
          kick: "Kick",
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
          piano: "Notes",
          chords: "Chords",
          arrange: "Song blocks",
          beats: "Drum pattern",
        },
      },
      ui: {
        play: "Play",
        stop: "Stop",
        mute: "Mute",
        clear: "Clear",
        tempo: "Tempo",
        next: "Next",
        back: "Back",
        done: "Done",
        star: "Star",
        cta: {
          song: "Make your own song",
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
