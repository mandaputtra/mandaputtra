import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["_site/**", "node_modules/**", "js/vendor/**", "js/prism.js"],
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: globals.node,
    },
  },
  {
    files: ["js/**/*.js"],
    languageOptions: {
      sourceType: "script",
      globals: { ...globals.browser, Tone: "readonly", module: "readonly" },
    },
  },
  {
    files: ["js/**/*.mjs", "eslint.config.mjs"],
    languageOptions: {
      sourceType: "module",
      globals: globals.node,
    },
  },
  {
    files: ["scripts/**/*.mjs", "sw.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        process: "readonly",
        URL: "readonly",
        console: "readonly",
        Buffer: "readonly",
        self: "readonly",
        caches: "readonly",
        clients: "readonly",
        fetch: "readonly",
        Response: "readonly",
        Request: "readonly",
      },
    },
  },
];
