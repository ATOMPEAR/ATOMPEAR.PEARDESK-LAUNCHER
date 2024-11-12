'use strict';

function initializeProgramsList() {
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

    // Make loadProgramsList available globally for search functionality
    window.loadProgramsList = loadProgramsList;
}

module.exports = { initializeProgramsList };
