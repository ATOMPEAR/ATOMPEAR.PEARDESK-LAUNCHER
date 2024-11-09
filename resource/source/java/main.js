'use strict';

const { app, BrowserWindow, ipcMain, Tray, Menu, Notification, screen } = require('electron');
const path = require('path');

app.name = 'PEARDESK';

let mainWindow;
let tray;

function createWindow() {
  // Get primary display dimensions
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  
  // Create the window
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    resizable: false,
    movable: false,
    frame: false,
    title: 'PEARDESK',
    maximizable: false,
    minimizable: true,
    icon: path.join(__dirname, '../../assets/images/favicons/favicon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js')
    },
    x: screenWidth - 400 - 20,
    y: screenHeight - 600 - 20
  });

  mainWindow.setTitle('PEARDESK');

  // Prevent double-click from maximizing window
  mainWindow.setMaximizable(false);

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
  
  tray.setToolTip('PEARDESK');
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

  // Add new resize handler
  ipcMain.on('resize-window', (_, { width, height, moveX }) => {
    const [currentX, currentY] = mainWindow.getPosition();
    mainWindow.setBounds({
      width: width,
      height: height,
      x: currentX + moveX,
      y: currentY
    }, true); // true enables animation
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

  ipcMain.on('options-action', (_, action) => {
    switch(action) {
      case 'snap-position':
        // Handle snap position action
        console.log('Snap position clicked');
        break;
      case 'quick-commands':
        // Handle quick commands action
        console.log('Quick commands clicked');
        break;
    }
  });

  // Add IPC handlers for program-related actions
  ipcMain.on('launch-program', (event, program) => {
    console.log('Launching program:', program);
    // Add program launch logic here
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
