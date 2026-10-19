const { app, BrowserWindow } = require("electron");
const fs = require("fs");
const path = require("path");

const AGENTS = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "bin", "agents.json"), "utf8"));
const OUT = path.join(__dirname, "..", "bin", "site", "logos");
const SIZE = 256;

app.disableHardwareAcceleration();

function tile(agent) {
  return `<html><head><meta charset="utf-8"></head><body style="margin:0;background:transparent;overflow:hidden">
    <div style="width:${SIZE}px;height:${SIZE}px;position:relative">
      <div style="position:absolute;inset:8px;border-radius:56px;background:linear-gradient(160deg, ${agent.color} 0%, color-mix(in srgb, ${agent.color} 55%, #10142e) 100%);box-shadow:inset 0 2px 0 rgba(255,255,255,.35)"></div>
      <div style="position:absolute;right:30px;top:26px;width:34px;height:34px;border-radius:50%;box-shadow:-9px 6px 0 0 #fdf3c4"></div>
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:132px;font-family:'Apple Color Emoji';padding-top:10px">${agent.icon}</div>
    </div></body></html>`;
}

app.whenReady().then(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const win = new BrowserWindow({ width: SIZE, height: SIZE, show: false, transparent: true, frame: false, webPreferences: { offscreen: true } });
  for (const agent of AGENTS) {
    await win.loadURL(`data:text/html;base64,${Buffer.from(tile(agent)).toString("base64")}`);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const image = await win.webContents.capturePage({ x: 0, y: 0, width: SIZE, height: SIZE });
    fs.writeFileSync(path.join(OUT, `${agent.name}.png`), image.resize({ width: SIZE, height: SIZE }).toPNG());
    process.stdout.write(`logo ${agent.name}\n`);
  }
  app.quit();
});
