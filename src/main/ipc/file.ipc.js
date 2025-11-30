const { ipcMain } = require('electron');
const fileService = require('../services/FileService');

ipcMain.handle('file:list', async (event, path) => {
    return await fileService.list(path);
});

ipcMain.handle('file:save', async (event, fileData) => {
    await fileService.save(fileData);
    return { success: true };
});

ipcMain.handle('file:delete', async (event, path) => {
    await fileService.delete(path);
    return { success: true };
});

ipcMain.handle('file:create-dir', async (event, path) => {
    await fileService.createDir(path);
    return { success: true };
});

ipcMain.handle('file:open', async (event, path) => {
    await fileService.open(path);
    return { success: true };
});