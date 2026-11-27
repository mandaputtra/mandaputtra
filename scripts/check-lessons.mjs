import { readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, resolve, relative, sep } from "node:path";

const CHECK_ORDER = ["data", "copy", "manifest", "budget", "license"];

const RULES = {
  data: [
    "data.slug.set",
    "data.slug.order",
    "data.steps.count",
    "data.step.shape",
    "data.toy.family",
    "data.drum.shape",
    "data.bass.shape",
    "data.keys.shape",
    "data.chords.shape",
    "data.arrange.shape",
    "data.goal.shape",
    "data.goal.preload",
    "data.pattern.arity",
    "data.cta.href",
    "data.field.forbidden",
  ],
  copy: [
    "copy.leaves.count",
    "copy.parity",
    "copy.value.shape",
    "copy.keys.data",
    "copy.keys.markup",
    "copy.flat.allowlist",
    "copy.shame.words",
    "copy.keys.orphan",
  ],
  manifest: [
    "manifest.files",
    "manifest.script.order",
    "manifest.script.no_inline",
    "manifest.url.root",
    "manifest.frontmatter",
    "manifest.worker",
    "manifest.precache",
    "manifest.live_region",
    "manifest.headings",
    "manifest.title",
    "manifest.asset.selfhost",
    "manifest.deploy.tools",
  ],
  budget: ["budget.focusables", "budget.cells", "budget.columns"],
  license: ["license.file", "license.hash", "license.record"],
};

const LESSON_ORDER = [
  "beats",
  "notes-scales",
  "chords",
  "basslines",
  "melodies",
  "song-structure",
];

const DOCUMENTS = [
  { path: "explore/learning-music/index.njk", slug: null },
  ...LESSON_ORDER.map((slug) => ({
    path: `explore/learning-music/${slug}/index.njk`,
    slug,
  })),
];

const EXPECTED_PATHS = [
  "explore/learning-music/index.njk",
  ...LESSON_ORDER.map((slug) => `explore/learning-music/${slug}/index.njk`),
  "js/explore-learning-music-shared.js",
  "js/explore-learning-music-audio.js",
  "js/explore-learning-music-lessons.js",
  "js/explore-learning-music.js",
  "css/explore-learning-music.css",
  "css/explore-learning-music-lessons.css",
  "sw.js",
  "img/learning-music/bird.svg",
  "img/learning-music/bird-LICENSE.txt",
  "img/learning-music/README.md",
  "tools/audio-check.html",
  "scripts/check-lessons.mjs",
  "scripts/check-lessons.test.mjs",
  ".eleventy.js",
  ".eleventyignore",
  "package.json",
  "eslint.config.mjs",
  "netlify.toml",
];

const STAT_ONLY_PATHS = new Set([
  "tools/audio-check.html",
  "scripts/check-lessons.mjs",
  "scripts/check-lessons.test.mjs",
]);

const PRECACHE_URLS = [
  "/explore/learning-music/",
  "/explore/learning-music/beats/",
  "/explore/learning-music/notes-scales/",
  "/explore/learning-music/chords/",
  "/explore/learning-music/basslines/",
  "/explore/learning-music/melodies/",
  "/explore/learning-music/song-structure/",
  "/js/vendor/tone-15.5.66.js",
  "/js/explore-learning-music-shared.js",
  "/js/explore-learning-music-audio.js",
  "/js/explore-learning-music.js",
  "/js/explore-learning-music-lessons.js",
  "/css/reset.css",
  "/css/explore-learning-music.css",
  "/css/explore-learning-music-lessons.css",
  "/img/learning-music/bird.svg",
];

const FLAT_KEYS = [
  "back",
  "title",
  "intro",
  "tap",
  "noAudio",
  "song",
  "stop",
  "resume",
  "silent",
  "grownUps",
  "unofficial",
  "inspired",
  "noscript",
  "track0",
  "track1",
  "track2",
  "track3",
  "starting",
  "stopping",
];

const TOY_BY_FAMILY = {
  drum: "drum",
  bass: "bass",
  keys: "keys",
  chords: "chords",
  arrange: "arrange",
};

const FAMILY_BY_SLUG = {
  beats: "drum",
  "notes-scales": "keys",
  chords: "chords",
  basslines: "bass",
  melodies: "keys",
  "song-structure": "arrange",
};

const BASS_VALUES = ["off", "root", "fifth", "octave"];
const CHORD_IDS = ["Am", "F", "C", "G"];
const BLOCK_IDS = ["A", "B", "C", "D"];
const KEY_NOTES = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
const DRUM_ALPHABET = ".Xxo";
const DRUM_LANES = ["openhat", "hat", "clap", "kick"];
const DRUM_CELLS = DRUM_LANES.length * 16;

const GOAL_SHAPES = {
  drum: { type: "cells-equal", field: "cells", length: 4 },
  bass: { type: "values-equal", field: "values", length: 4 },
  keys: { type: "slots-equal", field: "slots", length: 8 },
  chords: { type: "progression-equal", field: "progression", length: 4 },
  arrange: { type: "blocks-equal", field: "blocks", length: 4 },
};

const FORBIDDEN_FIELDS = [
  "score",
  "timer",
  "countdown",
  "fail",
  "wrong",
  "lives",
  "streak",
  "percentage",
  "level",
];

const SHAME_PATTERN =
  /\b(salah(?!\s+satu)|gagal|keliru|coba\s+lagi|wrong|fail|incorrect|try\s+again)\b/i;

const USAGE = `Usage: node scripts/check-lessons.mjs [options]

Checks the learning-music lesson data, dictionary copy, document manifest,
accessibility budgets and mascot licence record.

Options:
  --root <dir>     project root to inspect (default: .)
  --only <check>   run one check: data, copy, manifest, budget, license
  --json           print the machine-readable report
  --verbose        list every passing rule
  --site <dir>     also assert the built site has no tools directory
  --help           print this message

Exit codes: 0 pass, 1 content failure or void, 2 invocation error.`;

export function parseArgs(argv) {
  const options = {
    root: ".",
    only: null,
    json: false,
    verbose: false,
    site: null,
    help: false,
  };
  const valueFlags = new Set(["--root", "--only", "--site"]);
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      return { ok: false, error: `unexpected argument: ${arg}` };
    }
    const separator = arg.indexOf("=");
    const flag = separator === -1 ? arg : arg.slice(0, separator);
    const inline = separator === -1 ? null : arg.slice(separator + 1);
    if (flag === "--json" || flag === "--verbose" || flag === "--help") {
      if (inline !== null) return { ok: false, error: `flag takes no value: ${flag}` };
      if (flag === "--json") options.json = true;
      if (flag === "--verbose") options.verbose = true;
      if (flag === "--help") options.help = true;
      continue;
    }
    if (!valueFlags.has(flag)) {
      return { ok: false, error: `unknown option: ${flag}` };
    }
    const value = inline !== null ? inline : argv[(index += 1)];
    if (typeof value !== "string" || value === "") {
      return { ok: false, error: `missing value for ${flag}` };
    }
    if (flag === "--only") {
      if (!CHECK_ORDER.includes(value)) {
        return { ok: false, error: `unknown check: ${value}` };
      }
      options.only = value;
      continue;
    }
    if (flag === "--root") options.root = value;
    if (flag === "--site") options.site = value;
  }
  return { ok: true, options };
}

export function normalizeLine(text) {
  return text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
}

export function countLeaves(node) {
  if (typeof node === "string") return 1;
  if (node === null || typeof node !== "object") return 0;
  let total = 0;
  for (const key of Object.keys(node)) total += countLeaves(node[key]);
  return total;
}

export function flatKeysOf(node) {
  if (node === null || typeof node !== "object") return [];
  return Object.keys(node)
    .filter((key) => !key.includes(".") && typeof node[key] === "string")
    .sort();
}

export function parseCsvLane(value) {
  if (typeof value !== "string" || value.length !== 16) return null;
  for (const char of value) {
    if (!DRUM_ALPHABET.includes(char)) return null;
  }
  return value.split("");
}

export function grade(report) {
  if (Array.isArray(report.voids) && report.voids.length > 0) return 1;
  const findings = Array.isArray(report.findings) ? report.findings : [];
  return findings.some((finding) => finding.severity === "error") ? 1 : 0;
}

function firstInvalidUtf8(bytes) {
  let index = 0;
  while (index < bytes.length) {
    const byte = bytes[index];
    if (byte < 0x80) {
      index += 1;
      continue;
    }
    let length;
    let secondMin = 0x80;
    let secondMax = 0xbf;
    if (byte >= 0xc2 && byte <= 0xdf) {
      length = 2;
    } else if (byte === 0xe0) {
      length = 3;
      secondMin = 0xa0;
    } else if (byte >= 0xe1 && byte <= 0xec) {
      length = 3;
    } else if (byte === 0xed) {
      length = 3;
      secondMax = 0x9f;
    } else if (byte >= 0xee && byte <= 0xef) {
      length = 3;
    } else if (byte === 0xf0) {
      length = 4;
      secondMin = 0x90;
    } else if (byte >= 0xf1 && byte <= 0xf3) {
      length = 4;
    } else if (byte === 0xf4) {
      length = 4;
      secondMax = 0x8f;
    } else {
      return index;
    }
    if (index + length > bytes.length) return index;
    const second = bytes[index + 1];
    if (second < secondMin || second > secondMax) return index;
    for (let offset = 2; offset < length; offset += 1) {
      const next = bytes[index + offset];
      if (next < 0x80 || next > 0xbf) return index;
    }
    index += length;
  }
  return -1;
}

function decodeUtf8(bytes) {
  const invalid = firstInvalidUtf8(bytes);
  if (invalid !== -1) return { error: `invalid UTF-8 at byte ${invalid}` };
  return { text: normalizeLine(bytes.toString("utf8")) };
}

function extractAssignedLiteral(source, name) {
  const pattern = new RegExp(`\\b(?:const|let|var)\\s+${name}\\s*=\\s*`);
  const match = pattern.exec(source);
  if (match === null) return null;
  const start = match.index + match[0].length;
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (quote !== null) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "/" && source[index + 1] === "/") {
      const newline = source.indexOf("\n", index);
      if (newline === -1) return null;
      index = newline;
      continue;
    }
    if (char === "/" && source[index + 1] === "*") {
      const close = source.indexOf("*/", index + 2);
      if (close === -1) return null;
      index = close + 1;
      continue;
    }
    if (char === "{" || char === "[" || char === "(") {
      depth += 1;
      continue;
    }
    if (char === "}" || char === "]" || char === ")") {
      depth -= 1;
      if (depth === 0) {
        const rest = source.slice(index + 1).match(/^\s*;/);
        if (rest === null) return null;
        return source.slice(start, index + 1).trim();
      }
      if (depth < 0) return null;
    }
  }
  return null;
}

function readDeclarations(source, names) {
  const scope = {};
  for (const name of names) {
    const literal = extractAssignedLiteral(source, name);
    if (literal === null) return { error: `literal ${name} not found` };
    const parameters = Object.keys(scope);
    const values = parameters.map((key) => scope[key]);
    try {
      scope[name] = new Function(...parameters, `"use strict";return (${literal});`)(...values);
    } catch {
      return { error: `unbalanced literal ${name}` };
    }
  }
  return { scope };
}

function lineAt(text, index) {
  if (index < 0) return 1;
  let line = 1;
  for (let cursor = 0; cursor < index && cursor < text.length; cursor += 1) {
    if (text[cursor] === "\n") line += 1;
  }
  return line;
}

function lineOf(text, needle, fallback = 1) {
  const index = text.indexOf(needle);
  return index === -1 ? fallback : lineAt(text, index);
}

function relativePath(root, absolute) {
  return relative(root, absolute).split(sep).join("/");
}

function makeFinding(severity, rule, path, line, observed, expected, message) {
  return {
    severity,
    rule,
    path,
    line,
    observed: String(observed),
    expected: String(expected),
    message,
    fix: `make ${path} match ${expected}`,
  };
}

function stripHtmlComments(text) {
  return text.replace(/<!--[\s\S]*?-->/g, "");
}

function attrValue(tag, name) {
  const double = new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`).exec(tag);
  if (double !== null) return double[1];
  const single = new RegExp(`\\s${name}\\s*=\\s*'([^']*)'`).exec(tag);
  return single === null ? null : single[1];
}

function sliceElement(html, startIndex, tagName) {
  const pattern = new RegExp(`<(/?)${tagName}\\b[^>]*>`, "gi");
  pattern.lastIndex = startIndex;
  let depth = 0;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    if (match[1] === "/") {
      depth -= 1;
      if (depth === 0) return html.slice(startIndex, match.index + match[0].length);
    } else {
      depth += 1;
    }
  }
  return null;
}

function toyRegions(document) {
  const pattern = /<div class="lm-toy">/gi;
  const regions = [];
  let match;
  while ((match = pattern.exec(document.text)) !== null) {
    const slice = sliceElement(document.text, match.index, "div");
    if (slice !== null) {
      regions.push({
        start: match.index,
        text: slice,
        line: lineAt(document.text, match.index),
      });
    }
  }
  return regions;
}

function countMatches(text, pattern) {
  const global = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  const match = text.match(global);
  return match === null ? 0 : match.length;
}

function readProject(root, rel) {
  const absolute = join(root, rel);
  try {
    const stat = statSync(absolute);
    if (!stat.isFile()) return { error: "not a file" };
  } catch {
    return { error: "absent" };
  }
  if (STAT_ONLY_PATHS.has(rel)) return { text: null, statOnly: true };
  try {
    const bytes = readFileSync(absolute);
    return { ...decodeUtf8(bytes), bytes };
  } catch {
    return { error: "unreadable" };
  }
}

function leafPaths(node, prefix = "", out = []) {
  for (const key of Object.keys(node)) {
    const path = prefix === "" ? key : `${prefix}.${key}`;
    const value = node[key];
    if (value !== null && typeof value === "object") leafPaths(value, path, out);
    else out.push(path);
  }
  return out;
}

function getPath(tree, path) {
  let node = tree;
  for (const part of path.split(".")) {
    if (node === null || typeof node !== "object") return undefined;
    if (!Object.prototype.hasOwnProperty.call(node, part)) return undefined;
    node = node[part];
  }
  return node;
}

function resolveKey(text, key) {
  const nested = getPath(text, key);
  if (nested !== undefined) return nested;
  if (Object.prototype.hasOwnProperty.call(text, key)) return text[key];
  return undefined;
}

function walkLessonData(node, visit, path = "") {
  if (node === null || typeof node !== "object") return;
  for (const key of Object.keys(node)) {
    const childPath = path === "" ? key : `${path}.${key}`;
    visit(key, node[key], childPath);
    walkLessonData(node[key], visit, childPath);
  }
}

const READ_ONLY_PATHS = [
  "js/vendor/tone-15.5.66.js",
  "js/vendor/tone-15.5.66.LICENSE.txt",
  "css/reset.css",
];

function buildContext(root, site) {
  const files = new Map();
  for (const rel of EXPECTED_PATHS) files.set(rel, readProject(root, rel));
  const readOnly = new Map();
  for (const rel of READ_ONLY_PATHS) {
    let present = false;
    try {
      present = statSync(join(root, rel)).isFile();
    } catch {
      present = false;
    }
    readOnly.set(rel, present);
  }
  const documents = DOCUMENTS.map((entry) => {
    const file = files.get(entry.path) || { error: "absent" };
    return {
      ...entry,
      text: typeof file.text === "string" ? file.text : "",
      missing: typeof file.text !== "string",
    };
  });
  return { root, site, files, readOnly, documents };
}

function documentText(context, path) {
  return context.documents.find((document) => document.path === path);
}

function survey(context) {
  const counts = {
    lessons: 0,
    steps: 0,
    toyRegions: 0,
    families: 0,
    drumCells: 0,
    leaves: 0,
    flatKeys: 0,
    paths: 0,
    liveRegions: 0,
    precacheUrls: 0,
  };
  counts.paths = EXPECTED_PATHS.filter((rel) => {
    const file = context.files.get(rel);
    return file !== undefined && file.error === undefined;
  }).length;
  const lessonsFile = context.files.get("js/explore-learning-music-lessons.js");
  if (lessonsFile !== undefined && typeof lessonsFile.text === "string") {
    const data = readDeclarations(lessonsFile.text, ["LESSON_CTA", "LESSON_DATA"]);
    if (data.scope !== undefined) {
      const dataValue = data.scope.LESSON_DATA;
      counts.lessons = Object.keys(dataValue).length;
      const families = new Set();
      const slugs = Object.keys(dataValue);
      for (const slug of slugs) {
        const steps = Array.isArray(dataValue[slug].steps) ? dataValue[slug].steps : [];
        counts.steps += steps.length;
        for (const step of steps) families.add(step.family);
      }
      counts.families = families.size;
    }
  }
  const shared = context.files.get("js/explore-learning-music-shared.js");
  if (shared !== undefined && typeof shared.text === "string") {
    const text = readDeclarations(shared.text, ["LM_TEXT"]);
    if (text.scope !== undefined) {
      counts.leaves = countLeaves(text.scope.LM_TEXT.id) + countLeaves(text.scope.LM_TEXT.en);
      counts.flatKeys = flatKeysOf(text.scope.LM_TEXT.id).length;
    }
  }
  const worker = context.files.get("sw.js");
  if (worker !== undefined && typeof worker.text === "string") {
    const precache = readDeclarations(worker.text, ["PRECACHE"]);
    if (precache.scope !== undefined) counts.precacheUrls = precache.scope.PRECACHE.length;
  }
  for (const document of context.documents) {
    if (document.missing) continue;
    const regions = toyRegions(document);
    counts.toyRegions += regions.length;
    if (document.slug === "beats" && regions.length > 0) counts.drumCells = DRUM_CELLS;
    counts.liveRegions += countMatches(document.text, /<[a-z]+\b[^>]*\bid="live"/gi);
  }
  return counts;
}

function checkData(context) {
  const findings = [];
  const voids = [];
  const path = "js/explore-learning-music-lessons.js";
  const file = context.files.get(path);
  if (file === undefined || typeof file.text !== "string") {
    voids.push({ check: "data", message: `${path}: ${file === undefined ? "absent" : file.error}` });
    return { findings, voids };
  }
  const source = file.text;
  const names = [
    "LESSON_SLUGS",
    "LANES",
    "VELOCITY",
    "BASS_VALUES",
    "CHORD_CYCLE",
    "KEYBOARD",
    "ARRANGE_LANES",
    "ARRANGE_MELODY",
    "LESSON_CTA",
    "LESSON_DATA",
  ];
  const declarations = readDeclarations(source, names);
  if (declarations.error !== undefined) {
    voids.push({ check: "data", message: `${path}: ${declarations.error}` });
    return { findings, voids };
  }
  const { LESSON_DATA, LESSON_CTA, ARRANGE_LANES, ARRANGE_MELODY } = declarations.scope;
  const slugs = Object.keys(LESSON_DATA);
  const report = (rule, slugOrStep, observed, expected, message) => {
    const needle = slugOrStep === null ? "LESSON_DATA" : `"${slugOrStep}"`;
    findings.push(
      makeFinding(
        "error",
        rule,
        path,
        lineOf(source, needle),
        observed,
        expected,
        message,
      ),
    );
  };

  for (const slug of LESSON_ORDER) {
    if (!slugs.includes(slug)) report("data.slug.set", slug, slugs.join(","), LESSON_ORDER.join(","), "lesson slug missing");
  }
  for (const slug of slugs) {
    if (!LESSON_ORDER.includes(slug)) {
      findings.push(
        makeFinding(
          "error",
          "data.slug.set",
          path,
          lineOf(source, `"${slug}"`),
          slug,
          LESSON_ORDER.join(","),
          "unknown lesson slug",
        ),
      );
    }
  }

  for (const slug of LESSON_ORDER) {
    const lesson = LESSON_DATA[slug];
    if (lesson === undefined) continue;
    if (lesson.order !== LESSON_ORDER.indexOf(slug)) {
      report("data.slug.order", slug, lesson.order, LESSON_ORDER.indexOf(slug), "lesson order is not the documented order");
    }
    const steps = Array.isArray(lesson.steps) ? lesson.steps : [];
    if (steps.length !== 4) report("data.steps.count", slug, steps.length, 4, "lesson must carry four steps");
    steps.forEach((step, index) => {
      const number = index + 1;
      if (step === null || typeof step !== "object") {
        report("data.step.shape", slug, "non-object step", "step object", "step is not an object");
        return;
      }
      if (step.copy !== `lesson.${slug}.step${number}`) {
        report("data.step.shape", slug, step.copy, `lesson.${slug}.step${number}`, "step copy key is not slug-shaped");
      }
      if (number < 4 && step.goal !== null) report("data.step.shape", slug, "goal present", "goal null", "goal exists before the final step");
      if (number === 4 && (step.goal === null || typeof step.goal !== "object")) {
        report("data.step.shape", slug, "goal absent", "goal object", "final step needs a goal");
      }
      if (step.finale !== (number === 4)) report("data.step.shape", slug, step.finale, number === 4, "finale flag does not mark the final step");
      if (step.toy !== TOY_BY_FAMILY[step.family]) {
        report("data.toy.family", slug, `${step.family}/${step.toy}`, `${step.family}/${TOY_BY_FAMILY[step.family]}`, "toy does not match family");
      }
      if (step.family !== FAMILY_BY_SLUG[slug]) {
        report("data.toy.family", slug, step.family, FAMILY_BY_SLUG[slug], "lesson family is not the documented family");
      }
      validateStep(step, number, slug, report);
    });
  }

  const families = new Set(slugs.map((slug) => LESSON_DATA[slug].steps[0].family));
  if (families.size !== 5) report("data.toy.family", null, families.size, 5, "the five toy families are not all present");

  for (const [lane, pattern] of Object.entries(ARRANGE_LANES)) {
    if (typeof pattern !== "string" || pattern.length !== 16 || !/^[.Xxo]{16}$/.test(pattern)) {
      report("data.pattern.arity", "song-structure", `${lane}:${pattern}`, "16 chars of .Xxo", "arrange lane is not sixteen characters");
    }
  }
  if (!Array.isArray(ARRANGE_MELODY) || ARRANGE_MELODY.length !== 8) {
    report("data.pattern.arity", "song-structure", Array.isArray(ARRANGE_MELODY) ? ARRANGE_MELODY.length : "not an array", 8, "arrange melody needs eight slots");
  }

  if (LESSON_CTA.href !== "/explore/learning-music/" || LESSON_CTA.labelKey !== "ui.cta.song") {
    report("data.cta.href", null, `${LESSON_CTA.href}/${LESSON_CTA.labelKey}`, "/explore/learning-music/ + ui.cta.song", "lesson call to action is not the documented target");
  }
  for (const document of context.documents) {
    if (document.slug === null || document.missing) continue;
    const cta = /<a class="lm-cta" href="([^"]*)"/.exec(document.text);
    if (cta === null || cta[1] !== "/explore/learning-music/") {
      findings.push(
        makeFinding(
          "error",
          "data.cta.href",
          document.path,
          cta === null ? 1 : lineAt(document.text, cta.index),
          cta === null ? "no lm-cta" : cta[1],
          "/explore/learning-music/",
          "completion call to action does not point at the song page",
        ),
      );
    }
    const finalNav = /<a data-nav="next" href="([^"]*)"/.exec(document.text);
    if (finalNav === null || finalNav[1] !== "/explore/learning-music/") {
      findings.push(
        makeFinding(
          "error",
          "data.cta.href",
          document.path,
          finalNav === null ? 1 : lineAt(document.text, finalNav.index),
          finalNav === null ? "no final nav anchor" : finalNav[1],
          "/explore/learning-music/",
          "final Next anchor is not the documented call to action",
        ),
      );
    }
  }

  walkLessonData(LESSON_DATA, (key) => {
    if (FORBIDDEN_FIELDS.includes(key)) {
      findings.push(
        makeFinding(
          "error",
          "data.field.forbidden",
          path,
          lineOf(source, `"${key}"`),
          key,
          "no scoring field",
          "lesson data must not carry scoring fields",
        ),
      );
    }
  });

  return { findings, voids };
}

function validateStep(step, number, slug, report) {
  const payload = step.payload;
  if (payload === null || typeof payload !== "object") {
    report("data.step.shape", slug, "no payload", "payload object", "step payload is absent");
    return;
  }
  if (step.family === "drum") {
    const lanes = payload.lanes;
    const laneNames = lanes !== null && typeof lanes === "object" ? Object.keys(lanes) : [];
    if (laneNames.join(",") !== DRUM_LANES.join(",")) {
      report("data.drum.shape", slug, laneNames.join(","), DRUM_LANES.join(","), "drum lanes are not the documented four");
    }
    for (const lane of DRUM_LANES) {
      const laneValue = lanes === undefined ? undefined : lanes[lane];
      if (parseCsvLane(laneValue) === null) {
        report("data.pattern.arity", slug, `${lane}:${String(laneValue)}`, "16 chars of .Xxo", "drum lane is not sixteen characters");
      }
    }
    const cells = laneNames.length * 16;
    if (cells !== DRUM_CELLS) report("data.pattern.arity", slug, cells, DRUM_CELLS, "drum grid is not four lanes by sixteen steps");
  }
  if (step.family === "bass") {
    const cells = Array.isArray(payload.cells) ? payload.cells : [];
    if (cells.length !== 4 || cells.some((cell) => !BASS_VALUES.includes(cell))) {
      report("data.bass.shape", slug, cells.join(","), BASS_VALUES.join(","), "bass cells are not four documented values");
    }
  }
  if (step.family === "keys") {
    const slots = Array.isArray(payload.slots) ? payload.slots : [];
    if (slots.length !== 8) report("data.keys.shape", slug, slots.length, 8, "keys payload needs eight slots");
    for (const slot of slots) {
      if (slot !== null && !KEY_NOTES.includes(slot)) {
        report("data.keys.shape", slug, slot, "null or a note from C4 to C5", "keys slot is not a playable note");
      }
    }
    const rewrite = Array.isArray(payload.rewriteSlots) ? payload.rewriteSlots : null;
    if (rewrite === null) {
      report("data.keys.shape", slug, "no rewriteSlots", "sorted unique array", "rewriteSlots is missing");
    } else {
      const sortedUnique = rewrite.every((slot, index) => Number.isInteger(slot) && slot >= 0 && slot <= 7 && (index === 0 || slot > rewrite[index - 1]));
      if (!sortedUnique) report("data.keys.shape", slug, rewrite.join(","), "sorted unique subset of 0..7", "rewriteSlots is not a sorted unique subset");
      const allowed = slug === "melodies" && (number === 1 || number === 2) ? [7] : [];
      if (rewrite.join(",") !== allowed.join(",")) {
        report("data.keys.shape", slug, `step${number}:${rewrite.join(",")}`, `${slug}/step${number}:${allowed.join(",")}`, "rewriteSlots does not follow the documented pattern");
      }
    }
  }
  if (step.family === "chords") {
    const progression = Array.isArray(payload.progression) ? payload.progression : [];
    if (progression.length !== 4 || progression.some((chord) => !CHORD_IDS.includes(chord))) {
      report("data.chords.shape", slug, progression.join(","), "four chord ids", "chord progression is not four documented chords");
    }
    if (typeof payload.pads !== "boolean") {
      report("data.chords.shape", slug, String(payload.pads), "boolean", "chord pads flag is not boolean");
    }
    const padsAllowed = !(slug === "chords" && number === 1);
    if (payload.pads !== padsAllowed) {
      report("data.chords.shape", slug, `step${number}:${payload.pads}`, `step${number}:${padsAllowed}`, "pads flag is not the documented value for this step");
    }
  }
  if (step.family === "arrange") {
    const blocks = Array.isArray(payload.blocks) ? payload.blocks : [];
    if (blocks.length !== 4 || blocks.some((block) => !BLOCK_IDS.includes(block))) {
      report("data.arrange.shape", slug, blocks.join(","), "four block ids", "arrange blocks are not four documented blocks");
    }
    const chordMap = Array.isArray(payload.chordMap) ? payload.chordMap : [];
    if (chordMap.length !== 4 || chordMap.some((chord) => !CHORD_IDS.includes(chord))) {
      report("data.arrange.shape", slug, chordMap.join(","), "four chord ids", "arrange chord map is not four documented chords");
    }
    const layers = payload.layers !== null && typeof payload.layers === "object" ? Object.keys(payload.layers).sort().join(",") : "";
    if (layers !== "bass,chords,drums,melody") {
      report("data.arrange.shape", slug, layers, "bass,chords,drums,melody", "arrange layers are not the documented four");
    }
    for (const [layer, value] of Object.entries(payload.layers || {})) {
      if (typeof value !== "boolean") report("data.arrange.shape", slug, `${layer}:${String(value)}`, "boolean", "arrange layer flag is not boolean");
    }
  }
  if (number === 4) validateGoal(step, slug, report);
}

function validateGoal(step, slug, report) {
  const shape = GOAL_SHAPES[step.family];
  const goal = step.goal;
  if (goal === null || typeof goal !== "object" || shape === undefined) return;
  if (goal.type !== shape.type) report("data.goal.shape", slug, goal.type, shape.type, "goal type does not match the family");
  const values = goal[shape.field];
  if (!Array.isArray(values) || values.length !== shape.length) {
    report("data.goal.shape", slug, Array.isArray(values) ? values.length : "missing", shape.length, "goal length does not match the family");
    return;
  }
  if (step.family === "keys" && values.some((note) => !KEY_NOTES.includes(note))) {
    report("data.goal.shape", slug, values.join(","), "notes from C4 to C5", "goal slot is not a playable note");
  }
  if (step.family === "chords" && values.some((chord) => !CHORD_IDS.includes(chord))) {
    report("data.goal.shape", slug, values.join(","), "four chord ids", "goal progression is not four documented chords");
  }
  if (step.family === "bass" && values.some((value) => !BASS_VALUES.includes(value))) {
    report("data.goal.shape", slug, values.join(","), BASS_VALUES.join(","), "goal value is not a documented bass value");
  }
  if (step.family === "drum" && values.some((lane) => parseCsvLane(lane) === null)) {
    report("data.goal.shape", slug, values.join(","), "16 chars of .Xxo per lane", "goal lane is not sixteen characters");
  }
  if (step.family === "arrange" && values.some((block) => !BLOCK_IDS.includes(block))) {
    report("data.goal.shape", slug, values.join(","), "four block ids", "goal block is not a documented block");
  }
  const payload = step.payload;
  if (step.family === "arrange") {
    const payloadBlocks = Array.isArray(payload.blocks) ? payload.blocks : [];
    const sortedGoal = values.slice().sort().join(",");
    const sortedPayload = payloadBlocks.slice().sort().join(",");
    if (sortedGoal !== sortedPayload) {
      report("data.goal.preload", slug, values.join(","), `permutation of ${payloadBlocks.join(",")}`, "arrange goal is not a permutation of the payload");
    }
  } else if (step.family === "drum") {
    const laneValues = payload.lanes || {};
    const cells = DRUM_LANES.map((lane) => String(laneValues[lane]).replace(/[xo]/g, "X"));
    if (cells.join(",") === values.join(",")) {
      report("data.goal.preload", slug, values.join(","), "a goal that differs from the preload", "drum preload already satisfies its goal");
    }
  } else {
    const payloadValues = step.family === "bass" ? payload.cells : step.family === "keys" ? payload.slots : payload.progression;
    if (Array.isArray(payloadValues) && payloadValues.join(",") === values.join(",")) {
      report("data.goal.preload", slug, values.join(","), "a goal that differs from the preload", "preload already satisfies its goal");
    }
  }
}

function checkCopy(context) {
  const findings = [];
  const voids = [];
  const path = "js/explore-learning-music-shared.js";
  const file = context.files.get(path);
  if (file === undefined || typeof file.text !== "string") {
    voids.push({ check: "copy", message: `${path}: ${file === undefined ? "absent" : file.error}` });
    return { findings, voids };
  }
  const source = file.text;
  const declarations = readDeclarations(source, ["LM_TEXT"]);
  if (declarations.error !== undefined) {
    voids.push({ check: "copy", message: `${path}: ${declarations.error}` });
    return { findings, voids };
  }
  const text = declarations.scope.LM_TEXT;
  const find = (rule, observed, expected, message, key) => {
    findings.push(
      makeFinding(
        rule === "copy.keys.orphan" ? "info" : "error",
        rule,
        path,
        lineOf(source, `"${key || observed}"`),
        observed,
        expected,
        message,
      ),
    );
  };

  for (const language of ["id", "en"]) {
    const leaves = leafPaths(text[language]);
    if (leaves.length !== 140) find("copy.leaves.count", `${language}:${leaves.length}`, "140", "leaf count is not 140 per language", language);
  }

  const idPaths = leafPaths(text.id);
  const enPaths = leafPaths(text.en);
  for (const leaf of idPaths) {
    if (!enPaths.includes(leaf)) find("copy.parity", `id:${leaf}`, "same key in en", "leaf exists in one language only", leaf);
  }
  for (const leaf of enPaths) {
    if (!idPaths.includes(leaf)) find("copy.parity", `en:${leaf}`, "same key in id", "leaf exists in one language only", leaf);
  }

  for (const language of ["id", "en"]) {
    for (const leaf of leafPaths(text[language])) {
      const value = getPath(text[language], leaf);
      if (typeof value !== "string" || value.trim() === "" || value === "undefined") {
        find("copy.value.shape", `${language}:${leaf}:${String(value)}`, "non-empty string", "leaf value is not a non-empty string", leaf);
        continue;
      }
      if (/\$\{|%s|\{\d\}/.test(value)) find("copy.value.shape", `${language}:${leaf}`, "plain text", "leaf value looks like a format string", leaf);
      if (!leaf.includes(".") && !FLAT_KEYS.includes(leaf)) find("copy.value.shape", `${language}:${leaf}`, "dotted path or flat allowlist", "leaf key is neither nested nor allowlisted", leaf);
    }
  }

  const dataFile = context.files.get("js/explore-learning-music-lessons.js");
  if (dataFile !== undefined && typeof dataFile.text === "string") {
    const declarationsData = readDeclarations(dataFile.text, ["LESSON_DATA"]);
    if (declarationsData.error === undefined) {
      const referenced = [];
      walkLessonData(declarationsData.scope.LESSON_DATA, (key, value) => {
        if (typeof value === "string" && (key.endsWith("Key") || key === "copy")) referenced.push(value);
      });
      for (const key of referenced) {
        for (const language of ["id", "en"]) {
          const value = resolveKey(text[language], key);
          if (typeof value !== "string" || value === "") {
            findings.push(
              makeFinding(
                "error",
                "copy.keys.data",
                dataFile ? "js/explore-learning-music-lessons.js" : path,
                lineOf(dataFile.text, `"${key}"`),
                `${language}:${key}`,
                "resolvable leaf",
                "lesson data references a key the dictionary does not resolve",
              ),
            );
          }
        }
      }
    }
  }

  const markupKeys = [];
  for (const document of context.documents) {
    if (document.missing) continue;
    const pattern = /data-i18n(?:-aria-label|-title)?="([^"]+)"/g;
    let match;
    while ((match = pattern.exec(document.text)) !== null) {
      markupKeys.push({ key: match[1], path: document.path, index: match.index });
    }
  }
  for (const entry of markupKeys) {
    for (const language of ["id", "en"]) {
      const value = resolveKey(text[language], entry.key);
      if (typeof value !== "string" || value === "") {
        const document = documentText(context, entry.path);
        findings.push(
          makeFinding(
            "error",
            "copy.keys.markup",
            entry.path,
            lineAt(document.text, entry.index),
            `${language}:${entry.key}`,
            "resolvable leaf",
            "markup references a key the dictionary does not resolve",
          ),
        );
      }
    }
  }

  for (const language of ["id", "en"]) {
    const flat = flatKeysOf(text[language]);
    const missing = FLAT_KEYS.filter((key) => !flat.includes(key));
    const extra = flat.filter((key) => !FLAT_KEYS.includes(key));
    if (missing.length > 0 || extra.length > 0) {
      find("copy.flat.allowlist", `${language}:${flat.join(",")}`, FLAT_KEYS.join(","), `flat allowlist differs (missing ${missing.join(",") || "none"}; extra ${extra.join(",") || "none"})`, language);
    }
    for (const key of Object.keys(text[language])) {
      if (key.includes(".")) find("copy.flat.allowlist", `${language}:${key}`, "no dotted top-level key", "a flat key carries a dot", key);
    }
  }

  const seenShame = new Set();
  for (const language of ["id", "en"]) {
    for (const leaf of leafPaths(text[language])) {
      const value = getPath(text[language], leaf);
      if (typeof value !== "string") continue;
      const match = SHAME_PATTERN.exec(value);
      if (match !== null && !seenShame.has(`${language}:${match[1]}`)) {
        seenShame.add(`${language}:${match[1]}`);
        find("copy.shame.words", `${language}:${match[1]}`, "no failure vocabulary", "copy uses failure vocabulary", leaf);
      }
    }
  }

  const referencedKeys = new Set(markupKeys.map((entry) => entry.key));
  const prefixes = new Set();
  for (const rel of ["js/explore-learning-music-lessons.js", "js/explore-learning-music.js", "js/explore-learning-music-shared.js"]) {
    const sourceFile = context.files.get(rel);
    if (sourceFile === undefined || typeof sourceFile.text !== "string") continue;
    const exact = /"([A-Za-z][\w.-]*[\w-])"/g;
    let match;
    while ((match = exact.exec(sourceFile.text)) !== null) referencedKeys.add(match[1]);
    const prefix = /"([a-z][\w.-]*\.)"\s*\+/g;
    while ((match = prefix.exec(sourceFile.text)) !== null) prefixes.add(match[1]);
  }
  for (const leaf of leafPaths(text.id)) {
    if (referencedKeys.has(leaf)) continue;
    if ([...prefixes].some((prefix) => leaf.startsWith(prefix))) continue;
    if (leaf.endsWith("title") && leaf.startsWith("lesson.")) continue;
    find("copy.keys.orphan", leaf, "a referenced leaf", "dictionary leaf is not referenced by markup or scripts", leaf);
  }

  return { findings, voids };
}

function checkManifest(context) {
  const findings = [];
  const voids = [];
  const report = (rule, path, line, observed, expected, message, severity = "error") => {
    findings.push(makeFinding(severity, rule, path, line, observed, expected, message));
  };

  const missing = EXPECTED_PATHS.filter((rel) => {
    const file = context.files.get(rel);
    return file === undefined || file.error !== undefined;
  });
  for (const rel of missing) report("manifest.files", rel, 1, "absent", "present file", "expected project file is absent");

  for (const document of context.documents) {
    if (document.missing) {
      continue;
    }
    const text = document.text;
    const scripts = [...text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].map((match) => ({
      attributes: match[1],
      body: match[2],
      index: match.index,
    }));
    const sources = scripts.map((script) => attrValue(script.attributes, "src"));
    const pageScript = document.slug === null ? "/js/explore-learning-music.js" : "/js/explore-learning-music-lessons.js";
    const expectedSources = [
      "/js/vendor/tone-15.5.66.js",
      "/js/explore-learning-music-shared.js",
      "/js/explore-learning-music-audio.js",
      pageScript,
    ];
    if (sources.join(",") !== expectedSources.join(",")) {
      report("manifest.script.order", document.path, lineOf(text, "<script"), sources.join(","), expectedSources.join(","), "scripts are not vendor, shared, audio, page in that order");
    }
    for (const script of scripts) {
      if (attrValue(script.attributes, "src") === null && script.body.trim() !== "") {
        report("manifest.script.no_inline", document.path, lineAt(text, script.index), script.body.trim().slice(0, 40), "no inline script", "document carries an inline script");
      }
    }
    const pageFile = context.files.get(pageScript.slice(1));
    if (pageFile !== undefined && typeof pageFile.text === "string") {
      const subscriptions = countMatches(pageFile.text, /\bonStateChange\s*:/g);
      if (subscriptions !== 1) {
        report("manifest.script.order", pageScript.slice(1), lineOf(pageFile.text, "onStateChange"), subscriptions, 1, "page must subscribe to engine state exactly once");
      }
    }

    const observable = stripHtmlComments(text);
    const urlPattern = /\b(?:href|src)\s*=\s*"([^"]*)"/gi;
    let urlMatch;
    while ((urlMatch = urlPattern.exec(observable)) !== null) {
      const value = urlMatch[1];
      if (value === "" || value.startsWith("#") || value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://") || value.startsWith("mailto:") || value.startsWith("data:")) continue;
      report("manifest.url.root", document.path, lineAt(observable, urlMatch.index), value, "root-absolute URL", "document URL is not root-absolute");
    }

    const frontmatter = /^---\n([\s\S]*?)\n---\n/.exec(text);
    if (frontmatter === null) {
      report("manifest.frontmatter", document.path, 1, "no frontmatter", "layout: false", "document has no frontmatter");
    } else {
      const fields = new Map();
      for (const line of frontmatter[1].split("\n")) {
        const pair = /^([\w-]+):\s*(.*)$/.exec(line);
        if (pair !== null) fields.set(pair[1], pair[2]);
      }
      if (fields.get("layout") !== "false") report("manifest.frontmatter", document.path, lineOf(text, "layout:"), fields.get("layout"), "false", "document is not layout: false");
      if (document.slug !== null) {
        const permalink = `/explore/learning-music/${document.slug}/`;
        if (fields.get("permalink") !== permalink) {
          report("manifest.frontmatter", document.path, lineOf(text, "permalink:"), fields.get("permalink"), permalink, "lesson permalink is not the slug directory");
        }
        const bodySlug = /<body\b[^>]*\bdata-lesson="([^"]*)"/.exec(text);
        if (bodySlug === null || bodySlug[1] !== document.slug) {
          report("manifest.frontmatter", document.path, lineOf(text, "<body"), bodySlug === null ? "absent" : bodySlug[1], document.slug, "data-lesson is not the slug");
        }
      }
    }

    const liveTags = [...observable.matchAll(/<([a-z]+)\b[^>]*\bid="live"[^>]*>/gi)];
    if (liveTags.length !== 1) {
      report("manifest.live_region", document.path, 1, liveTags.length, 1, "document needs exactly one live region");
    } else {
      const tag = liveTags[0][0];
      const tagName = liveTags[0][1];
      const role = attrValue(tag, "role");
      const live = attrValue(tag, "aria-live");
      const atomic = attrValue(tag, "aria-atomic");
      if (role !== "status" || live !== "polite" || atomic !== "true") {
        report("manifest.live_region", document.path, lineAt(observable, liveTags[0].index), `role=${role} live=${live} atomic=${atomic}`, "role=status aria-live=polite aria-atomic=true", "live region attributes are not the documented set");
      }
      const openEnd = liveTags[0].index + tag.length;
      const closePattern = new RegExp(`</${tagName}>`, "i");
      const rest = observable.slice(openEnd);
      const close = closePattern.exec(rest);
      if (close === null) {
        report("manifest.live_region", document.path, lineAt(observable, liveTags[0].index), "unterminated", "empty closed region", "live region is not closed");
      } else {
        if (rest.slice(0, close.index).trim() !== "") {
          report("manifest.live_region", document.path, lineAt(observable, openEnd), rest.slice(0, close.index).trim().slice(0, 40), "empty", "live region is not empty at load");
        }
        const after = rest.slice(close.index + close[0].length);
        const bodyClose = /^\s*<\/body>/i.exec(after);
        if (bodyClose === null) {
          report("manifest.live_region", document.path, lineAt(observable, openEnd + close.index), after.trim().slice(0, 40), "last element in body", "live region is not the last element in body");
        }
      }
    }

    const headingMatches = [...observable.matchAll(/<h([1-6])\b[^>]*>/gi)];
    const h1 = headingMatches.filter((match) => match[1] === "1").length;
    const h2 = headingMatches.filter((match) => match[1] === "2").length;
    if (h1 !== 1) report("manifest.headings", document.path, 1, h1, 1, "document needs exactly one h1");
    if (document.slug === null) {
      if (h2 !== 1) report("manifest.headings", document.path, 1, h2, 1, "homepage needs exactly one h2");
    } else {
      if (h2 !== 4) report("manifest.headings", document.path, 1, h2, 4, "lesson needs one h2 per step");
      const sections = [...observable.matchAll(/<section\b[^>]*class="lm-step"[^>]*>/gi)];
      for (const section of sections) {
        const labelledBy = attrValue(section[0], "aria-labelledby");
        const slice = sliceElement(observable, section.index, "section");
        if (labelledBy === null || slice === null || !slice.includes(`id="${labelledBy}"`)) {
          report("manifest.headings", document.path, lineAt(observable, section.index), labelledBy || "absent", "a matching h2 id", "step section does not point at its heading");
        }
      }
    }

    const titleTags = [...observable.matchAll(/<title\b[^>]*>/gi)];
    const titleKeys = countMatches(observable, /data-i18n-title=/g);
    if (titleTags.length !== 1 || titleKeys !== 1 || attrValue(titleTags[0][0], "data-i18n-title") === null) {
      report("manifest.title", document.path, 1, `${titleTags.length} title(s), ${titleKeys} title key(s)`, "one title with data-i18n-title", "document title is not the single dictionary-bound title");
    }

    const externalAnchors = [...observable.matchAll(/<a\b[^>]*href="(https?:\/\/[^"]*)"/gi)];
    const expectedAnchors = document.slug === null ? 1 : 2;
    if (externalAnchors.length !== expectedAnchors) {
      report("manifest.asset.selfhost", document.path, 1, externalAnchors.length, expectedAnchors, "outbound anchor count is not the documented count");
    }
    const assets = [...observable.matchAll(/\b(?:href|src)="(\/(?:js|css|img)\/[^"]*)"/gi)].map((match) => match[1]);
    for (const asset of assets) {
      const rel = asset.slice(1);
      const knownFile = context.files.get(rel) !== undefined || context.readOnly.get(rel) === true;
      if (!knownFile) {
        report("manifest.asset.selfhost", document.path, lineAt(observable, observable.indexOf(asset)), rel, "a self-hosted file", "document references a local asset that does not exist");
      }
    }
    if (document.slug !== null && !text.includes('src="/img/learning-music/bird.svg"')) {
      report("manifest.asset.selfhost", document.path, 1, "no mascot", 'src="/img/learning-music/bird.svg"', "lesson does not use the self-hosted mascot");
    }
  }

  const worker = context.files.get("sw.js");
  if (worker === undefined || typeof worker.text !== "string") {
    report("manifest.worker", "sw.js", 1, "absent", "root service worker", "service worker is absent");
  } else {
    const text = worker.text;
    const facts = [
      [/const CACHE = "lm-v1"/, "cache name lm-v1"],
      [/addEventListener\(\s*"install"/, "install handler"],
      [/addEventListener\(\s*"activate"/, "activate handler"],
      [/addEventListener\(\s*"fetch"/, "fetch handler"],
      [/skipWaiting/, "skipWaiting"],
      [/clients\.claim/, "clients.claim"],
      [/cache\.add\(/, "per-entry cache.add"],
      [/\.catch\(/, "swallowed add failure"],
      [/caches\.keys|caches\.delete/, "other cache deletion"],
      [/PRECACHE(?:_PATHS)?\.(?:includes|indexOf|has)/, "precache allowlist"],
      [/origin/, "same-origin guard"],
      [/"GET"|'GET'/, "GET-only guard"],
    ];
    for (const [pattern, label] of facts) {
      if (!pattern.test(text)) report("manifest.worker", "sw.js", 1, "missing", label, "worker does not implement the documented policy");
    }
    const shared = context.files.get("js/explore-learning-music-shared.js");
    const sharedText = shared !== undefined && typeof shared.text === "string" ? shared.text : "";
    if (!/"serviceWorker" in navigator|serviceWorker" in navigator/.test(sharedText)) {
      report("manifest.worker", "js/explore-learning-music-shared.js", 1, "no guard", '"serviceWorker" in navigator', "worker registration is not feature-guarded");
    }
    if (!/127\.0\.0\.1|https:/.test(sharedText)) {
      report("manifest.worker", "js/explore-learning-music-shared.js", 1, "no protocol guard", "https: or 127.0.0.1", "worker registration is not protocol-guarded");
    }
    if (countMatches(sharedText, /navigator\.serviceWorker\.register\(/g) !== 1) {
      report("manifest.worker", "js/explore-learning-music-shared.js", 1, countMatches(sharedText, /navigator\.serviceWorker\.register\(/g), 1, "worker registration appears more than once");
    }
  }

  if (worker !== undefined && typeof worker.text === "string") {
    const precache = readDeclarations(worker.text, ["PRECACHE"]);
    if (precache.error !== undefined) {
      voids.push({ check: "manifest", message: `sw.js: ${precache.error}` });
    } else {
      const urls = precache.scope.PRECACHE;
      if (urls.length !== 16) report("manifest.precache", "sw.js", 1, urls.length, 16, "precache list is not sixteen URLs");
      const expectedList = PRECACHE_URLS.join(",");
      if (urls.join(",") !== expectedList) {
        report("manifest.precache", "sw.js", lineOf(worker.text, "PRECACHE"), urls.join(","), expectedList, "precache list is not the documented order");
      }
      if (urls.some((url) => url.includes("tools/") || url.endsWith("/sw.js"))) {
        report("manifest.precache", "sw.js", lineOf(worker.text, "PRECACHE"), urls.join(","), "no tools/ or sw.js entry", "precache carries a forbidden entry");
      }
    }
  }

  if (context.site !== null) {
    const toolsPath = join(context.site, "tools");
    let exists = true;
    try {
      statSync(toolsPath);
    } catch {
      exists = false;
    }
    if (exists) {
      const siteLabel = relativePath(context.root, context.site);
      const label = siteLabel.startsWith("..") ? "site" : siteLabel || ".";
      report("manifest.deploy.tools", `${label}/tools`, 1, "present", "absent", "built site must not expose the tools directory");
    }
  }

  return { findings, voids };
}

function checkBudget(context) {
  const findings = [];
  const voids = [];
  const report = (rule, path, line, observed, expected, message) => {
    findings.push(makeFinding("error", rule, path, line, observed, expected, message));
  };

  for (const document of context.documents) {
    if (document.missing) continue;
    const regions = toyRegions(document);
    if (document.slug !== null && regions.length !== 4) {
      report("budget.focusables", document.path, 1, regions.length, 4, "lesson needs one toy region per step");
    }
    if (document.slug === null) continue;
    for (const region of regions) {
      if (region.text !== '<div class="lm-toy"></div>') {
        report("budget.cells", document.path, region.line, "prerendered controls", "empty region", "toy grid is built by script from lesson data");
      }
    }
  }

  for (const rel of ["js/explore-learning-music-lessons.js", "js/explore-learning-music.js"]) {
    const file = context.files.get(rel);
    if (file === undefined || typeof file.text !== "string") continue;
    if (/\baria-valuetext\b|\baria-valuenow\b/.test(file.text)) {
      report("budget.focusables", rel, lineOf(file.text, "aria-value"), "aria-value*", "no aria-value*", "scripts must not write aria-value attributes");
    }
  }
  for (const document of context.documents) {
    if (document.missing) continue;
    if (/\baria-valuetext\b|\baria-valuenow\b/.test(document.text)) {
      report("budget.focusables", document.path, lineOf(document.text, "aria-value"), "aria-value*", "no aria-value*", "markup must not carry aria-value attributes");
    }
  }

  for (const rel of ["css/explore-learning-music.css", "css/explore-learning-music-lessons.css"]) {
    const file = context.files.get(rel);
    if (file === undefined || typeof file.text !== "string") {
      voids.push({ check: "budget", message: `${rel}: ${file === undefined ? "absent" : file.error}` });
      continue;
    }
    const pattern = /grid-template-columns\s*:\s*([^;}]+)/g;
    let match;
    while ((match = pattern.exec(file.text)) !== null) {
      const columns = countCssColumns(match[1].trim());
      if (columns > 4) {
        report("budget.columns", rel, lineAt(file.text, match.index), columns, "at most 4", "grid exceeds four columns");
      }
    }
  }

  return { findings, voids };
}

function countCssColumns(value) {
  const repeat = /^repeat\(\s*(\d+)\s*,/.exec(value);
  if (repeat !== null) return Number(repeat[1]);
  let depth = 0;
  let tokens = 0;
  let inToken = false;
  for (const char of value) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (/\s/.test(char) && depth === 0) {
      inToken = false;
      continue;
    }
    if (!inToken) {
      tokens += 1;
      inToken = true;
    }
  }
  return tokens;
}

function checkLicense(context) {
  const findings = [];
  const voids = [];
  const report = (rule, path, line, observed, expected, message) => {
    findings.push(makeFinding("error", rule, path, line, observed, expected, message));
  };
  const svg = context.files.get("img/learning-music/bird.svg");
  const notice = context.files.get("img/learning-music/bird-LICENSE.txt");
  const record = context.files.get("img/learning-music/README.md");
  if (svg === undefined || svg.error !== undefined) report("license.file", "img/learning-music/bird.svg", 1, "absent", "present", "mascot file is absent");
  if (notice === undefined || notice.error !== undefined) report("license.file", "img/learning-music/bird-LICENSE.txt", 1, "absent", "present", "mascot notice is absent");
  if (record === undefined || record.error !== undefined) report("license.file", "img/learning-music/README.md", 1, "absent", "present", "mascot record is absent");
  if (findings.length > 0) return { findings, voids };

  if (!/MIT License/.test(notice.text) || !/Permission is hereby granted/.test(notice.text)) {
    report("license.file", "img/learning-music/bird-LICENSE.txt", 1, "no MIT text", "MIT notice", "notice is not the MIT licence");
  }

  const readField = (text, name) => {
    const match = new RegExp(`^\\s*(?:[-*]\\s*)?${name}:\\s*(.+)$`, "m").exec(text);
    return match === null ? null : match[1].trim();
  };
  const digest = createHash("sha256").update(svg.bytes).digest("hex");
  const normalizedDigest = createHash("sha256").update(normalizeLine(svg.text)).digest("hex");
  const size = svg.bytes.length;
  const recordedDigest = readField(record.text, "SHA-256");
  const recordedSize = readField(record.text, "Bytes");
  if (recordedDigest !== digest || recordedSize !== String(size)) {
    report(
      "license.hash",
      "img/learning-music/README.md",
      lineOf(record.text, "SHA-256:"),
      `${digest} (${size} bytes)`,
      `${recordedDigest} (${recordedSize} bytes)`,
      `digest mismatch; raw ${digest}, LF-normalized ${normalizedDigest}`,
    );
  }

  const copyrightNotice = /^Copyright\s+.*$/m.exec(notice.text);
  const pairs = [
    ["SHA-256", recordedDigest, readField(notice.text, "SHA-256"), "digest"],
    ["Bytes", recordedSize, readField(notice.text, "Bytes"), "size"],
    ["Copyright", readField(record.text, "Copyright"), copyrightNotice === null ? null : copyrightNotice[0].trim(), "copyright"],
    ["Source", readField(record.text, "Source"), readField(notice.text, "Source"), "source URL"],
    ["Date", readField(record.text, "Date"), readField(notice.text, "Date"), "date"],
  ];
  for (const [field, left, right, label] of pairs) {
    if (left === null || right === null || left.trim() !== right.trim()) {
      report(
        "license.record",
        "img/learning-music/bird-LICENSE.txt",
        lineOf(notice.text, `${field}:`),
        `${field}: ${String(right)}`,
        `${field}: ${String(left)}`,
        `notice and record disagree on ${label}`,
      );
    }
  }
  const source = readField(record.text, "Source");
  if (source !== null && !/^https:\/\//.test(source)) {
    report("license.record", "img/learning-music/README.md", lineOf(record.text, "Source:"), source, "an https source URL", "record source is not a URL");
  }

  return { findings, voids };
}

const CHECKERS = {
  data: checkData,
  copy: checkCopy,
  manifest: checkManifest,
  budget: checkBudget,
  license: checkLicense,
};

function run(options) {
  const root = resolve(options.root);
  const site = options.site === null ? null : resolve(root, options.site);
  const context = buildContext(root, site);
  const counts = survey(context);
  const selected = options.only === null ? CHECK_ORDER : [options.only];
  const checks = [];
  const allFindings = [];
  const allVoids = [];

  for (const name of selected) {
    let result;
    try {
      result = CHECKERS[name](context);
    } catch {
      result = { findings: [], voids: [{ check: name, message: "internal error" }] };
    }
    const findings = result.findings.slice().sort(compareFindings);
    allFindings.push(...findings);
    allVoids.push(...result.voids);
    checks.push({
      name,
      rules: RULES[name],
      status: result.voids.length > 0 ? "void" : findings.some((finding) => finding.severity === "error") ? "fail" : "pass",
      findings,
    });
  }

  const report = {
    ok: false,
    mode: "full",
    checks,
    findings: allFindings,
    voids: allVoids,
    counts,
    options: { only: options.only, json: options.json, verbose: options.verbose, site: options.site !== null },
    root,
  };
  report.ok = grade(report) === 0;
  return report;
}

function compareFindings(left, right) {
  if (left.path !== right.path) return left.path < right.path ? -1 : 1;
  if (left.line !== right.line) return left.line - right.line;
  if (left.rule !== right.rule) return left.rule < right.rule ? -1 : 1;
  return 0;
}

function checkSummary(name, counts) {
  if (name === "data") {
    return `${counts.lessons} lessons, ${counts.steps} steps, ${counts.toyRegions} toy regions, ${counts.families} families, ${counts.drumCells} drum cells`;
  }
  if (name === "copy") {
    return `${counts.leaves / 2} leaves per language, ${counts.flatKeys} flat keys`;
  }
  if (name === "manifest") {
    return `${counts.paths} paths, ${counts.precacheUrls} precache URLs, ${counts.liveRegions} live regions`;
  }
  if (name === "budget") {
    return `${counts.toyRegions} toy regions, ${counts.drumCells} drum cells`;
  }
  return "mascot digest and record verified";
}

function serialize(report) {
  return {
    ok: report.ok,
    mode: report.mode,
    counts: {
      lessons: report.counts.lessons,
      steps: report.counts.steps,
      toyRegions: report.counts.toyRegions,
      leaves: report.counts.leaves,
      paths: report.counts.paths,
      liveRegions: report.counts.liveRegions,
      precacheUrls: report.counts.precacheUrls,
      flatKeys: report.counts.flatKeys,
    },
    checks: report.checks.map((check) => ({
      name: check.name,
      status: check.status,
      rules: check.rules,
      findings: check.findings.map((finding) => ({
        severity: finding.severity,
        rule: finding.rule,
        path: finding.path,
        line: finding.line,
        observed: finding.observed,
        expected: finding.expected,
        message: finding.message,
        fix: finding.fix,
      })),
    })),
    voids: report.voids.map((item) => ({ check: item.check, message: item.message })),
  };
}

function renderHuman(report, write) {
  if (report.mode === "partial") {
    write(`scope 1/5 (${report.options.only}) — partial run, not a release gate`);
  }
  for (const voided of report.voids) {
    write(`VOID ${voided.check} ${voided.message}`);
  }
  for (const finding of report.findings) {
    write(
      `${finding.path}:${finding.line}: ${finding.severity} ${finding.rule}: ${finding.message} (observed ${finding.observed}; expected ${finding.expected}); fix: ${finding.fix}`,
    );
  }
  if (report.options.verbose) {
    for (const check of report.checks) {
      const failing = new Set(check.findings.map((finding) => finding.rule));
      for (const rule of check.rules) {
        if (!failing.has(rule)) write(`ok ${rule}`);
      }
    }
  }
  for (const check of report.checks) {
    if (check.status === "pass") {
      write(`ok ${check.name} (${check.rules.length} rules): ${checkSummary(check.name, report.counts)}`);
    } else {
      write(`FAIL ${check.name} (${check.rules.length} rules)`);
    }
  }
  const totalRules = report.checks.reduce((sum, check) => sum + check.rules.length, 0);
  if (report.ok) {
    write(`ok ${totalRules} rules in ${report.checks.length} check${report.checks.length === 1 ? "" : "s"} — pass`);
  } else {
    const errors = report.findings.filter((finding) => finding.severity === "error").length;
    write(`FAIL ${errors} error${errors === 1 ? "" : "s"}, ${report.voids.length} void${report.voids.length === 1 ? "" : "s"}`);
  }
}

function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (!parsed.ok) {
    process.stderr.write(`check-lessons: ${parsed.error}\n\n${USAGE}\n`);
    process.exitCode = 2;
    return;
  }
  if (parsed.options.help) {
    process.stdout.write(`${USAGE}\n`);
    process.exitCode = 0;
    return;
  }
  let report;
  try {
    report = run(parsed.options);
  } catch {
    process.stdout.write(`VOID check internal error\n`);
    process.exitCode = 1;
    return;
  }
  if (parsed.options.only !== null) report.mode = "partial";
  if (parsed.options.json) {
    process.stdout.write(`${JSON.stringify(serialize(report), null, 2)}\n`);
  } else {
    renderHuman(report, (line) => process.stdout.write(`${line}\n`));
  }
  process.exitCode = grade(report);
}

const modulePath = new URL(import.meta.url).pathname;
const invokedPath = process.argv[1] === undefined ? "" : resolve(process.argv[1]);
if (invokedPath === modulePath) main();
