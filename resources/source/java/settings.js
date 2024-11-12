'use strict';

function initializeSettings() {
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

    // Default settings
    const defaultSettings = {
        settings: {
            theme: "dark",
            accent: "#01a2ff",
            language: "en"
        },
        behavior: {
            autoStart: false,
            alwaysOnTop: false,
            showNotify: true
        },
        window: {
            minimizeTray: true,
            winOpacity: 100
        },
        update: {
            channel: "stable",
            autoUpdate: false
        }
    };

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

    // Initialize settings on startup
    loadSettings();
}

module.exports = { initializeSettings };
