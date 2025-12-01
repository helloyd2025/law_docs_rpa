const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
require('dotenv').config();

function createWindow() {
    const win = new BrowserWindow({
        width: 1300,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    win.loadFile('src/renderer/pages/file-manager/index.html');
    // win.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();

    // IPC 핸들러 모듈 자동 등록
    require('./ipc/file.ipc');
    require('./ipc/ollama.ipc');
    require('./ipc/device.ipc')

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// 전역 로그
ipcMain.on('log', (event, msg) => {
    console.log('[Renderer → Main] ', msg);
});