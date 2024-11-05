'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Add your exposed APIs here
  // Example:
  // sendMessage: (message) => ipcRenderer.send('send-message', message),
});
