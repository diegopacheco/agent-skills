#!/usr/bin/env node
import { readdir, readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { join, relative, extname, basename, dirname, resolve, sep } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const SKIP_DIRS = new Set(["node_modules", ".git", "target", "build", "dist", "out", ".run", ".idea", ".gradle", "vendor", "venv", ".venv", "__pycache__", ".next", "coverage", ".bsp", ".metals", ".bloop", ".scala-build", ".mvn", "printscreens", ".pytest_cache", ".mypy_cache", ".turbo", ".svelte-kit"]);
const CODE_EXT = new Set([".java", ".kt", ".kts", ".scala", ".sc", ".go", ".rs", ".py", ".js", ".mjs", ".cjs", ".ts", ".mts", ".cts", ".tsx", ".jsx", ".vue", ".svelte"]);
const FRONT_DIRS = new Set(["ui", "web", "webapp", "frontend", "front", "client", "bff", "www", "spa", "mobile", "front-end", "web-ui"]);
const BACK_DIRS = new Set(["backend", "back", "server", "api", "service", "services", "back-end", "core"]);
const FRONT_EXT = new Set([".tsx", ".jsx", ".vue", ".svelte"]);
const SECTION = /^(features?|flags?|feature[-_]?flags|featureflags|feature[-_]?toggles|toggles?)$/i;
const ENV_FLAG = /^(?:VITE_|NEXT_PUBLIC_|REACT_APP_|EXPO_PUBLIC_)?(?:FEATURES?|FLAGS?|FF|TOGGLES?)_[A-Z0-9_]+$/;
const ENV_TOKEN = /["'\x60]((?:VITE_|NEXT_PUBLIC_|REACT_APP_|EXPO_PUBLIC_)?(?:FEATURES?|FLAGS?|FF|TOGGLES?)_[A-Z0-9_]+)["'\x60]|\b(?:process\.env|import\.meta\.env|Bun\.env|Deno\.env)\??\.((?:VITE_|NEXT_PUBLIC_|REACT_APP_|EXPO_PUBLIC_)?(?:FEATURES?|FLAGS?|FF|TOGGLES?)_[A-Z0-9_]+)/g;
const CONFIG_TOKEN = /["'\x60](?:\$\{)?((?:features?|flags?|feature[-_]?flags|featureFlags|feature[-_]?toggles|toggles?)\.([\w.\-]+?))[}"'\x60:]/g;
const FLAGGY_RECEIVER = /flag|feature|toggle|^ld|client|unleash|optimizely|split|growthbook|^gb$|statsig|posthog|configcat|flipt|devcycle|eppo|remote|ff4j|openfeature|waffle|decider|experiment/i;
const OBJECT_ACCESS = /(?<!["'\x60.\w\/-])\b(features|flags|featureFlags|feature_flags|FEATURE_FLAGS|FEATURES|FLAGS|toggles|featureToggles)\s*(?:\?\.|\.)\s*([A-Za-z_]\w*)\b(?!\s*[(=]|[-.])|\b(features|flags|featureFlags|feature_flags|FEATURE_FLAGS|FEATURES|FLAGS|toggles|featureToggles)\s*(?:\[\s*|\.get\(\s*|\.getOrDefault\(\s*)(["'])([\w.\-:]+)\4/g;
const LOCAL_PROVIDERS = new Set(["Custom", "Config", "Env vars", "Spring properties", "Cargo features", "Togglz", "Flag file"]);
const ACCESS_STOP = new Set(["length", "size", "keys", "values", "entries", "map", "filter", "forEach", "get", "set", "has", "toString", "isEmpty", "all", "items", "contains", "containsKey", "getOrDefault", "stream", "iterator", "count", "clear", "put", "remove", "isEnabled", "enabled", "list", "find", "load", "reload", "default"]);

export const PROVIDERS = {
  "LaunchDarkly": { imports: /launchdarkly|ldclient|ld-client|\bLDClient\b|ld_client/i, methods: ["boolVariation", "stringVariation", "intVariation", "numberVariation", "doubleVariation", "jsonVariation", "jsonValueVariation", "variation", "variationDetail", "boolVariationDetail", "stringVariationDetail", "BoolVariation", "StringVariation", "IntVariation", "Float64Variation", "JSONVariation", "BoolVariationDetail", "bool_variation", "string_variation", "int_variation", "float_variation", "json_variation", "variation_detail", "useLDFlag"] },
  "Optimizely": { imports: /optimizely/i, methods: ["isFeatureEnabled", "is_feature_enabled", "IsFeatureEnabled", "decide", "Decide", "getFeatureVariable", "getFeatureVariableBoolean", "getFeatureVariableString", "getFeatureVariableInteger", "get_feature_variable", "GetFeatureVariableBoolean", "activate", "getVariation", "get_variation", "useDecision"] },
  "Unleash": { imports: /unleash/i, methods: ["isEnabled", "is_enabled", "IsEnabled", "getVariant", "get_variant", "GetVariant", "useFlag", "useVariant", "useFlagStatus"] },
  "OpenFeature": { imports: /openfeature|open_feature|open-feature/i, methods: ["getBooleanValue", "getStringValue", "getNumberValue", "getIntegerValue", "getDoubleValue", "getObjectValue", "getBooleanDetails", "getStringDetails", "getNumberDetails", "getObjectDetails", "BooleanValue", "StringValue", "IntValue", "FloatValue", "ObjectValue", "BooleanValueDetails", "StringValueDetails", "get_boolean_value", "get_string_value", "get_integer_value", "get_float_value", "get_object_value", "get_boolean_details", "get_bool_value", "get_int_value", "get_struct_value", "useBooleanFlagValue", "useStringFlagValue", "useNumberFlagValue", "useObjectFlagValue", "useBooleanFlagDetails"] },
  "Split": { imports: /splitio|split\.io|io\.split|@splitsoftware|splitclient/i, methods: ["getTreatment", "getTreatments", "getTreatmentWithConfig", "get_treatment", "get_treatment_with_config", "Treatment", "TreatmentWithConfig", "useTreatments", "useSplitTreatments"], keyArg: "second" },
  "Flagsmith": { imports: /flagsmith/i, methods: ["hasFeature", "getFeatureValue", "is_feature_enabled", "get_feature_value", "isFeatureEnabled", "getValue", "IsFeatureEnabled", "GetFeatureValue", "useFlags"] },
  "GrowthBook": { imports: /growthbook/i, methods: ["isOn", "isOff", "getFeatureValue", "evalFeature", "feature", "useFeatureIsOn", "useFeatureValue", "useFeature", "is_on", "is_off", "get_feature_value", "eval_feature", "IsOn", "EvalFeature"] },
  "ConfigCat": { imports: /configcat/i, methods: ["getValue", "getValueAsync", "getValueDetails", "getValueDetailsAsync", "get_value", "get_value_details", "GetBoolValue", "GetStringValue", "GetIntValue", "GetBoolValueAsync", "useFeatureFlag"] },
  "Statsig": { imports: /statsig/i, methods: ["checkGate", "check_gate", "CheckGate", "getFeatureGate", "get_feature_gate", "useGate", "useFeatureGate", "getExperiment", "get_experiment", "GetExperiment"] },
  "PostHog": { imports: /posthog/i, methods: ["isFeatureEnabled", "getFeatureFlag", "getFeatureFlagPayload", "feature_enabled", "get_feature_flag", "get_feature_flag_payload", "IsFeatureEnabled", "GetFeatureFlag", "useFeatureFlagEnabled", "useFeatureFlagVariantKey", "useFeatureFlagPayload"] },
  "DevCycle": { imports: /devcycle/i, methods: ["variableValue", "variable_value", "VariableValue", "useVariableValue", "variable", "Variable"] },
  "Eppo": { imports: /eppo/i, methods: ["getBooleanAssignment", "getStringAssignment", "getNumericAssignment", "getIntegerAssignment", "getJSONAssignment", "get_boolean_assignment", "get_string_assignment", "get_numeric_assignment", "GetBoolAssignment", "GetStringAssignment"] },
  "Harness": { imports: /harness|ff-server-sdk|ff-javascript|cfclient|cf_client|ff-client/i, methods: ["boolVariation", "stringVariation", "numberVariation", "jsonVariation", "BoolVariation", "StringVariation", "bool_variation", "string_variation"] },
  "Firebase Remote Config": { imports: /remote[-_.]?config|remoteconfig/i, methods: ["getBoolean", "getString", "getNumber", "getValue", "getLong", "getDouble", "get_bool", "GetBoolean"] },
  "Azure App Configuration": { imports: /featuremanagement|feature_management|azure.*appconfig|appconfiguration/i, methods: ["isEnabled", "isEnabledAsync", "IsEnabledAsync", "is_enabled", "isFeatureEnabled"] },
  "Django Waffle": { imports: /waffle/i, methods: ["flag_is_active", "switch_is_active", "sample_is_active", "get_waffle_flag_model"] },
  "Flipt": { imports: /flipt/i, methods: ["evaluateBoolean", "evaluateVariant", "evaluate_boolean", "evaluate_variant", "Boolean", "Variant", "Evaluate"] },
  "Custom": { imports: /(?!)/, methods: ["isEnabled", "is_enabled", "IsEnabled", "isActive", "isOn", "is_on", "isFeatureEnabled", "isFlagEnabled", "is_flag_enabled", "flagEnabled", "featureEnabled", "hasFeature", "hasFlag", "isFeatureOn", "useFlag", "useFeature", "useFeatureFlag", "getFlag", "get_flag", "flag", "enabled", "Enabled"] }
};
const DISTINCTIVE = new Set(["boolVariation", "stringVariation", "intVariation", "numberVariation", "doubleVariation", "jsonVariation", "jsonValueVariation", "variationDetail", "boolVariationDetail", "stringVariationDetail", "BoolVariation", "StringVariation", "IntVariation", "Float64Variation", "JSONVariation", "BoolVariationDetail", "bool_variation", "string_variation", "int_variation", "float_variation", "json_variation", "variation_detail", "useLDFlag", "isFeatureEnabled", "is_feature_enabled", "IsFeatureEnabled", "getFeatureVariable", "getFeatureVariableBoolean", "getFeatureVariableString", "getFeatureVariableInteger", "get_feature_variable", "GetFeatureVariableBoolean", "useDecision", "getBooleanValue", "getStringValue", "getNumberValue", "getIntegerValue", "getDoubleValue", "getObjectValue", "getBooleanDetails", "getStringDetails", "getNumberDetails", "getObjectDetails", "BooleanValueDetails", "StringValueDetails", "get_boolean_value", "get_string_value", "get_integer_value", "get_float_value", "get_object_value", "get_boolean_details", "get_bool_value", "get_struct_value", "useBooleanFlagValue", "useStringFlagValue", "useNumberFlagValue", "useObjectFlagValue", "useBooleanFlagDetails", "getTreatment", "getTreatments", "getTreatmentWithConfig", "get_treatment", "get_treatment_with_config", "useTreatments", "useSplitTreatments", "hasFeature", "getFeatureValue", "get_feature_value", "GetFeatureValue", "useFeatureIsOn", "useFeatureValue", "evalFeature", "eval_feature", "EvalFeature", "getValueAsync", "getValueDetails", "getValueDetailsAsync", "get_value_details", "GetBoolValue", "GetStringValue", "GetBoolValueAsync", "checkGate", "check_gate", "CheckGate", "getFeatureGate", "get_feature_gate", "useGate", "useFeatureGate", "getFeatureFlag", "getFeatureFlagPayload", "feature_enabled", "get_feature_flag", "get_feature_flag_payload", "GetFeatureFlag", "useFeatureFlagEnabled", "useFeatureFlagVariantKey", "useFeatureFlagPayload", "variableValue", "variable_value", "VariableValue", "useVariableValue", "getBooleanAssignment", "getStringAssignment", "getNumericAssignment", "getIntegerAssignment", "getJSONAssignment", "get_boolean_assignment", "get_string_assignment", "get_numeric_assignment", "GetBoolAssignment", "GetStringAssignment", "flag_is_active", "switch_is_active", "sample_is_active", "evaluateBoolean", "evaluateVariant", "evaluate_boolean", "evaluate_variant", "isEnabledAsync", "IsEnabledAsync", "isFlagEnabled", "is_flag_enabled", "isFeatureOn", "useFeatureFlag", "useFlag", "useFlagStatus"]);
const ALL_METHODS = [...new Set(Object.values(PROVIDERS).flatMap((p) => p.methods))].sort((a, b) => b.length - a.length);
const CALL_RE = new RegExp("(?:([A-Za-z_$][\\w$]*)\\s*(?:\\?\\.|\\.|::|->)\\s*)?\\b(" + ALL_METHODS.join("|") + ")\\s*(?:<[^<>()]*>)?\\s*\\(", "g");

export function normalize(name) {
  return String(name)
    .replace(/^(?:VITE_|NEXT_PUBLIC_|REACT_APP_|EXPO_PUBLIC_)/i, "")
    .replace(/^(?:features?|flags?|ff|toggles?|feature[-_]?flags)[_.\-]/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function parseArgs(argv) {
  const args = { cmd: argv[0], positional: [], front: [], back: [], evalLogs: [], exports: [], exportSide: "back", out: null, now: null };
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out") args.out = argv[++i];
    else if (a === "--front") args.front.push(...argv[++i].split(",").filter(Boolean));
    else if (a === "--back") args.back.push(...argv[++i].split(",").filter(Boolean));
    else if (a === "--eval-log") args.evalLogs.push(argv[++i]);
    else if (a === "--now") args.now = argv[++i];
    else if (a === "--export") args.exports.push(argv[++i]);
    else if (a === "--export-side") args.exportSide = argv[++i];
    else args.positional.push(a);
  }
  return args;
}

async function walk(root, dir = root, acc = []) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name) && !e.name.startsWith("feature-flags-report")) await walk(root, full, acc);
    } else if (e.isFile()) {
      acc.push(full);
    }
  }
  return acc;
}

function kindOf(file) {
  const ext = extname(file).toLowerCase();
  const name = basename(file);
  if (CODE_EXT.has(ext)) return "code";
  if (name === "Cargo.toml") return "cargo";
  if (name === ".env" || name.startsWith(".env.") || ext === ".env") return "env";
  if (ext === ".yml" || ext === ".yaml") return "yaml";
  if (ext === ".properties") return "properties";
  if (ext === ".conf" || ext === ".hocon") return "hocon";
  if (ext === ".toml") return "toml";
  if (ext === ".json" && /flag|feature|toggle/i.test(name)) return "json";
  if (ext === ".xml" && /ff4j|feature|flag|toggle/i.test(name)) return "xml";
  return null;
}

export function isTestFile(rel) {
  return /(^|[\/\\])(tests?|__tests__|spec|specs|e2e)([\/\\])/i.test(rel) || /\.(test|spec)\.[cm]?[jt]sx?$/i.test(rel) || /_test\.(go|py)$/.test(rel) || /(^|[\/\\])test_[^\/\\]*\.py$/.test(rel) || /(Test|Tests|Spec|Suite|IT)\.(java|kt|scala)$/.test(rel);
}

function sideOf(rel, opts) {
  const norm = rel.split(sep).join("/");
  if (opts.front.some((p) => norm === p || norm.startsWith(p.replace(/\/$/, "") + "/"))) return "front";
  if (opts.back.some((p) => norm === p || norm.startsWith(p.replace(/\/$/, "") + "/"))) return "back";
  for (const seg of norm.split("/").slice(0, -1)) {
    const s = seg.toLowerCase();
    if (FRONT_DIRS.has(s)) return "front";
    if (BACK_DIRS.has(s)) return "back";
  }
  if (FRONT_EXT.has(extname(rel).toLowerCase())) return "front";
  return "back";
}

function lineIndex(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) starts.push(i + 1);
  return (pos) => {
    let lo = 0, hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= pos) lo = mid; else hi = mid - 1;
    }
    return lo + 1;
  };
}

function lineText(lines, n) {
  return (lines[n - 1] || "").trim().slice(0, 180);
}

function isCommentLine(line) {
  const t = line.trim();
  return t.startsWith("//") || t.startsWith("/*") || t.startsWith("*") || (t.startsWith("#") && !t.startsWith("#[") && !t.startsWith("#![")) || t.startsWith("--");
}

function scalar(raw) {
  const v = String(raw).trim().replace(/\s+#.*$/, "").replace(/^["']|["'],?$/g, "").replace(/,$/, "").trim();
  if (/^(true|on|yes|1)$/i.test(v)) return true;
  if (/^(false|off|no|0)$/i.test(v)) return false;
  return v === "" ? null : v;
}

function flagPath(segments) {
  const i = segments.findIndex((s) => SECTION.test(s));
  if (i === -1 || i === segments.length - 1) return null;
  return segments.slice(i + 1).join(".");
}

function parseYaml(text) {
  const out = [];
  const stack = [];
  text.split("\n").forEach((line, idx) => {
    if (/^\s*(#|$)/.test(line) || /^---/.test(line)) return;
    const env = line.match(/^\s*-\s*["']?([A-Z][A-Z0-9_]*)\s*=\s*(.*?)["']?\s*$/);
    if (env && ENV_FLAG.test(env[1])) { out.push({ name: env[1], value: scalar(env[2]), line: idx + 1, source: "env list" }); return; }
    const named = line.match(/^\s*-?\s*name:\s*["']?([A-Z][A-Z0-9_]*)["']?\s*$/);
    if (named && ENV_FLAG.test(named[1])) { out.push({ name: named[1], value: null, line: idx + 1, source: "env list" }); return; }
    const m = line.match(/^(\s*)(?:-\s+)?["']?([\w.\-\/]+)["']?\s*:\s*(.*)$/);
    if (!m) return;
    const indent = m[1].length;
    while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
    const keys = m[2].split(".");
    const rest = m[3].trim();
    if (ENV_FLAG.test(m[2]) && rest !== "" && !rest.startsWith("|") && !rest.startsWith(">")) {
      out.push({ name: m[2], value: scalar(rest), line: idx + 1, source: "env" });
      return;
    }
    if (rest === "" || rest.startsWith("#") || rest.startsWith("&")) {
      stack.push({ indent, keys });
      return;
    }
    const segs = [...stack.flatMap((s) => s.keys), ...keys];
    const name = flagPath(segs);
    if (name) out.push({ name, value: scalar(rest), line: idx + 1, source: "yaml" });
  });
  return out;
}

function parseProperties(text) {
  const out = [];
  text.split("\n").forEach((line, idx) => {
    const m = line.match(/^\s*([\w.\-\[\]]+)\s*[=:]\s*(.*)$/);
    if (!m || /^\s*[#!]/.test(line)) return;
    const name = flagPath(m[1].split("."));
    if (name) out.push({ name, value: scalar(m[2]), line: idx + 1, source: "properties" });
    else if (ENV_FLAG.test(m[1])) out.push({ name: m[1], value: scalar(m[2]), line: idx + 1, source: "properties" });
  });
  return out;
}

function parseHocon(text) {
  const out = [];
  const stack = [];
  text.split("\n").forEach((line, idx) => {
    const t = line.trim();
    if (!t || t.startsWith("#") || t.startsWith("//")) return;
    const open = t.match(/^([\w.\-"]+)\s*[:=]?\s*\{\s*$/);
    if (open) { stack.push(open[1].replace(/"/g, "").split(".")); return; }
    if (t === "}" || t === "},") { stack.pop(); return; }
    const kv = t.match(/^([\w.\-"]+)\s*[:=]\s*(.+?)\s*,?$/);
    if (!kv) return;
    const name = flagPath([...stack.flat(), ...kv[1].replace(/"/g, "").split(".")]);
    if (name) out.push({ name, value: scalar(kv[2].replace(/\$\{[^}]*\}/, "")), line: idx + 1, source: "hocon" });
  });
  return out;
}

function parseToml(text, cargo) {
  const out = [];
  let section = [];
  text.split("\n").forEach((line, idx) => {
    const t = line.trim();
    if (!t || t.startsWith("#")) return;
    const h = t.match(/^\[+([^\]]+)\]+$/);
    if (h) { section = h[1].trim().split("."); return; }
    const kv = t.match(/^["']?([\w.\-]+)["']?\s*=\s*(.*)$/);
    if (!kv) return;
    if (cargo) {
      if (section.join(".") === "features" && kv[1] !== "default") out.push({ name: kv[1], value: null, line: idx + 1, source: "cargo", provider: "Cargo features" });
      return;
    }
    const name = flagPath([...section, ...kv[1].split(".")]);
    if (name) out.push({ name, value: scalar(kv[2]), line: idx + 1, source: "toml" });
  });
  return out;
}

function parseEnv(text) {
  const out = [];
  text.split("\n").forEach((line, idx) => {
    const m = line.match(/^\s*(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (m && ENV_FLAG.test(m[1])) out.push({ name: m[1], value: scalar(m[2]), line: idx + 1, source: "env" });
  });
  return out;
}

function parseJson(text) {
  let data;
  try { data = JSON.parse(text); } catch { return []; }
  const lines = text.split("\n");
  const lineOf = (key) => Math.max(1, lines.findIndex((l) => l.includes('"' + key + '"')) + 1);
  const valueOf = (v) => {
    if (typeof v === "boolean") return v;
    if (v && typeof v === "object") {
      for (const k of ["enabled", "on", "defaultValue", "value", "default", "state"]) if (k in v) return typeof v[k] === "boolean" ? v[k] : scalar(String(v[k]));
    }
    return typeof v === "string" ? scalar(v) : null;
  };
  let root = data;
  for (const k of ["flags", "features", "featureFlags", "feature_flags", "toggles"]) if (data && typeof data === "object" && k in data) { root = data[k]; break; }
  const out = [];
  if (Array.isArray(root)) {
    for (const item of root) {
      const name = item && (item.key || item.name || item.id);
      if (typeof name === "string") out.push({ name, value: valueOf(item), line: lineOf(name), source: "json" });
    }
  } else if (root && typeof root === "object") {
    for (const [name, v] of Object.entries(root)) out.push({ name, value: valueOf(v), line: lineOf(name), source: "json" });
  }
  return out;
}

function parseXml(text) {
  const out = [];
  const at = lineIndex(text);
  for (const m of text.matchAll(/<feature\s+[^>]*uid\s*=\s*"([^"]+)"[^>]*>/g)) {
    const enable = m[0].match(/enable\s*=\s*"(\w+)"/);
    out.push({ name: m[1], value: enable ? scalar(enable[1]) : null, line: at(m.index), source: "ff4j xml", provider: "FF4J" });
  }
  return out;
}

function splitArgs(text, start) {
  let depth = 0, quote = null, cur = "", args = [];
  for (let i = start; i < Math.min(text.length, start + 400); i++) {
    const c = text[i];
    if (quote) {
      cur += c;
      if (c === "\\") { cur += text[++i] || ""; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "\x60") { quote = c; cur += c; continue; }
    if (c === "(" || c === "[" || c === "{") depth++;
    if (c === ")" || c === "]" || c === "}") {
      if (depth === 0) { args.push(cur.trim()); return args.filter((a) => a !== "" || args.length > 1); }
      depth--;
    }
    if (c === "," && depth === 0) { args.push(cur.trim()); cur = ""; continue; }
    cur += c;
  }
  args.push(cur.trim());
  return args;
}

function literal(arg) {
  const m = arg && arg.match(/^(?:[rbuRBU]|s|raw)?(["'\x60])((?:\\.|(?!\1)[^\\])*)\1$/s);
  if (!m) return null;
  if (m[1] === "\x60" && m[2].includes("\${")) return null;
  if (/^s["]/.test(arg) && /\$\w|\$\{/.test(m[2])) return null;
  if (/^[\w.\-:\/ ]{1,120}$/.test(m[2])) return m[2];
  return null;
}

function dynamicPrefix(arg) {
  const m = arg.match(/(?:[fs]|raw)?(["'\x60])([^"'\x60]*?)(?:\$\{|\$\w|\{|%[sdv]|\1)/);
  if (!m) return null;
  const p = m[2];
  return p.length >= 2 && /^[\w.\-:]+$/.test(p) ? p : null;
}

function providerFor(method, receiver, sdks) {
  const owners = Object.entries(PROVIDERS).filter(([, p]) => p.methods.includes(method)).map(([n]) => n);
  const imported = owners.filter((o) => sdks.includes(o));
  if (imported.length) return imported[0];
  const flaggy = receiver && FLAGGY_RECEIVER.test(receiver);
  const real = owners.filter((o) => o !== "Custom");
  if (DISTINCTIVE.has(method)) return real.length === 1 ? real[0] : (owners.includes("Custom") ? "Custom" : real[0]);
  if (flaggy) return owners.includes("Custom") ? "Custom" : real[0];
  return null;
}

function detectSdks(text) {
  const imports = text.split("\n").filter((l) => /^\s*(import|from|use|require|using|extern crate)\b|require\(|import\(|^\s*"[\w.\/-]+"\s*$/.test(l)).join("\n");
  return Object.entries(PROVIDERS).filter(([n, p]) => n !== "Custom" && p.imports.test(imports)).map(([n]) => n);
}

function collectConstants(text, map) {
  const re = /\b([A-Z][A-Z0-9_]{2,}|(?:[A-Za-z_]\w*)?(?:Flag|Feature|Toggle|FLAG|FEATURE|TOGGLE)\w*)\s*(?::\s*[&'\w<>\[\]?]+\s*)?(?::=|=)\s*(["'])([\w.\-:]+)\2/g;
  for (const m of text.matchAll(re)) {
    if (map.has(m[1]) && map.get(m[1]) !== m[3]) map.set(m[1], null);
    else map.set(m[1], m[3]);
  }
}

function collectEnums(text, rel, enums, decls) {
  const re = /\benum\s+(?:class\s+)?(\w+)\s*(?:\([^)]*\))?\s*(?:implements\s+([\w.,\s]+?)|:\s*([\w.,\s()]+?))\s*\{/g;
  const at = lineIndex(text);
  for (const m of text.matchAll(re)) {
    const parents = (m[2] || m[3] || "");
    if (!/\bFeature\b/.test(parents)) continue;
    enums.add(m[1]);
    const bodyStart = m.index + m[0].length;
    const end = text.slice(bodyStart).search(/[;}]/);
    const body = text.slice(bodyStart, bodyStart + (end === -1 ? 0 : end)).replace(/@\w+(\([^)]*\))?/g, "").replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, "");
    let offset = bodyStart;
    for (const part of body.split(",")) {
      const c = part.match(/^\s*([A-Z][A-Z0-9_]*)\b/);
      if (c) {
        const pos = text.indexOf(c[1], offset);
        decls.push({ name: c[1], value: null, line: at(pos), source: "togglz enum", provider: "Togglz", file: rel, enumName: m[1] });
        offset = pos + c[1].length;
      }
    }
  }
}

function scanCode(text, rel, ctx) {
  const refs = [];
  const dynamics = [];
  const lines = text.split("\n");
  const at = lineIndex(text);
  const sdks = detectSdks(text);
  const push = (pos, name, provider, kind) => {
    const line = at(pos);
    const code = lines[line - 1] || "";
    if (isCommentLine(code)) return;
    refs.push({ name, provider, file: rel, line, code: code.trim().slice(0, 180), kind });
  };
  for (const m of text.matchAll(CALL_RE)) {
    const [, receiver, method] = m;
    const provider = providerFor(method, receiver, sdks);
    if (!provider) continue;
    const args = splitArgs(text, m.index + m[0].length);
    const pinfo = PROVIDERS[provider];
    let key = null;
    if (pinfo.keyArg === "second" && args.length >= 2) key = literal(args[1]);
    else key = literal(args[0]) ?? (args.length > 1 && !literal(args[0]) ? literal(args[1]) : null);
    if (provider === "Flipt" && !key) continue;
    if (key) { push(m.index, key, provider, "call"); continue; }
    const first = (args[0] || "").trim();
    const ident = first.match(/^(?:[\w$]+(?:\.|::))*([A-Za-z_]\w*)$/);
    if (ident && ctx.constants.get(ident[1])) { push(m.index, ctx.constants.get(ident[1]), provider, "constant"); continue; }
    if (ident && ctx.enums.size && first.split(/\.|::/).some((p) => ctx.enums.has(p))) continue;
    if (!first || provider === "Custom" && !DISTINCTIVE.has(method) && !(receiver && FLAGGY_RECEIVER.test(receiver))) continue;
    const line = at(m.index);
    if (isCommentLine(lines[line - 1] || "")) continue;
    if (/^(this|self|it|_)$/.test(first) || /^[a-z]\w*$/.test(first) && args.length === 1 && !/key|flag|name|feature|toggle/i.test(first) && provider === "Custom") continue;
    dynamics.push({ file: rel, line, code: (lines[line - 1] || "").trim().slice(0, 180), provider, expression: args.join(", ").slice(0, 120), prefix: args.map(dynamicPrefix).find(Boolean) || null });
  }
  for (const m of text.matchAll(/\bff4j\s*\.\s*(?:check|getFeature|exist|enable|disable)\s*\(\s*["']([^"']+)["']/g)) push(m.index, m[1], "FF4J", "call");
  for (const m of text.matchAll(/@Flip\s*\(\s*name\s*=\s*"([^"]+)"/g)) push(m.index, m[1], "FF4J", "annotation");
  for (const m of text.matchAll(/@FeatureGate\s*\(\s*(?:feature\s*=\s*)?"([^"]+)"/g)) push(m.index, m[1], "Azure App Configuration", "annotation");
  for (const m of text.matchAll(/\b(?:FlagKey|flagKey|flag_key)\s*[:=]\s*["']([\w.\-:]+)["']/g)) push(m.index, m[1], "Flipt", "call");
  for (const m of text.matchAll(/@ConditionalOnProperty\s*\(([^)]*)\)/g)) {
    const prefix = (m[1].match(/prefix\s*=\s*"([^"]+)"/) || [])[1];
    const names = [...m[1].matchAll(/(?:name|value)\s*=\s*\{?\s*((?:"[^"]+"\s*,?\s*)+)\}?/g)].flatMap((x) => [...x[1].matchAll(/"([^"]+)"/g)].map((y) => y[1]));
    const bare = m[1].match(/^\s*"([^"]+)"\s*$/);
    for (const n of bare ? [bare[1]] : names) {
      const name = flagPath((prefix ? prefix + "." + n : n).split("."));
      if (name) push(m.index, name, "Spring properties", "annotation");
    }
  }
  for (const m of text.matchAll(CONFIG_TOKEN)) {
    if (!/@ConditionalOnProperty/.test(lines[at(m.index) - 1] || "")) push(m.index, m[2], "Config", "config key");
  }
  for (const m of text.matchAll(ENV_TOKEN)) push(m.index, m[1] || m[2], "Env vars", "env");
  for (const m of text.matchAll(/(?:#\[cfg|cfg!|cfg_attr)\s*\(?[^\]\n]*?feature\s*=\s*"([\w\-]+)"/g)) push(m.index, m[1], "Cargo features", "cfg");
  for (const m of text.matchAll(OBJECT_ACCESS)) {
    const name = m[2] || m[5];
    if (!name || ACCESS_STOP.has(name)) continue;
    push(m.index, name, "Custom", "property");
  }
  if (ctx.enums.size) {
    const re = new RegExp("\\b(" + [...ctx.enums].join("|") + ")\\s*(?:\\.|::)\\s*([A-Z][A-Z0-9_]*)\\b", "g");
    for (const m of text.matchAll(re)) push(m.index, m[2], "Togglz", "enum");
  }
  const seen = new Set();
  refs.sort((a, b) => (a.provider === "Custom") - (b.provider === "Custom"));
  const deduped = refs.filter((r) => {
    const k = r.file + ":" + r.line + ":" + normalize(r.name);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return { refs: deduped, dynamics };
}

function blameAges(root, rel, now) {
  try {
    const out = execFileSync("git", ["blame", "--line-porcelain", "--", rel], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024 });
    const ages = [];
    let committed = true;
    for (const l of out.split("\n")) {
      if (/^[0-9a-f]{40} /.test(l)) committed = !l.startsWith("0000000000000000000000000000000000000000");
      if (l.startsWith("author-time ")) ages.push(committed ? Math.floor((now - Number(l.slice(12)) * 1000) / 86400000) : null);
    }
    return ages;
  } catch {
    return null;
  }
}

async function readEvalLogs(paths, root) {
  const files = [];
  for (const raw of paths) {
    const m = raw.match(/^(front|back):(.+)$/);
    const side = m ? m[1] : null;
    const abs = resolve(root, m ? m[2] : raw);
    const st = await stat(abs).catch(() => null);
    if (!st) continue;
    if (st.isDirectory()) files.push(...(await walk(abs)).filter((f) => /\.(log|jsonl|json|txt|out)$/i.test(f)).map((f) => ({ f, side })));
    else files.push({ f: abs, side });
  }
  const evals = new Map();
  let first = null;
  for (const { f, side } of files) {
    const text = await readFile(f, "utf8").catch(() => "");
    for (const line of text.split("\n")) {
      if (!/flag[_.\- ]?evaluat|feature[_.\- ]?flag[_.\- ]?evaluat/i.test(line)) continue;
      const flag = (line.match(/"flag(?:Key|_key|Name|_name)?"\s*:\s*"([^"]+)"/) || line.match(/\bflag(?:Key|_key)?=([\w.\-:]+)/) || [])[1];
      if (!flag) continue;
      const ts = (line.match(/"(?:@timestamp|timestamp|time|ts)"\s*:\s*"([^"]+)"/) || line.match(/(\d{4}-\d{2}-\d{2}[T ][\d:.]+(?:Z|[+-]\d{2}:?\d{2})?)/) || [])[1];
      const value = (line.match(/"(?:value|result|enabled)"\s*:\s*(true|false|"[^"]*")/) || [])[1];
      const key = (side || "any") + ":" + normalize(flag);
      const cur = evals.get(key) || { count: 0, last: null, values: {} };
      cur.count++;
      const t = ts ? Date.parse(ts) : NaN;
      if (!Number.isNaN(t) && (!cur.last || t > Date.parse(cur.last))) cur.last = new Date(t).toISOString();
      if (!Number.isNaN(t) && (first === null || t < first)) first = t;
      if (value) cur.values[value.replace(/"/g, "")] = (cur.values[value.replace(/"/g, "")] || 0) + 1;
      evals.set(key, cur);
    }
  }
  return { files: files.map(({ f, side }) => (side ? side + ":" : "") + (relative(root, f) || f)), evals, first };
}

function valueState(values) {
  const v = values.filter((x) => x !== null && x !== undefined);
  if (!v.length) return "unknown";
  if (v.every((x) => x === true)) return "on";
  if (v.every((x) => x === false)) return "off";
  if (v.some((x) => typeof x !== "boolean")) return "variant";
  return "mixed";
}

export async function scan(rootArg, opts = {}) {
  const root = resolve(rootArg);
  const now = opts.now ? Date.parse(opts.now) : Date.now();
  const o = { front: opts.front || [], back: opts.back || [] };
  const files = await walk(root);
  const texts = new Map();
  const decls = [];
  const ctx = { constants: new Map(), enums: new Set() };
  const languages = new Set();
  for (const f of files) {
    const kind = kindOf(f);
    if (!kind) continue;
    const text = await readFile(f, "utf8").catch(() => null);
    if (text === null || text.length > 2_000_000) continue;
    const rel = relative(root, f);
    texts.set(rel, { kind, text });
    if (kind === "code") {
      languages.add(extname(f).slice(1));
      collectConstants(text, ctx.constants);
      collectEnums(text, rel, ctx.enums, decls);
      continue;
    }
    const parsed = kind === "yaml" ? parseYaml(text) : kind === "properties" ? parseProperties(text) : kind === "hocon" ? parseHocon(text) : kind === "toml" ? parseToml(text, false) : kind === "cargo" ? parseToml(text, true) : kind === "env" ? parseEnv(text) : kind === "json" ? parseJson(text) : parseXml(text);
    for (const d of parsed) decls.push({ ...d, file: rel, provider: d.provider || (d.source === "env" || d.source === "env list" ? "Env vars" : d.source === "json" ? "Flag file" : "Config") });
  }
  const refs = [];
  const dynamics = [];
  for (const [rel, { kind, text }] of texts) {
    if (kind !== "code") continue;
    const r = scanCode(text, rel, ctx);
    refs.push(...r.refs);
    dynamics.push(...r.dynamics);
  }
  const declLines = new Map();
  for (const d of decls) {
    if (!declLines.has(d.file)) declLines.set(d.file, blameAges(root, d.file, now));
    const ages = declLines.get(d.file);
    d.ageDays = ages ? ages[d.line - 1] ?? null : null;
    d.side = sideOf(d.file, o);
  }
  for (const r of refs) { r.side = sideOf(r.file, o); r.test = isTestFile(r.file); }
  for (const d of dynamics) d.side = sideOf(d.file, o);
  const { files: evalFiles, evals, first } = await readEvalLogs(opts.evalLogs || [], root);
  const flags = new Map();
  const entry = (side, name) => {
    const id = side + ":" + normalize(name);
    if (!flags.has(id)) flags.set(id, { id, side, key: normalize(name), name, declarations: [], references: [], providers: new Set() });
    return flags.get(id);
  };
  for (const d of decls) {
    const f = entry(d.side, d.name);
    f.declarations.push({ file: d.file, line: d.line, value: d.value, source: d.source, provider: d.provider, ageDays: d.ageDays, code: lineText(texts.get(d.file).text.split("\n"), d.line) });
    f.providers.add(d.provider);
  }
  for (const r of refs) {
    const own = flags.get(r.side + ":" + normalize(r.name));
    const other = flags.get((r.side === "front" ? "back" : "front") + ":" + normalize(r.name));
    const f = own || entry(r.side, r.name);
    if (!own && other && !f.declarations.length) f.declaredOn = other.side;
    f.references.push({ file: r.file, line: r.line, code: r.code, provider: r.provider, kind: r.kind, test: r.test });
    f.providers.add(r.provider);
  }
  for (const p of opts.exports || []) {
    const abs = resolve(root, p);
    const text = await readFile(abs, "utf8");
    const parsed = /\.ya?ml$/i.test(abs) ? parseYaml(text) : parseJson(text);
    for (const d of parsed) {
      const decl = { file: relative(root, abs), line: d.line, value: d.value, source: "provider export", provider: "Provider export", ageDays: null, code: lineText(text.split("\n"), d.line) };
      const hits = [...flags.values()].filter((f) => f.key === normalize(d.name));
      const targets = hits.length ? hits : [entry(opts.exportSide || "back", d.name)];
      for (const f of targets) { f.declarations.push(decl); f.providers.add("Provider export"); }
    }
  }
  const list = [...flags.values()].filter((f) => f.declarations.length || f.references.some((r) => !r.test)).map((f) => {
    const codeRefs = f.references.filter((r) => !r.test);
    const ages = f.declarations.map((d) => d.ageDays).filter((a) => a !== null && a !== undefined);
    const dyn = dynamics.filter((d) => d.side === f.side && d.prefix && f.key.startsWith(normalize(d.prefix)) && normalize(d.prefix).length >= 2);
    let status;
    const ev = evals.get(f.side + ":" + f.key) || evals.get("any:" + f.key) || null;
    const saas = codeRefs.some((r) => !LOCAL_PROVIDERS.has(r.provider));
    if (!f.declarations.length && !f.declaredOn && saas) f.declaredOn = "provider";
    if (codeRefs.length && (f.declarations.length || f.declaredOn)) status = "used";
    else if (codeRefs.length) status = "ghost";
    else if (dyn.length && ev) status = "used";
    else if (dyn.length) status = "maybe-dynamic";
    else if (f.references.length) status = "test-only";
    else status = "unused";
    const note = status === "used" && !codeRefs.length ? "Read through the dynamic key " + dyn[0].expression + " and confirmed by " + ev.count + " evaluations in the logs." : null;
    return {
      id: f.id, side: f.side, name: f.name, key: f.key, status,
      value: valueState(f.declarations.map((d) => d.value)),
      providers: [...f.providers].sort(),
      declaredOn: f.declaredOn || null,
      note,
      ageDays: ages.length ? Math.max(...ages) : null,
      declarations: f.declarations, references: f.references,
      dynamicMatches: dyn.map((d) => ({ file: d.file, line: d.line, expression: d.expression, prefix: d.prefix })),
      evaluations: ev ? { count: ev.count, last: ev.last, values: ev.values, daysSinceLast: ev.last ? Math.floor((now - Date.parse(ev.last)) / 86400000) : null } : null
    };
  }).sort((a, b) => a.side.localeCompare(b.side) || a.name.localeCompare(b.name));
  return {
    tool: "feature-flags-catalog", generatedAt: new Date(now).toISOString(), root: basename(root),
    languages: [...languages].sort(), evalLogs: { files: evalFiles, enabled: (opts.evalLogs || []).length > 0, windowDays: 21, coverageDays: first === null ? 0 : Math.floor((now - first) / 86400000) },
    flags: list, dynamics, review: []
  };
}

function summary(data) {
  const c = (side, pred) => data.flags.filter((f) => f.side === side && pred(f)).length;
  const row = (side) => ({ total: c(side, () => true), used: c(side, (f) => f.status === "used"), unused: c(side, (f) => f.status !== "used" && f.status !== "ghost"), ghost: c(side, (f) => f.status === "ghost") });
  return { front: row("front"), back: row("back"), dynamics: data.dynamics.length, providers: [...new Set(data.flags.flatMap((f) => f.providers))].sort() };
}

export async function render(outDir) {
  const data = JSON.parse(await readFile(join(outDir, "flags.json"), "utf8"));
  const review = JSON.parse(await readFile(join(outDir, "review.json"), "utf8").catch(() => "[]"));
  for (const r of review) {
    const f = data.flags.find((x) => (!r.side || x.side === r.side) && (x.key === normalize(r.name) || x.name === r.name));
    if (!f) continue;
    if (r.status) f.status = r.status;
    if (r.note) f.note = r.note;
  }
  data.review = review;
  const template = await readFile(join(HERE, "..", "assets", "template.html"), "utf8");
  const json = JSON.stringify(data).replace(/</g, "\\x3c");
  const html = template.replace("/*__DATA__*/null", () => json);
  const file = join(outDir, "index.html");
  await writeFile(file, html);
  return file;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.cmd === "scan") {
    const root = args.positional[0] || ".";
    const out = resolve(args.out || join(tmpdir(), "feature-flags-catalog-" + basename(resolve(root))));
    await mkdir(out, { recursive: true });
    const data = await scan(root, { front: args.front, back: args.back, evalLogs: args.evalLogs, exports: args.exports, exportSide: args.exportSide, now: args.now });
    await writeFile(join(out, "flags.json"), JSON.stringify(data, null, 2));
    process.stdout.write(JSON.stringify({ out, flagsJson: join(out, "flags.json"), languages: data.languages, ...summary(data) }, null, 2) + "\n");
  } else if (args.cmd === "render") {
    const file = await render(resolve(args.positional[0]));
    process.stdout.write(file + "\n");
  } else {
    process.stderr.write("usage: catalog.mjs scan <root> [--out dir] [--front dirs] [--back dirs] [--eval-log path]... [--export file]... [--export-side front|back] | render <outDir>\n");
    process.exit(2);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { process.stderr.write(String(e && e.stack || e) + "\n"); process.exit(1); });
}
