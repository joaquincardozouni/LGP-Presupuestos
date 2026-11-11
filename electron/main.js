import { app, BrowserWindow, shell, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import net from 'net';
import electronUpdater from 'electron-updater';

const { autoUpdater } = electronUpdater;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure user data directory for persistent data in packaged app
const userDataPath = app.getPath('userData');
const appDataDir = path.join(userDataPath, 'data');
if (!fs.existsSync(appDataDir)) {
  fs.mkdirSync(appDataDir, { recursive: true });
}
process.env.LGP_DATA_DIR = appDataDir;

let mainWindow = null;
let activePort = 3001;

// Function to find an open port or fallback to OS assigned port
function findFreePort(startPort = 3001) {
  return new Promise((resolve) => {
    const testServer = net.createServer();
    testServer.once('error', () => {
      const fallbackServer = net.createServer();
      fallbackServer.once('error', () => resolve(3001));
      fallbackServer.listen(0, '127.0.0.1', () => {
        const port = fallbackServer.address().port;
        fallbackServer.close(() => resolve(port));
      });
    });
    testServer.listen(startPort, '127.0.0.1', () => {
      const port = testServer.address().port;
      testServer.close(() => resolve(port));
    });
  });
}

async function startServer() {
  activePort = await findFreePort(3001);
  process.env.PORT = String(activePort);
  await import('../server/index.js');
}

// CONFIGURE AUTO UPDATER (Manual control as requested)
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

function setupUpdaterEvents() {
  autoUpdater.on('checking-for-update', () => {
    if (mainWindow) {
      mainWindow.webContents.send('updater-event', { status: 'checking', message: 'Buscando actualizaciones...' });
    }
  });

  autoUpdater.on('update-available', (info) => {
    if (mainWindow) {
      mainWindow.webContents.send('updater-event', { 
        status: 'available', 
        version: info.version,
        message: `Nueva versión disponible: v${info.version}` 
      });
    }
  });

  autoUpdater.on('update-not-available', (info) => {
    if (mainWindow) {
      mainWindow.webContents.send('updater-event', { 
        status: 'not-available', 
        message: 'El programa está actualizado a la última versión.' 
      });
    }
  });

  autoUpdater.on('error', (err) => {
    if (mainWindow) {
      mainWindow.webContents.send('updater-event', { 
        status: 'error', 
        message: 'No se pudo conectar con el servidor de actualizaciones o repositorio aún no publicado.' 
      });
    }
  });

  autoUpdater.on('download-progress', (progressObj) => {
    if (mainWindow) {
      mainWindow.webContents.send('updater-event', { 
        status: 'downloading', 
        percent: Math.round(progressObj.percent),
        message: `Descargando actualización: ${Math.round(progressObj.percent)}%` 
      });
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    if (mainWindow) {
      mainWindow.webContents.send('updater-event', { 
        status: 'downloaded', 
        version: info.version,
        message: `Actualización v${info.version} descargada y lista para instalar.` 
      });
    }
  });
}

// IPC Handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('check-for-updates', async () => {
  try {
    return await autoUpdater.checkForUpdates();
  } catch (err) {
    if (mainWindow) {
      mainWindow.webContents.send('updater-event', { 
        status: 'error', 
        message: 'No se pudo comprobar actualizaciones en este momento.' 
      });
    }
    return { error: err.message };
  }
});

ipcMain.handle('download-update', async () => {
  try {
    return await autoUpdater.downloadUpdate();
  } catch (err) {
    if (mainWindow) {
      mainWindow.webContents.send('updater-event', { 
        status: 'error', 
        message: 'Error al descargar la actualización.' 
      });
    }
    return { error: err.message };
  }
});

ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall();
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: 'LGP - Presupuestos y Tarifas',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL(`http://localhost:${activePort}`);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    await startServer();
    setupUpdaterEvents();
    createWindow();
  } catch (err) {
    console.error('Error starting app:', err);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
