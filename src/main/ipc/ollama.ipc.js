const { ipcMain } = require('electron');
const ollamaService = require('../services/OllamaService');

ipcMain.handle('ollama:list', async () => {
    return await ollamaService.list();
});

ipcMain.handle('ollama:pull', async (event, modelName) => {
    await ollamaService.pull(modelName, event);
    return { success: true };
});

ipcMain.handle('ollama:analyze', async (event, { content, docType, model }) => {
    try {
        const result = await ollamaService.analyzeLegalDocument(content, docType);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});