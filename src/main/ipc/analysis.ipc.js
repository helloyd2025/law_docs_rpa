const { ipcMain } = require('electron');
const analysisService = require('../services/AnalysisService');

ipcMain.handle('analysis:extract', async (event, files, model) => {
    
});