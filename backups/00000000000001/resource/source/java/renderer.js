'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // Window control buttons
  const minimizeButton = document.querySelector('.titlebar-button-minimize');
  const closeButton = document.querySelector('.titlebar-button-close');

  minimizeButton.addEventListener('click', () => {
    window.electronAPI.minimizeWindow();
  });

  closeButton.addEventListener('click', () => {
    window.electronAPI.closeWindow();
  });
});
