const { ipcMain } = require('electron');
const ollamaService = require('../services/OllamaService');

ipcMain.handle('ollama:list', async () => {
    const models = await ollamaService.list();
    return { models };
});

ipcMain.handle('ollama:pull', async (event, modelName) => {
    const success = await ollamaService.pull(modelName, event);
    return { success };
});