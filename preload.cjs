/**
 * 空调制冷量计算器 — 预加载脚本
 * Electron 28 CJS 模式
 */

const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("windowControls", {
  minimize: () => ipcRenderer.send("window:minimize"),
  close: () => ipcRenderer.send("window:close"),
});

contextBridge.exposeInMainWorld("appInfo", {
  name: "空调制冷量计算器",
  version: "1.0.0",
});
