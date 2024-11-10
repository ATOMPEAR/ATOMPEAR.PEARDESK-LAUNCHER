'use strict';

const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const checkDiskSpace = require('check-disk-space').default;

contextBridge.exposeInMainWorld('electronAPI', {
    test: () => console.log('electronAPI is available'),
    getPrograms: () => {
        try {
            const programsPath = path.join(__dirname, '../../../resources/configs/programs.json');
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
    },
    openFolder: (folderName) => ipcRenderer.send('open-folder', folderName),
    minimizeWindow: () => ipcRenderer.send('minimize-window'),
    closeWindow: () => ipcRenderer.send('close-window'),
    handleOptionsAction: (action) => ipcRenderer.send('options-action', action),
    getDriveSpace: async () => {
        try {
            const currentDrive = path.parse(__dirname).root;
            const space = await checkDiskSpace(currentDrive);
            return {
                total: space.size,
                free: space.free,
                used: space.size - space.free,
                drive: currentDrive
            };
        } catch (error) {
            console.error('Error getting drive space:', error);
            return null;
        }
    },
    savePrograms: (programs) => {
        try {
            const programsPath = path.join(__dirname, '../../../resources/configs/programs.json');
            const data = { programs };
            fs.writeFileSync(programsPath, JSON.stringify(data, null, 4));
            return true;
        } catch (error) {
            console.error('Error saving programs:', error);
            return false;
        }
    },
    resetPosition: (position) => ipcRenderer.send('reset-position', position),
    getSettings: () => {
        try {
            const settingsPath = path.join(__dirname, '../../../resources/configs/settings.json');
            const data = fs.readFileSync(settingsPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading settings:', error);
            return null;
        }
    },
    saveSettings: (settings) => {
        try {
            const settingsPath = path.join(__dirname, '../../../resources/configs/settings.json');
            fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }
});
