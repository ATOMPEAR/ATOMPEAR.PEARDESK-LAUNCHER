'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  handleOptionsAction: (action) => ipcRenderer.send('options-action', action),
  resizeWindow: (width, height, moveX) => ipcRenderer.send('resize-window', { width, height, moveX }),
});
