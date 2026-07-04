const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("path");

const WEB_CLIENT_URL = process.env.NOVA_WEB_URL || "http://localhost:5173";

/**
 * NovaWorlds Launcher: a thin native shell around the web client, playing the same role
 * the Roblox desktop app plays for the Roblox website - a dedicated, always-updated window
 * with its own icon/taskbar entry, rather than a browser tab.
 */
function createMainWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    title: "NovaWorlds Launcher",
    backgroundColor: "#0f1220",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.setMenuBarVisibility(false);
  win.loadURL(WEB_CLIENT_URL);

  // Open any target="_blank" links (e.g. the editor) in the system browser instead of a new
  // Electron window, keeping the launcher focused on the platform's main game-playing surface.
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  return win;
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
