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
        pull: (model) => ipcRenderer.invoke('ollama:pull', model),
        analyze: (content) => ipcRenderer.invoke('ollama:analyze', content),
        onPullLog: (callback) => ipcRenderer.on('ollama:pull:log', (e, msg) => callback(msg)),
        onPullProgress: (callback) => ipcRenderer.on('ollama:pull:progress', (e, p) => callback(p)),
        onPullComplete: (callback) => ipcRenderer.on('ollama:pull:complete', (e, ok) => callback(ok)),
    },
    device: {
        getUUID: () => ipcRenderer.invoke('device:get-uuid'),
    },
    log: (msg) => ipcRenderer.send('log', msg),
});