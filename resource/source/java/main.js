'use strict';

const { app, BrowserWindow, ipcMain, Tray, Menu, Notification } = require('electron');
const path = require('path');

let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    resizable: false,
    frame: false,
    icon: path.join(__dirname, '../../assets/images/favicons/favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const indexPath = path.join(__dirname, '..', 'index.html');
  mainWindow.loadFile(indexPath);
}

function updateTrayMenu() {
  const menuTemplate = [];

  // Add Show/Hide based on window visibility
  if (!mainWindow.isVisible()) {
    menuTemplate.push({
      label: 'Show',
      click: () => {
        mainWindow.show();
      }
    });
  } else {
    menuTemplate.push({
      label: 'Hide',
      click: () => {
        mainWindow.hide();
        showNotification();
      }
    });
  }

  menuTemplate.push(
    { type: 'separator' },
    {
      label: 'Close',
      click: () => {
        app.quit();
      }
    }
  );

  const contextMenu = Menu.buildFromTemplate(menuTemplate);
  tray.setContextMenu(contextMenu);
}

function createTray() {
  tray = new Tray(path.join(__dirname, '../../assets/images/favicons/favicon.ico'));
  
  tray.setToolTip('Electron App');
  updateTrayMenu();

  // Double click on tray icon shows the window
  tray.on('double-click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
      showNotification();
    } else {
      mainWindow.show();
    }
  });

  // Update menu when window state changes
  mainWindow.on('show', updateTrayMenu);
  mainWindow.on('hide', updateTrayMenu);
}

function showNotification() {
  const notification = new Notification({
    title: 'App Minimized',
    body: 'App is running in the system tray',
    icon: path.join(__dirname, '../../assets/images/favicons/favicon.ico')
  });
  notification.show();
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Handle window controls
  ipcMain.on('minimize-window', () => {
    mainWindow.hide();
    showNotification();
  });

  ipcMain.on('close-window', () => {
    app.quit();
  });

  // Prevent window from being destroyed when closed
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
    return true;
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit the app when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Clean up before quitting
app.on('before-quit', () => {
  app.isQuitting = true;
});
