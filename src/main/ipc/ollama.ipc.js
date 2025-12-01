const { ipcMain } = require('electron');
const ollamaService = require('../services/OllamaService');

ipcMain.handle('ollama:list', async () => {
    return await ollamaService.list();
});

ipcMain.handle('ollama:pull', async (event, model) => {
    await ollamaService.pull(model, event);
    return { success: true };
});

ipcMain.handle('ollama:analyze', async (event, content) => {
    try {
        console.log('good', ":", content)
        const result = await ollamaService.analyze(content);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});