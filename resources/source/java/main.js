'use strict';

const { app, BrowserWindow, ipcMain, Tray, Menu, Notification, screen, shell } = require('electron');
const path = require('path');
const fs = require('fs');

app.name = 'PEARDESK';

let mainWindow;
let tray;

// Add auto-start functionality
function setAutoStart(enabled) {
    if (process.platform === 'win32') {
        app.setLoginItemSettings({
            openAtLogin: enabled,
            path: process.execPath,
            args: ['--minimized']
        });
    }
}

// Function to load settings and apply auto-start
function loadAndApplySettings() {
    try {
        const settingsPath = path.join(__dirname, '../../../resources/configs/settings.json');
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        
        // Apply auto-start setting
        setAutoStart(settings.behavior.autoStart);
        
        // Apply always on top setting
        mainWindow.setAlwaysOnTop(settings.behavior.alwaysOnTop);
        
        return settings;
    } catch (error) {
        console.error('Error loading settings:', error);
        return null;
    }
}

// Add IPC handler for settings changes
ipcMain.on('settings-updated', () => {
    loadAndApplySettings();
});

function createWindow() {
  // Get primary display dimensions
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  
  // Create the window
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    resizable: false,
    movable: true,
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
    // Load settings to check showNotify state
    try {
        const settingsPath = path.join(__dirname, '../../../resources/configs/settings.json');
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        
        // Only show notification if showNotify is true
        if (settings.behavior.showNotify) {
            const notification = new Notification({
                title: 'App Minimized',
                body: 'App is running in the system tray',
                icon: path.join(__dirname, '../../assets/images/favicons/favicon.ico')
            });
            notification.show();
        }
    } catch (error) {
        console.error('Error checking notification settings:', error);
    }
}

app.whenReady().then(() => {
  // Load and apply settings on startup
  loadAndApplySettings();
  
  createWindow();
  createTray();

  // Handle window controls
  ipcMain.on('minimize-window', () => {
    handleMinimize();
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

  // Add handler for opening folders
  ipcMain.on('open-folder', (_, folderName) => {
    const userDataPath = path.join(__dirname, '../../../storage/userdata');
    const folderPath = path.join(userDataPath, folderName.toLowerCase());
    
    // Create folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    // Open folder in explorer
    shell.openPath(folderPath)
      .then(() => console.log(`Opened ${folderName} folder`))
      .catch(err => console.error(`Error opening ${folderName} folder:`, err));
  });

  ipcMain.on('reset-position', (_, position) => {
    mainWindow.setPosition(position.x, position.y);
  });

  // Add handler for settings changes
  ipcMain.on('settings-updated', () => {
    const settings = loadAndApplySettings();
    if (settings) {
      // Apply window settings immediately
      mainWindow.setAlwaysOnTop(settings.behavior.alwaysOnTop);
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

// Update the minimize window functionality
function handleMinimize() {
    try {
        const settingsPath = path.join(__dirname, '../../../resources/configs/settings.json');
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        
        if (settings.window.minimizeTray) {
            // Minimize to tray
            mainWindow.hide();
            showNotification();
        } else {
            // Normal minimize to taskbar
            mainWindow.minimize();
        }
    } catch (error) {
        console.error('Error checking minimize settings:', error);
        // Default to normal minimize if error
        mainWindow.minimize();
    }
}
