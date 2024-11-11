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
                    <img src="../assets/images/favicons/favicon.png" class="footer-icon" alt="PearDesk">
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

    // Metro interface functionality
    const pinnedGrid = document.getElementById('pinnedPrograms');
    const allGrid = document.getElementById('allPrograms');
    
    if (!pinnedGrid || !allGrid) {
        console.error('Metro grids not found');
        return;
    }

    // Load pinned state from localStorage
    const loadPinnedState = () => {
        try {
            return new Set(JSON.parse(localStorage.getItem('pinnedPrograms') || '[]'));
        } catch {
            return new Set();
        }
    };

    // Save pinned state to localStorage
    const savePinnedState = (pinnedState) => {
        localStorage.setItem('pinnedPrograms', JSON.stringify([...pinnedState]));
    };

    // Create program tile
    const createProgramTile = (program, isPinned = false) => {
        const tile = document.createElement('div');
        tile.className = 'metro-item';
        tile.dataset.programId = program.id;
        
        tile.innerHTML = `
            <i class="fa-solid ${program.icon} metro-item-icon"></i>
            <span class="metro-item-name">${program.name}</span>
            <button class="metro-item-pin ${isPinned ? 'metro-item-pin--active' : ''}" 
                    aria-label="${isPinned ? 'Unpin' : 'Pin'} ${program.name}">
                <i class="fa-solid fa-thumbtack"></i>
            </button>
        `;
        
        return tile;
    };

    // Handle pin/unpin
    const handlePinClick = (e) => {
        const pinButton = e.target.closest('.metro-item-pin');
        if (!pinButton) return;
        
        e.stopPropagation();
        
        const tile = pinButton.closest('.metro-item');
        const programId = tile.dataset.programId;
        
        const programs = window.electronAPI.getPrograms();
        const program = programs.find(p => p.id === programId);
        if (!program) return;
        
        // Update program's pinned state
        program.pinned = !program.pinned;
        
        // Save updated programs back to programs.json
        window.electronAPI.savePrograms(programs);
        
        // Create new tile with updated pinned state
        const newTile = createProgramTile(program, program.pinned);
        
        if (program.pinned) {
            pinnedGrid.appendChild(newTile);
        } else {
            allGrid.appendChild(newTile);
        }
        
        tile.remove();
    };

    // Initialize Metro interface
    const initializePrograms = () => {
        try {
            const programs = window.electronAPI.getPrograms();
            
            if (!programs || programs.length === 0) {
                console.error('No programs loaded');
                return;
            }

            console.log('Loaded programs:', programs);
            
            // Clear existing content
            pinnedGrid.innerHTML = '';
            allGrid.innerHTML = '';
            
            // Sort programs by name
            programs.sort((a, b) => a.name.localeCompare(b.name));
            
            // Add programs to appropriate grids based on pinned property
            programs.forEach(program => {
                const tile = createProgramTile(program, program.pinned);
                
                if (program.pinned) {
                    pinnedGrid.appendChild(tile);
                } else {
                    allGrid.appendChild(tile);
                }
            });
        } catch (error) {
            console.error('Error initializing programs:', error);
        }
    };

    // Add event listeners
    document.addEventListener('click', handlePinClick);
    
    // Initialize programs immediately
    console.log('Initializing Metro interface...');
    initializePrograms();

    // Settings functionality
    const themeSelect = document.getElementById('theme');
    const accentSelect = document.getElementById('accentColor');
    const autoStartCheck = document.getElementById('autoStart');
    const minimizeToTrayCheck = document.getElementById('minimizeToTray');
    const showNotificationsCheck = document.getElementById('showNotifications');
    const alwaysOnTopCheck = document.getElementById('alwaysOnTop');
    const opacityRange = document.getElementById('opacity');
    const opacityValue = opacityRange.nextElementSibling;
    const autoUpdateCheck = document.getElementById('autoUpdate');
    const updateChannelSelect = document.getElementById('updateChannel');
    const saveButton = document.getElementById('saveSettings');
    const resetButton = document.getElementById('resetSettings');

    // Load current settings
    const loadSettings = () => {
        try {
            const settings = window.electronAPI.getSettings();
            console.log('Loading settings:', settings);
            
            if (settings) {
                // Theme
                themeSelect.value = settings.settings.theme;
                
                // Accent Color
                accentSelect.value = settings.settings.accent;
                
                // Behavior settings
                autoStartCheck.checked = settings.behavior.autoStart;
                alwaysOnTopCheck.checked = settings.behavior.alwaysOnTop;
                showNotificationsCheck.checked = settings.behavior.showNotify;
                
                // Window settings
                minimizeToTrayCheck.checked = settings.window.minimizeTray;
                opacityRange.value = settings.window.winOpacity;
                opacityValue.textContent = `${settings.window.winOpacity}%`;
                
                // Update settings
                updateChannelSelect.value = settings.update.channel;
                autoUpdateCheck.checked = settings.update.autoUpdate;
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    // Initialize settings on startup
    loadSettings();

    // Save settings
    const saveSettings = () => {
        const newSettings = {
            settings: {
                theme: themeSelect.value,
                accent: accentSelect.value,
                language: "en"
            },
            behavior: {
                autoStart: autoStartCheck.checked,
                alwaysOnTop: alwaysOnTopCheck.checked,
                showNotify: showNotificationsCheck.checked
            },
            window: {
                minimizeTray: minimizeToTrayCheck.checked,
                winOpacity: parseInt(opacityRange.value)
            },
            update: {
                channel: updateChannelSelect.value,
                autoUpdate: autoUpdateCheck.checked
            }
        };

        console.log('Saving settings:', newSettings);
        const saved = window.electronAPI.saveSettings(newSettings);
        console.log('Settings saved:', saved);
    };

    // Event listeners
    if (opacityRange) {
        opacityRange.addEventListener('input', () => {
            opacityValue.textContent = `${opacityRange.value}%`;
        });
    }

    if (saveButton) {
        saveButton.addEventListener('click', () => {
            saveSettings();
            // Show save confirmation
            const oldText = saveButton.textContent;
            saveButton.textContent = 'Saved!';
            saveButton.disabled = true;
            setTimeout(() => {
                saveButton.textContent = oldText;
                saveButton.disabled = false;
            }, 2000);
        });
    }

    if (resetButton) {
        resetButton.addEventListener('click', () => {
            // Save default settings
            const saved = window.electronAPI.saveSettings(defaultSettings);
            
            if (saved) {
                // Load the default settings into the form
                themeSelect.value = defaultSettings.settings.theme;
                accentSelect.value = defaultSettings.settings.accent;
                autoStartCheck.checked = defaultSettings.behavior.autoStart;
                alwaysOnTopCheck.checked = defaultSettings.behavior.alwaysOnTop;
                minimizeToTrayCheck.checked = defaultSettings.window.minimizeTray;
                opacityRange.value = defaultSettings.window.winOpacity;
                opacityValue.textContent = `${defaultSettings.window.winOpacity}%`;
                updateChannelSelect.value = defaultSettings.update.channel;
                autoUpdateCheck.checked = defaultSettings.update.autoUpdate;
                
                // Show reset confirmation
                const oldText = resetButton.textContent;
                resetButton.textContent = 'Reset!';
                resetButton.disabled = true;
                setTimeout(() => {
                    resetButton.textContent = oldText;
                    resetButton.disabled = false;
                }, 2000);
            }
        });
    }

    // Calculator functionality
    function initializeCalculator() {
        const previousOperandElement = document.getElementById('previousOperand');
        const currentOperandElement = document.getElementById('currentOperand');
        const historyList = document.getElementById('calculatorHistory');
        const expandButton = document.getElementById('expandHistory');
        const historyControls = document.querySelector('.history-controls');
        const historyItems = document.querySelector('.history-items');
        let isExpanded = false;
        
        let currentOperand = '0';
        let previousOperand = '';
        let operation = undefined;
        let shouldResetScreen = false;

        function updateDisplay() {
            currentOperandElement.textContent = currentOperand;
            previousOperandElement.textContent = previousOperand;
        }

        function addToHistory(calculation, result) {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <span class="history-calculation">${calculation}</span>
                <span class="history-result">${result}</span>
            `;
            historyItems.appendChild(historyItem);
            historyItems.scrollTop = historyItems.scrollHeight;
            updateHistoryState(); // Update state when adding item
        }

        function appendNumber(number) {
            if (shouldResetScreen) {
                currentOperand = '';
                shouldResetScreen = false;
            }
            if (number === '.' && currentOperand.includes('.')) return;
            currentOperand = currentOperand === '0' ? number : currentOperand + number;
            updateDisplay();
        }

        function toggleSign() {
            if (currentOperand === '0') return;
            currentOperand = currentOperand.startsWith('-') ? 
                currentOperand.slice(1) : 
                '-' + currentOperand;
            updateDisplay();
        }

        function handleOperation(op) {
            if (currentOperand === '') return;
            if (previousOperand !== '') {
                calculate();
            }
            operation = op;
            previousOperand = `${currentOperand} ${op}`;
            currentOperand = '';
            updateDisplay();
        }

        function calculate() {
            let computation;
            const prev = parseFloat(previousOperand);
            const current = parseFloat(currentOperand);
            if (isNaN(prev) || isNaN(current)) return;

            switch (operation) {
                case '+':
                    computation = prev + current;
                    break;
                case '−':
                    computation = prev - current;
                    break;
                case '×':
                    computation = prev * current;
                    break;
                case '÷':
                    computation = prev / current;
                    break;
                case '%':
                    computation = prev * (current / 100);
                    break;
                default:
                    return;
            }

            const calculation = `${prev} ${operation} ${current}`;
            currentOperand = computation.toString();
            addToHistory(calculation, currentOperand);
            operation = undefined;
            previousOperand = '';
            shouldResetScreen = true;
            updateDisplay();
        }

        function clear() {
            currentOperand = '0';
            previousOperand = '';
            operation = undefined;
            updateDisplay();
        }

        function handleSquareRoot() {
            if (currentOperand === '') return;
            const number = parseFloat(currentOperand);
            if (number < 0) {
                currentOperand = 'Error';
            } else {
                const calculation = `√(${currentOperand})`;
                currentOperand = Math.sqrt(number).toString();
                addToHistory(calculation, currentOperand);
            }
            shouldResetScreen = true;
            updateDisplay();
        }

        // Event listeners for calculator buttons
        document.querySelectorAll('.calc-btn').forEach(button => {
            button.addEventListener('click', () => {
                if (button.classList.contains('number')) {
                    appendNumber(button.textContent);
                } else {
                    const action = button.dataset.action;
                    switch (action) {
                        case 'add':
                            handleOperation('+');
                            break;
                        case 'subtract':
                            handleOperation('−');
                            break;
                        case 'multiply':
                            handleOperation('×');
                            break;
                        case 'divide':
                            handleOperation('÷');
                            break;
                        case 'percent':
                            handleOperation('%');
                            break;
                        case 'equals':
                            if (operation) calculate();
                            break;
                        case 'clear':
                            clear();
                            break;
                        case 'sqrt':
                            handleSquareRoot();
                            break;
                        case 'negate':
                            toggleSign();
                            break;
                    }
                }
            });
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key >= '0' && e.key <= '9' || e.key === '.') {
                appendNumber(e.key);
            } else if (e.key === '+') {
                handleOperation('+');
            } else if (e.key === '-') {
                handleOperation('−');
            } else if (e.key === '*') {
                handleOperation('×');
            } else if (e.key === '/') {
                e.preventDefault();
                handleOperation('÷');
            } else if (e.key === 'Enter' || e.key === '=') {
                if (operation) calculate();
            } else if (e.key === 'Escape') {
                clear();
            } else if (e.key === 'Backspace') {
                currentOperand = currentOperand.slice(0, -1) || '0';
                updateDisplay();
            }
        });

        // Function to check if history is empty
        function isHistoryEmpty() {
            return historyItems.children.length === 0;
        }

        // Function to update history state
        function updateHistoryState() {
            if (isHistoryEmpty()) {
                // Collapse if empty
                isExpanded = false;
                historyList.classList.add('collapsed');
                historyControls.classList.remove('expanded');
                expandButton.querySelector('i').style.transform = 'rotate(0deg)';
                historyList.style.maxHeight = '0';
            } else {
                // Expand if has items
                isExpanded = true;
                historyList.classList.remove('collapsed');
                historyControls.classList.add('expanded');
                expandButton.querySelector('i').style.transform = 'rotate(180deg)';
                historyList.style.maxHeight = '65px';
            }
        }

        // Update addToHistory function
        function addToHistory(calculation, result) {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <span class="history-calculation">${calculation}</span>
                <span class="history-result">${result}</span>
            `;
            historyItems.appendChild(historyItem);
            historyItems.scrollTop = historyItems.scrollHeight;
            updateHistoryState(); // Update state when adding item
        }

        // Update clear history functionality
        const clearHistoryButton = document.getElementById('clearHistory');
        clearHistoryButton.addEventListener('click', () => {
            historyItems.innerHTML = '';
            updateHistoryState(); // Update state when clearing
        });

        // Manual expand/collapse still available
        expandButton.addEventListener('click', () => {
            if (!isHistoryEmpty()) { // Only allow toggle if history exists
                isExpanded = !isExpanded;
                historyList.classList.toggle('collapsed');
                historyControls.classList.toggle('expanded');
                expandButton.querySelector('i').style.transform = isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
                historyList.style.maxHeight = isExpanded ? '65px' : '0';
            }
        });

        // Initial state
        historyList.classList.add('collapsed');
        historyList.style.maxHeight = '0';
        historyControls.classList.remove('expanded');
        updateHistoryState();
    }

    // Initialize calculator
    initializeCalculator();
});
