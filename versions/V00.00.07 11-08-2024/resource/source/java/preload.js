'use strict';

const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');

contextBridge.exposeInMainWorld('electronAPI', {
    test: () => console.log('electronAPI is available'),
    getPrograms: () => {
        try {
            // Get the absolute path to programs.json
            const programsPath = path.join(__dirname, '../../../resource/configs/programs.json');
            console.log('Loading programs from:', programsPath);
            
            if (!fs.existsSync(programsPath)) {
                console.error('Programs.json not found at:', programsPath);
                return [];
            }
            
            const fileContent = fs.readFileSync(programsPath, 'utf8');
            const data = JSON.parse(fileContent);
            
            if (!data || !data.programs) {
                console.error('Invalid programs data structure');
                return [];
            }
            
            console.log('Loaded programs:', data.programs);
            return data.programs;
        } catch (error) {
            console.error('Error loading programs:', error);
            return [];
        }
    }
});
