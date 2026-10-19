const { contextBridge, ipcRenderer } = require("electron");

const channels = ["goto-tab", "open-search", "open-shortcuts", "toast", "boot"];

contextBridge.exposeInMainWorld("nightDesktop", {
  on: (channel, handler) => {
    if (!channels.includes(channel)) return;
    ipcRenderer.on(channel, (_event, payload) => handler(payload));
  },
  refresh: () => ipcRenderer.invoke("refresh"),
  toggleMaximize: () => ipcRenderer.invoke("toggle-maximize"),
  dragStart: () => ipcRenderer.send("drag-start"),
  dragMove: () => ipcRenderer.send("drag-move"),
  dragEnd: () => ipcRenderer.send("drag-end"),
});
