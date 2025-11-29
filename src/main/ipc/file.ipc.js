const { ipcMain } = require('electron');
const fileService = require('../services/FileService');

ipcMain.handle('file:list', async () => {
    return await fileService.list();
});

ipcMain.handle('file:save', async (event, fileData) => {
    await fileService.save(fileData);
    return { success: true };
});

ipcMain.handle('file:delete', async (event, name) => {
    await fileService.delete(name);
    return { success: true };
});

ipcMain.handle('file:createDir', async (event, dirPath) => {
    await fileService.createDir(dirPath);
    return { success: true };
});