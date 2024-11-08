'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // Window control buttons
  const minimizeButton = document.querySelector('.titlebar-button-minimize');
  const closeButton = document.querySelector('.titlebar-button-close');
  const optionsButton = document.querySelector('.titlebar-button-options');
  const openStartButton = document.querySelector('.titlebar-button-openstart');
  const openStartIcon = openStartButton.querySelector('i');
  const mainContent1 = document.querySelector('.main-content1');
  const mainContent2 = document.querySelector('.main-content2');
  const searchCommands = document.querySelector('.search-commands');
  const content1Content = document.querySelector('.content1-content');

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
      
      if (action === 'commands') {
        searchCommands.classList.toggle('visible');
      }
      
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

  // OpenStart button functionality
  openStartButton.addEventListener('click', () => {
    mainContent1.classList.toggle('active');
    mainContent2.classList.toggle('active');
    
    // Toggle icon based on which content is active
    if (mainContent2.classList.contains('active')) {
      openStartIcon.classList.remove('fa-bars');
      openStartIcon.classList.add('fa-bars');
      openStartButton.setAttribute('aria-label', 'Go Back');
    } else {
      openStartIcon.classList.remove('fa-bars');
      openStartIcon.classList.add('fa-bars');
      openStartButton.setAttribute('aria-label', 'Open Start');
    }
  });

  // Add startmenu button functionality
  const startmenuButtons = document.querySelectorAll('.startmenu-button');
  const contentAreas = document.querySelectorAll('.content-area');

  startmenuButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and content areas
      startmenuButtons.forEach(btn => btn.classList.remove('active'));
      contentAreas.forEach(content => content.classList.remove('active'));

      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      const contentId = button.getAttribute('data-content');
      document.querySelector(`.content-area.${contentId}`).classList.add('active');
    });
  });
});
