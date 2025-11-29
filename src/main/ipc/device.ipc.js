const { ipcMain } = require('electron');
const deviceService = require('../services/DeviceService');

ipcMain.handle('device:get-uuid', () => {
    return deviceService.getUUID();
});