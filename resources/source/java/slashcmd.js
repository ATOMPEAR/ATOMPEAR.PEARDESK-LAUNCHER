'use strict';

function initializeSlashCommands() {
    const searchInput = document.querySelector('.search-input');
    const searchCommands = document.querySelector('.search-commands');

    // Define available commands
    const commands = [
        { command: '--search', description: 'Search for programs (e.g., --search firefox)' },
        { command: '--help', description: 'Show this help menu' }
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
                
                if (command === '--search') {
                    loadProgramsList();
                }
            });
        });
    }

    // Handle search input
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const programButtons = document.querySelectorAll('.programs-list-button');
        
        if (searchTerm === '--help') {
            showHelpMenu();
        } else if (searchTerm.startsWith('--search ')) {
            if (document.querySelector('.help-header')) {
                loadProgramsList();
            }
            
            const actualSearchTerm = searchTerm.replace('--search ', '');
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
            if (document.querySelector('.help-header')) {
                loadProgramsList();
            }
            programButtons.forEach(button => {
                button.closest('li').style.display = 'block';
            });
        }
    });

    // Handle keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchCommands.classList.contains('visible')) {
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
    searchInput.setAttribute('placeholder', 'TYPE --HELP FOR LIST OF COMMANDS');
}

module.exports = { initializeSlashCommands };
