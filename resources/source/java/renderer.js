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

    // Start menu button functionality
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
            } else if (action === 'position') {
                // Reset window to original position
                const screenWidth = window.screen.availWidth;
                const screenHeight = window.screen.availHeight;
                const windowWidth = 400;
                const windowHeight = 600;
                const margin = 20;

                // Calculate position (bottom right with margin)
                const x = screenWidth - windowWidth - margin;
                const y = screenHeight - windowHeight - margin;

                // Send position to main process
                window.electronAPI.resetPosition({ x, y });
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

    // Initialize programs list
    initializeProgramsList();

    // Window control event listeners
    minimizeButton.addEventListener('click', () => {
        window.electronAPI.minimizeWindow();
    });

    closeButton.addEventListener('click', () => {
        window.electronAPI.closeWindow();
    });

    // Initialize slash commands
    initializeSlashCommands();

    // Initialize drive info
    initializeDriveInfo();

    // Initialize Metro interface
    initializeStartMenu();

    // Initialize settings
    initializeSettings();

    // Initialize calculator
    initializeCalculator();

    // Add horizontal scroll support for systems menu footer
    const systemsMenuFooter = document.querySelector('.systems-menu-footer');
    if (systemsMenuFooter) {
        systemsMenuFooter.addEventListener('wheel', (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                systemsMenuFooter.scrollLeft += e.deltaY;
            }
        });
    }
});
