'use strict';

function initializeStartMenu() {
    const pinnedGrid = document.getElementById('pinnedPrograms');
    const allGrid = document.getElementById('allPrograms');

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
}

module.exports = { initializeStartMenu };
