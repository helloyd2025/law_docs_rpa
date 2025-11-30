const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    file: {
        list: (path) => ipcRenderer.invoke('file:list', path),
        getTree: (path) => ipcRenderer.invoke('file:get-tree', path),
        save: (data) => ipcRenderer.invoke('file:save', data),
        delete: (path) => ipcRenderer.invoke('file:delete', path),
        createDir: (path) => ipcRenderer.invoke('file:create-dir', path),
        open: (path) => ipcRenderer.invoke('file:open', path),
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