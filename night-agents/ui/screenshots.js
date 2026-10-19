const { app, BrowserWindow } = require("electron");
const fs = require("fs");
const os = require("os");
const path = require("path");

const SITE = path.join(process.env.NIGHT_AGENTS_HOME || path.join(os.homedir(), ".night-agents"), "ui", "index.html");
const OUT = path.join(__dirname, "..", "printscreens");

const SHOTS = [
  { name: "1-activity", steps: ["key:1"] },
  { name: "2-runs", steps: ["key:2"] },
  { name: "3-run-detail", steps: ["key:2", "click:[data-run]"] },
  { name: "4-branches", steps: ["key:3"] },
  { name: "5-branches-diff", steps: ["key:3", "click:#mode-diff"] },
  { name: "6-metrics", steps: ["key:4"] },
  { name: "7-agents", steps: ["key:5"] },
  { name: "8-search", steps: ["key:1", "key:k", "type:#search-input:coupon"] },
  { name: "9-shortcuts", steps: ["key:1", "key:/"] },
];

function script(step) {
  const [kind, target, value] = step.split(":");
  if (kind === "key") return `document.dispatchEvent(new KeyboardEvent("keydown", { key: ${JSON.stringify(target)}, metaKey: true, bubbles: true }))`;
  if (kind === "click") return `document.querySelector(${JSON.stringify(target)}).click()`;
  return `(() => { const el = document.querySelector(${JSON.stringify(target)}); el.value = ${JSON.stringify(value)}; el.dispatchEvent(new Event("input")); })()`;
}

function scrub(home) {
  return `(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) walker.currentNode.nodeValue = walker.currentNode.nodeValue.split(${JSON.stringify(home)}).join("~");
    document.querySelectorAll("input").forEach((el) => (el.value = el.value.split(${JSON.stringify(home)}).join("~")));
  })()`;
}

const pause =(ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.whenReady().then(async () => {
  const only = process.argv[2];
  fs.mkdirSync(OUT, { recursive: true });
  const win = new BrowserWindow({ width: 1440, height: 920, show: false, webPreferences: { offscreen: true } });
  if (only) {
    await win.loadFile(only);
    await pause(800);
    fs.writeFileSync(path.join(OUT, `${path.basename(only)}.png`), (await win.webContents.capturePage()).toPNG());
    app.quit();
    return;
  }
  for (const shot of SHOTS) {
    await win.loadFile(SITE);
    await pause(300);
    for (const step of shot.steps) {
      await win.webContents.executeJavaScript(script(step));
      await pause(250);
    }
    await win.webContents.executeJavaScript(scrub(os.homedir()));
    fs.writeFileSync(path.join(OUT, `${shot.name}.png`), (await win.webContents.capturePage()).toPNG());
    process.stdout.write(`printscreens/${shot.name}.png\n`);
  }
  app.quit();
});
