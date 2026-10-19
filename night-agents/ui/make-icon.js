const { app, BrowserWindow } = require("electron");
const fs = require("fs");
const path = require("path");

const SVG = path.join(__dirname, "..", "bin", "site", "logo.svg");
const OUT = path.join(__dirname, "resources", "icon.png");

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1024, height: 1024, show: false, transparent: true, frame: false, webPreferences: { offscreen: true } });
  const svg = fs.readFileSync(SVG, "utf8");
  const html = `<html><body style="margin:0;background:transparent"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}" width="1024" height="1024"></body></html>`;
  await win.loadURL(`data:text/html;base64,${Buffer.from(html).toString("base64")}`);
  await new Promise((resolve) => setTimeout(resolve, 400));
  const image = await win.webContents.capturePage({ x: 0, y: 0, width: 1024, height: 1024 });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, image.resize({ width: 1024, height: 1024 }).toPNG());
  app.quit();
});
