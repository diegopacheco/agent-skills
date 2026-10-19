const node = ["require", "module", "process", "__dirname", "__filename", "Buffer", "console", "setTimeout", "clearTimeout", "setInterval", "clearInterval", "globalThis", "URL", "structuredClone"];
const browser = ["window", "document", "navigator", "localStorage", "location", "requestAnimationFrame", "getComputedStyle", "CSS", "HTMLElement", "KeyboardEvent", "MouseEvent", "Event"];

function globals(names) {
  return Object.fromEntries(names.map((name) => [name, "readonly"]));
}

module.exports = [
  { ignores: ["**/node_modules/**", "**/dist/**", "ui/core/**", "sample-project/**"] },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: globals([...node, ...browser, "NightMetrics", "NightHighlight", "NightMarkdown", "NIGHT_DATA"]),
    },
    rules: { "no-unused-vars": "error", "no-undef": "error" },
  },
  {
    files: ["**/*.mjs"],
    languageOptions: { ecmaVersion: "latest", sourceType: "module", globals: globals(node) },
    rules: { "no-unused-vars": "error", "no-undef": "error" },
  },
];
