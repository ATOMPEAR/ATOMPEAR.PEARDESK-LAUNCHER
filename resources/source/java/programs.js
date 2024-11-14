'use strict';

function initializeProgramsList() {
    function loadProgramsList() {
        const programsList = document.querySelector('.programs-list-items');
        
        if (!programsList) {
            console.error('Programs list container not found');
            return;
        }

        try {
            const programs = window.electronAPI.getPrograms();
            
            if (!programs || programs.length === 0) {
                throw new Error('No programs found');
            }

            // Group programs by category
            const categories = {
                portapps: [],
                accessibility: [],
                development: [],
                education: [],
                games: [],
                media: [],
                office: [],
                security: [],
                utilities: []
            };

            // Sort programs into categories
            programs.forEach(program => {
                const category = program.category.toLowerCase();
                if (categories.hasOwnProperty(category)) {
                    categories[category].push(program);
                }
            });

            // Create accordion menu
            programsList.innerHTML = Object.entries(categories).map(([category, categoryPrograms]) => `
                <li class="menu-category">
                    <button class="menu-button" data-category="${category}">
                        <span class="button-text">${category.toUpperCase()}</span>
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <ul class="submenu">
                        ${categoryPrograms.map(program => `
                            <li>
                                <button class="programs-list-button" data-program-id="${program.id}">
                                    <span class="button-text">${program.name}</span>
                                    <i class="fa-solid ${program.icon}"></i>
                                </button>
                            </li>
                        `).join('')}
                    </ul>
                </li>
            `).join('');

            // Add click handlers for accordion
            document.querySelectorAll('.menu-button').forEach(button => {
                button.addEventListener('click', () => {
                    const submenu = button.nextElementSibling;
                    const isExpanded = button.classList.contains('expanded');

                    // Close all other menus
                    document.querySelectorAll('.menu-button.expanded').forEach(expandedBtn => {
                        if (expandedBtn !== button) {
                            expandedBtn.classList.remove('expanded');
                            expandedBtn.querySelector('i').style.transform = 'rotate(0deg)';
                            expandedBtn.nextElementSibling.style.maxHeight = '0';
                        }
                    });

                    // Toggle current menu
                    button.classList.toggle('expanded');
                    button.querySelector('i').style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
                    submenu.style.maxHeight = isExpanded ? '0' : `${submenu.scrollHeight}px`;
                });
            });

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

    // Make loadProgramsList available globally for search functionality
    window.loadProgramsList = loadProgramsList;
}

module.exports = { initializeProgramsList };
