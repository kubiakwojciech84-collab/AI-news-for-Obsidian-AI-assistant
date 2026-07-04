const { contextBridge } = require("electron");

// Intentionally minimal: the launcher is a thin shell, all app logic lives in the web client.
contextBridge.exposeInMainWorld("novaLauncher", {
  isDesktop: true,
});
