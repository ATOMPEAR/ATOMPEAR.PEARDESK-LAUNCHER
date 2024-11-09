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

    // Programs list functionality
    function loadProgramsList() {
        const programsList = document.querySelector('.programs-list-items');
        
        if (!programsList) {
            console.error('Programs list container not found');
            return;
        }

        try {
            // Clear existing content
            programsList.innerHTML = '';

            // If electronAPI is available, load programs
            if (window.electronAPI) {
                const programs = window.electronAPI.getPrograms();
                
                if (!programs || programs.length === 0) {
                    throw new Error('No programs found');
                }

                programs.forEach(program => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <button class="programs-list-button" data-program-id="${program.id}">
                            <span class="button-text">${program.name}</span>
                            <i class="fa-solid ${program.icon}"></i>
                        </button>
                    `;

                    // Add click handler
                    const button = li.querySelector('.programs-list-button');
                    button.addEventListener('click', () => {
                        // Remove active class from all buttons
                        document.querySelectorAll('.programs-list-button').forEach(btn => {
                            btn.classList.remove('active');
                        });
                        
                        // Add active class to clicked button
                        button.classList.add('active');
                        
                        // Remove active class after a delay
                        setTimeout(() => {
                            button.classList.remove('active');
                        }, 1000);
                    });

                    programsList.appendChild(li);
                });
            }
        } catch (error) {
            console.error('Error:', error);
            programsList.innerHTML = `
                <li>
                    <button class="programs-list-button">
                        <i class="fa-solid fa-exclamation-triangle"></i>
                        <span class="button-text">Error: ${error.message}</span>
                    </button>
                </li>`;
        }
    }

    // Initialize programs list
    loadProgramsList();

    // Window control event listeners
    minimizeButton.addEventListener('click', () => {
        window.electronAPI.minimizeWindow();
    });

    closeButton.addEventListener('click', () => {
        window.electronAPI.closeWindow();
    });

    // Add search functionality with help command
    const searchInput = document.querySelector('.search-input');
    
    // Define available commands
    const commands = [
        { command: '/search', description: 'Search for programs (e.g., /search firefox)' },
        { command: '/help', description: 'Show this help menu' }
        // Add more commands here as needed
    ];

    // Function to show help menu
    function showHelpMenu() {
        const programsList = document.querySelector('.programs-list-items');
        programsList.innerHTML = `
            <li class="help-header">
                <button class="programs-list-button">
                    <span class="button-text">Available Commands:</span>
                </button>
            </li>
            ${commands.map(cmd => `
                <li>
                    <button class="programs-list-button help-command" data-command="${cmd.command}">
                        <span class="button-text">${cmd.command}</span>
                        <i class="fa-solid fa-circle-info"></i>
                    </button>
                    <div class="command-description">${cmd.description}</div>
                </li>
            `).join('')}
        `;

        // Add click handlers for command buttons
        const commandButtons = programsList.querySelectorAll('.help-command');
        commandButtons.forEach(button => {
            button.addEventListener('click', () => {
                const command = button.getAttribute('data-command');
                searchInput.value = command + ' ';
                searchInput.focus();
                
                // If it's the search command, show all programs
                if (command === '/search') {
                    loadProgramsList();
                }
            });
        });
    }

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const programButtons = document.querySelectorAll('.programs-list-button');
        
        if (searchTerm === '/help') {
            showHelpMenu();
        } else if (searchTerm.startsWith('/search ')) {
            // Reset to normal program list if it was showing help
            if (document.querySelector('.help-header')) {
                loadProgramsList();
            }
            
            const actualSearchTerm = searchTerm.replace('/search ', '');
            programButtons.forEach(button => {
                const buttonText = button.querySelector('.button-text').textContent.toLowerCase();
                const listItem = button.closest('li');
                
                if (buttonText.includes(actualSearchTerm)) {
                    listItem.style.display = 'block';
                } else {
                    listItem.style.display = 'none';
                }
            });
        } else {
            // If not a command, show all programs
            if (document.querySelector('.help-header')) {
                loadProgramsList();
            }
            programButtons.forEach(button => {
                button.closest('li').style.display = 'block';
            });
        }
    });

    // Add keyboard shortcut to focus search
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && !searchCommands.classList.contains('visible')) {
            e.preventDefault();
            searchCommands.classList.add('visible');
            searchInput.focus();
            searchInput.value = '/search '; // Pre-fill with search command
        } else if (e.key === 'Escape' && searchCommands.classList.contains('visible')) {
            searchCommands.classList.remove('visible');
            searchInput.value = '';
            // Reset visibility of all program items
            const programButtons = document.querySelectorAll('.programs-list-button');
            programButtons.forEach(button => {
                button.closest('li').style.display = 'block';
            });
        }
    });

    // Update placeholder text
    searchInput.setAttribute('placeholder', 'TYPE /HELP FOR LIST OF COMMANDS');

    // Add system menu button functionality
    const systemMenuButtons = document.querySelectorAll('.systems-menu-button');

    systemMenuButtons.forEach(button => {
        button.addEventListener('click', () => {
            const folderName = button.querySelector('.button-text').textContent;
            console.log(`Opening ${folderName} folder...`);
            
            // Add active state to clicked button
            systemMenuButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Remove active state after a delay
            setTimeout(() => {
                button.classList.remove('active');
            }, 1000);
            
            window.electronAPI.openFolder(folderName);
        });
    });

    // Drive space indicator
    async function updateDriveSpace() {
        const footer = document.querySelector('.content1-footer');
        
        try {
            const driveSpace = await window.electronAPI.getDriveSpace();
            if (!driveSpace) throw new Error('Could not get drive space');

            const usedPercent = (driveSpace.used / driveSpace.total) * 100;
            const freePercent = 100 - usedPercent;

            // Convert bytes to GB
            const totalGB = (driveSpace.total / (1024 * 1024 * 1024)).toFixed(1);
            const usedGB = (driveSpace.used / (1024 * 1024 * 1024)).toFixed(1);
            const freeGB = (driveSpace.free / (1024 * 1024 * 1024)).toFixed(1);

            footer.innerHTML = `
                <div class="drive-info">
                    <div class="drive-text">
                        <span class="drive-label">${driveSpace.drive}</span>
                        <span class="drive-details">${usedGB}GB used of ${totalGB}GB</span>
                    </div>
                    <div class="drive-progress">
                        <div class="drive-progress-bar" style="width: ${usedPercent}%"></div>
                    </div>
                    <span class="drive-free">${freeGB}GB free</span>
                </div>
            `;
        } catch (error) {
            console.error('Error updating drive space:', error);
            footer.innerHTML = `
                <div class="drive-info">
                    <span class="drive-error">Error loading drive information</span>
                </div>
            `;
        }
    }

    // Call on load and every 30 seconds
    updateDriveSpace();
    setInterval(updateDriveSpace, 30000);
});
