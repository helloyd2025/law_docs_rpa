const { ipcMain } = require('electron');
const fileService = require('../services/FileService');

ipcMain.handle('file:list', async (event, name) => {
    return await fileService.list(name);
});

ipcMain.handle('file:save', async (event, fileData) => {
    await fileService.save(fileData);
    return { success: true };
});

ipcMain.handle('file:delete', async (event, name) => {
    await fileService.delete(name);
    return { success: true };
});

ipcMain.handle('file:createDir', async (event, name) => {
    await fileService.createDir(name);
    return { success: true };
});

ipcMain.handle('file:open', async (event, name) => {
    await fileService.open(name);
    return { success: true };
});