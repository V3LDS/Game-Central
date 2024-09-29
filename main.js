import { app, BrowserWindow } from 'electron';
import path from 'path';
import { execFile } from 'child_process';

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });

    // Check for updates and uninstall old version if necessary
    app.on('ready', () => {
        if (process.platform === 'win32') {
            const uninstallerPath = path.join(process.resourcesPath, '..', 'Uninstall Your App Name.exe');
            execFile(uninstallerPath, ['/SILENT'], (error, stdout, stderr) => {
                if (error) {
                    console.log('No previous version found or uninstall failed');
                } else {
                    console.log('Previous version uninstalled successfully');
                }
                // Continue with your app initialization here
                createWindow();
            });
        } else {
            // For non-Windows platforms, just continue with app initialization
            createWindow();
        }
    });

    // ... rest of your app code ...
}

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});
