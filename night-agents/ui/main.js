const { app, BrowserWindow, Menu, ipcMain, screen, shell } = require("electron");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const NIGHT_HOME = process.env.NIGHT_AGENTS_HOME || path.join(os.homedir(), ".night-agents");
const CORE = fs.existsSync(path.join(__dirname, "core")) ? path.join(__dirname, "core") : path.join(__dirname, "..", "bin");
const STATE_FILE = path.join(app.getPath("userData"), "window-state.json");
const DEFAULT_STATE = { width: 1320, height: 880, fullScreen: false, maximized: false };
const TAB_COUNT = 5;

let win = null;
let restoreBounds = null;
let dragOrigin = null;

function readState() {
  try {
    return { ...DEFAULT_STATE, ...JSON.parse(fs.readFileSync(STATE_FILE, "utf8")) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function visibleOnSomeDisplay(bounds) {
  return screen.getAllDisplays().some((d) => {
    const a = d.workArea;
    return bounds.x < a.x + a.width && bounds.x + bounds.width > a.x && bounds.y < a.y + a.height && bounds.y + bounds.height > a.y;
  });
}

function saveState() {
  if (!win || win.isDestroyed()) return;
  const fullScreen = win.isFullScreen();
  const previous = readState();
  const bounds = fullScreen ? previous : restoreBounds || win.getBounds();
  const state = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    fullScreen,
    maximized: Boolean(restoreBounds),
  };
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state));
}

function send(channel, payload) {
  if (win && !win.isDestroyed()) win.webContents.send(channel, payload);
}

function boot(step, status, detail) {
  send("boot", { step, status, detail });
}

function zoom(delta) {
  win.webContents.setZoomLevel(delta === 0 ? 0 : win.webContents.getZoomLevel() + delta);
}

function toggleMaximize() {
  if (!win) return;
  if (win.isFullScreen()) return;
  if (restoreBounds) {
    win.setBounds(restoreBounds);
    restoreBounds = null;
  } else {
    restoreBounds = win.getBounds();
    win.setBounds(screen.getDisplayMatching(restoreBounds).workArea);
  }
  saveState();
}

function dragStart() {
  if (!win || win.isFullScreen()) return;
  const [x, y] = win.getPosition();
  dragOrigin = { x, y, cursor: screen.getCursorScreenPoint() };
}

function dragMove() {
  if (!dragOrigin || !win || win.isDestroyed()) return;
  const point = screen.getCursorScreenPoint();
  const dx = point.x - dragOrigin.cursor.x;
  const dy = point.y - dragOrigin.cursor.y;
  if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
  restoreBounds = null;
  win.setPosition(dragOrigin.x + dx, dragOrigin.y + dy);
}

function dragEnd() {
  if (!dragOrigin) return;
  dragOrigin = null;
  saveState();
}

async function captureScreen() {
  const image = await win.webContents.capturePage();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const target = path.join(os.homedir(), "Desktop", `night-agents-${stamp}.png`);
  fs.writeFileSync(target, image.toPNG());
  send("toast", `Capture saved to ${target}`);
  shell.showItemInFolder(target);
}

function countRuns() {
  const runs = path.join(NIGHT_HOME, "runs");
  if (!fs.existsSync(runs)) return 0;
  let total = 0;
  for (const day of fs.readdirSync(runs)) {
    const dayDir = path.join(runs, day);
    if (!fs.statSync(dayDir).isDirectory()) continue;
    for (const project of fs.readdirSync(dayDir)) {
      const projectDir = path.join(dayDir, project);
      if (fs.statSync(projectDir).isDirectory()) total += fs.readdirSync(projectDir).length;
    }
  }
  return total;
}

function runGenerator(total) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(CORE, "generate.js")], {
      env: { ...process.env, ELECTRON_RUN_AS_NODE: "1", NIGHT_PROGRESS: "1", NIGHT_AGENTS_HOME: NIGHT_HOME, PATH: `${process.env.PATH || ""}:/usr/bin:/bin:/opt/homebrew/bin:/usr/local/bin` },
    });
    let done = 0;
    let errors = "";
    child.stdout.on("data", (chunk) => {
      done += (String(chunk).match(/^indexed /gm) || []).length;
      boot("index", "busy", `${done}/${total}`);
    });
    child.stderr.on("data", (chunk) => (errors += chunk));
    child.on("error", reject);
    child.on("close", (code) => (code === 0 ? resolve(done) : reject(new Error(errors.trim() || `generator exited with ${code}`))));
  });
}

async function load() {
  await win.loadFile(path.join(__dirname, "boot.html"));
  const generator = path.join(CORE, "generate.js");
  if (!fs.existsSync(generator)) {
    boot("core", "error", `missing ${generator}`);
    return;
  }
  boot("core", "ok", path.basename(CORE));
  const total = countRuns();
  boot("runs", "ok", `${total} runs`);
  boot("index", "busy", `0/${total}`);
  try {
    const done = await runGenerator(total);
    boot("index", "ok", `${done}/${total}`);
  } catch (error) {
    boot("index", "error", error.message);
    return;
  }
  boot("ui", "ok", "ready");
  await win.loadFile(path.join(NIGHT_HOME, "ui", "index.html"));
}

function buildMenu() {
  const tabs = Array.from({ length: TAB_COUNT }, (_, index) => ({
    label: `Tab ${index + 1}`,
    accelerator: `CommandOrControl+${index + 1}`,
    click: () => send("goto-tab", index),
  }));
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      { role: "appMenu" },
      {
        label: "Edit",
        submenu: [
          { role: "undo" },
          { role: "redo" },
          { type: "separator" },
          { role: "cut" },
          { role: "copy" },
          { role: "paste" },
          { role: "selectAll" },
          { type: "separator" },
          { label: "Search", accelerator: "CommandOrControl+K", click: () => send("open-search") },
        ],
      },
      {
        label: "View",
        submenu: [
          { label: "Zoom In", accelerator: "CommandOrControl+Plus", click: () => zoom(0.5) },
          { label: "Zoom In", accelerator: "CommandOrControl+=", visible: false, click: () => zoom(0.5) },
          { label: "Zoom Out", accelerator: "CommandOrControl+-", click: () => zoom(-0.5) },
          { label: "Actual Size", accelerator: "CommandOrControl+0", click: () => zoom(0) },
          { type: "separator" },
          ...tabs,
          { type: "separator" },
          { label: "Full Screen", accelerator: "CommandOrControl+Shift+Return", click: () => win.setFullScreen(!win.isFullScreen()) },
          { label: "Capture Window", accelerator: "CommandOrControl+P", click: captureScreen },
          { label: "Regenerate", accelerator: "CommandOrControl+R", click: load },
          { role: "toggleDevTools" },
        ],
      },
      { role: "windowMenu" },
      { label: "Help", submenu: [{ label: "Shortcuts", accelerator: "CommandOrControl+/", click: () => send("open-shortcuts") }] },
    ])
  );
}

function createWindow() {
  const state = readState();
  const placed = state.x !== undefined && visibleOnSomeDisplay(state);
  win = new BrowserWindow({
    x: placed ? state.x : undefined,
    y: placed ? state.y : undefined,
    width: state.width,
    height: state.height,
    minWidth: 900,
    minHeight: 600,
    show: false,
    backgroundColor: "#f9f9f7",
    titleBarStyle: "hiddenInset",
    icon: path.join(__dirname, "resources", "icon.png"),
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, nodeIntegration: false },
  });
  if (state.maximized && !state.fullScreen) {
    restoreBounds = win.getBounds();
    win.setBounds(screen.getDisplayMatching(restoreBounds).workArea);
  }
  win.once("ready-to-show", () => {
    win.show();
    if (state.fullScreen) win.setFullScreen(true);
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
  win.on("resized", () => {
    const area = screen.getDisplayMatching(win.getBounds()).workArea;
    const [width, height] = win.getSize();
    if (width !== area.width || height !== area.height) restoreBounds = null;
    saveState();
  });
  win.on("moved", saveState);
  win.on("enter-full-screen", saveState);
  win.on("leave-full-screen", saveState);
  win.on("close", saveState);
  win.on("closed", () => {
    win = null;
  });
  load();
}

ipcMain.handle("refresh", () => load());
ipcMain.handle("toggle-maximize", () => toggleMaximize());
ipcMain.on("drag-start", dragStart);
ipcMain.on("drag-move", dragMove);
ipcMain.on("drag-end", dragEnd);

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!win) return;
    if (win.isMinimized()) win.restore();
    win.focus();
  });
  app.whenReady().then(() => {
    buildMenu();
    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
  app.on("window-all-closed", () => app.quit());
}
