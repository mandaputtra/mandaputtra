import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import {
  countLeaves,
  flatKeysOf,
  grade,
  normalizeLine,
  parseArgs,
  parseCsvLane,
} from "./check-lessons.mjs";

const CHECKER = new URL("./check-lessons.mjs", import.meta.url).pathname;
const PROJECT_ROOT = dirname(dirname(CHECKER));

const PROJECT_FILES = [
  "explore/learning-music/index.njk",
  "explore/learning-music/beats/index.njk",
  "explore/learning-music/notes-scales/index.njk",
  "explore/learning-music/chords/index.njk",
  "explore/learning-music/basslines/index.njk",
  "explore/learning-music/melodies/index.njk",
  "explore/learning-music/song-structure/index.njk",
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

function scratchProject(mutations = []) {
  const root = mkdtempSync(join(tmpdir(), "check-lessons-"));
  for (const rel of PROJECT_FILES) {
    const target = join(root, rel);
    mkdirSync(dirname(target), { recursive: true });
    try {
      cpSync(join(PROJECT_ROOT, rel), target, { recursive: false });
    } catch {
      continue;
    }
  }
  for (const mutation of mutations) {
    const target = join(root, mutation.path);
    const current = readFileSync(target, "utf8");
    writeFileSync(target, current.replace(mutation.find, mutation.replace));
  }
  return root;
}

function runChecker(args, cwd = PROJECT_ROOT) {
  return spawnSync(process.execPath, [CHECKER, ...args], { cwd, encoding: "utf8" });
}

test("parseArgs accepts every documented combination", () => {
  const cases = [
    { argv: [], expected: { root: ".", only: null, json: false, verbose: false, site: null, help: false } },
    { argv: ["--root", "somewhere"], expected: { root: "somewhere", only: null } },
    { argv: ["--only", "license"], expected: { only: "license" } },
    { argv: ["--json", "--verbose"], expected: { json: true, verbose: true } },
    { argv: ["--site", "_site"], expected: { site: "_site" } },
    { argv: ["--root=.", "--only=copy"], expected: { root: ".", only: "copy" } },
    { argv: ["--help"], expected: { help: true } },
  ];
  for (const item of cases) {
    const parsed = parseArgs(item.argv);
    assert.equal(parsed.ok, true, `expected acceptance for ${item.argv.join(" ")}`);
    for (const [key, value] of Object.entries(item.expected)) {
      assert.deepEqual(parsed.options[key], value, `${key} for ${item.argv.join(" ")}`);
    }
  }
});

test("parseArgs rejects unknown flags, unknown checks and missing values", () => {
  const rejected = [["--nope"], ["--only", "everything"], ["--root"], ["extra"], ["--json=yes"]];
  for (const argv of rejected) {
    const parsed = parseArgs(argv);
    assert.equal(parsed.ok, false, `expected rejection for ${argv.join(" ")}`);
    assert.equal(typeof parsed.error, "string");
  }
});

test("parseCsvLane accepts exactly sixteen drum characters", () => {
  assert.deepEqual(parseCsvLane("X...x...o...X..."), ["X", ".", ".", ".", "x", ".", ".", ".", "o", ".", ".", ".", "X", ".", ".", "."]);
  assert.deepEqual(parseCsvLane("................"), new Array(16).fill("."));
  assert.equal(parseCsvLane("X...x...o...X.."), null);
  assert.equal(parseCsvLane("X...x...o...X...."), null);
  assert.equal(parseCsvLane("X...x...o...x..a"), null);
  assert.equal(parseCsvLane(""), null);
});

test("countLeaves counts nested and flat dictionaries", () => {
  assert.equal(countLeaves({ a: "x", b: { c: "y", d: { e: "z" } } }), 3);
  assert.equal(countLeaves({ a: "x", b: "y", c: { d: null } }), 2);
  assert.equal(countLeaves("solo"), 1);
});

test("flatKeysOf keeps only non-dotted string keys", () => {
  assert.deepEqual(flatKeysOf({ b: "two", a: "one", nested: { deep: "x" }, "dotted.key": "z" }), ["a", "b"]);
});

test("normalizeLine strips a byte order mark and unifies line endings", () => {
  assert.equal(normalizeLine("\uFEFFa\r\nb\rc"), "a\nb\nc");
});

test("grade maps findings and voids to exit codes", () => {
  assert.equal(grade({ findings: [], voids: [] }), 0);
  assert.equal(grade({ findings: [{ severity: "info" }], voids: [] }), 0);
  assert.equal(grade({ findings: [{ severity: "error" }], voids: [] }), 1);
  assert.equal(grade({ findings: [], voids: [{ check: "data", message: "absent" }] }), 1);
});

test("--help prints the grammar on stdout and exits 0", () => {
  const result = runChecker(["--help"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage: node scripts\/check-lessons\.mjs/);
  assert.match(result.stdout, /--only <check>/);
  assert.equal(result.stderr, "");
});

test("an unknown flag is an invocation error with exit code 2", () => {
  const result = runChecker(["--frobnicate"]);
  assert.equal(result.status, 2);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /unknown option: --frobnicate/);
});

test("the shipped tree passes with five ok lines and the documented counts", () => {
  const result = runChecker([]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const lines = result.stdout.split("\n");
  const okLines = lines.filter((line) => /^ok (data|copy|manifest|budget|license) \(/.test(line));
  assert.equal(okLines.length, 5);
  assert.match(result.stdout, /ok data \(15 rules\): 6 lessons, 24 steps, 24 toy regions, 5 families, 64 drum cells/);
  assert.match(result.stdout, /ok copy \(8 rules\): 140 leaves per language, 19 flat keys/);
  assert.match(result.stdout, /ok manifest \(12 rules\): 25 paths, 16 precache URLs, 7 live regions/);
  assert.match(result.stdout, /ok budget \(3 rules\): 24 toy regions, 64 drum cells/);
  assert.match(result.stdout, /ok license \(3 rules\)/);
  assert.match(result.stdout, /ok 41 rules in 5 checks/);
});

test("--json reports stable counts and no absolute paths", () => {
  const result = runChecker(["--json"]);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.deepEqual(report.counts, {
    lessons: 6,
    steps: 24,
    toyRegions: 24,
    leaves: 280,
    paths: 25,
    liveRegions: 7,
    precacheUrls: 16,
    flatKeys: 19,
  });
  assert.equal(report.ok, true);
  assert.equal(report.checks.length, 5);
  assert.doesNotMatch(result.stdout, new RegExp(PROJECT_ROOT.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("a short drum lane fails the data check at its boundary", () => {
  const root = scratchProject([
    {
      path: "js/explore-learning-music-lessons.js",
      find: 'kick: "X...X...X...X..."',
      replace: 'kick: "X...X...X...X.."',
    },
  ]);
  try {
    const result = runChecker(["--root", root, "--only", "data"]);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /scope 1\/5 \(data\) — partial run, not a release gate/);
    assert.match(result.stdout, /data\.pattern\.arity/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("an empty dictionary leaf fails copy parity semantics", () => {
  const root = scratchProject([
    { path: "js/explore-learning-music-shared.js", find: 'kick: "Kick",', replace: 'kick: "",' },
  ]);
  try {
    const result = runChecker(["--root", root, "--only", "copy"]);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /copy\.value\.shape/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a missing live region fails the manifest check", () => {
  const root = scratchProject([
    {
      path: "explore/learning-music/beats/index.njk",
      find: '<div id="live" role="status" aria-live="polite" aria-atomic="true"></div>',
      replace: "",
    },
  ]);
  try {
    const result = runChecker(["--root", root, "--only", "manifest"]);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /manifest\.live_region/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
