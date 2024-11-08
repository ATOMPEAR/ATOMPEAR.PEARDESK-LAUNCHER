'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // Window control buttons
  const minimizeButton = document.querySelector('.titlebar-button-minimize');
  const closeButton = document.querySelector('.titlebar-button-close');
  const optionsButton = document.querySelector('.titlebar-button-options');
  const optionsDropdown = document.querySelector('.options-dropdown');

  minimizeButton.addEventListener('click', () => {
    window.electronAPI.minimizeWindow();
  });

  closeButton.addEventListener('click', () => {
    window.electronAPI.closeWindow();
  });

  // Options dropdown functionality
  optionsButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = optionsButton.getAttribute('aria-expanded') === 'true';
    optionsButton.classList.toggle('active');
    optionsButton.setAttribute('aria-expanded', !isExpanded);
  });

  // Handle dropdown item clicks
  const dropdownItems = document.querySelectorAll('.options-dropdown-item');
  dropdownItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = e.target.textContent.toLowerCase().replace(' ', '-');
      window.electronAPI.handleOptionsAction(action);
      optionsButton.classList.remove('active');
      optionsButton.setAttribute('aria-expanded', 'false');
    });

    // Add keyboard navigation
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    optionsButton.classList.remove('active');
    optionsButton.setAttribute('aria-expanded', 'false');
  });
});
