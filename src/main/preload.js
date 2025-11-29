const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    file: {
        list: (name) => ipcRenderer.invoke('file:list', name),
        save: (data) => ipcRenderer.invoke('file:save', data),
        delete: (name) => ipcRenderer.invoke('file:delete', name),
        createDir: (name) => ipcRenderer.invoke('file:createDir', name),
        open: (name) => ipcRenderer.invoke('file:open', name),
    },
    ollama: {
        list: () => ipcRenderer.invoke('ollama:list'),
        pull: (name) => ipcRenderer.invoke('ollama:pull', name),
        onPullLog: (callback) => ipcRenderer.on('ollama:pull:log', (e, msg) => callback(msg)),
    },
    analysis: {
        extract: (files) => ipcRenderer.invoke('analysis:extract', files),
    },
    device: {
        getUUID: () => ipcRenderer.invoke('device:get-uuid'),
    },
    log: (msg) => ipcRenderer.send('log', msg),
});