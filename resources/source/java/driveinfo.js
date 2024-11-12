'use strict';

function initializeDriveInfo() {
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

    // Initial update
    updateDriveSpace();

    // Update every 30 seconds
    setInterval(updateDriveSpace, 30000);
}

module.exports = { initializeDriveInfo };
