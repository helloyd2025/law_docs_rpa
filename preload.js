const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    requestFileList: () => ipcRenderer.invoke("get-file-list"),
    saveDroppedFile: (fileData) => ipcRenderer.invoke("save-dropped-file", fileData),
    deleteFile: (fileName) => ipcRenderer.invoke("delete-file", fileName),
    createDirectory: (dirPath) => ipcRenderer.invoke("create-directory", dirPath),
    getLocalModels: () => ipcRenderer.invoke("get-local-models"),
    downloadModel: (modelName) => ipcRenderer.invoke("download-model", modelName),
    onDownloadLog: (callback) => ipcRenderer.on("download-log", (event, msg) => callback(msg)),
    log: (msg) => ipcRenderer.send("log-message", msg),
});
