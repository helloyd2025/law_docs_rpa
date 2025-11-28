require('dotenv').config();

const { app, BrowserWindow } = require("electron");
const path = require("path");

const { ipcMain } = require("electron");
const fs = require("fs");
// const fsp = require("fs/promises");
const fixedPath = process.env.DOCS_PATH; // 사용자 고정 경로

const { exec } = require("child_process");

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    win.loadFile("renderer/index.html");

    // 개발자 도구 자동 오픈 (원하면 주석처리)
    // win.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});


ipcMain.handle("get-file-list", () => {
    try {
        return fs.readdirSync(fixedPath);
    } catch (err) {
        return { error: err.message };
    }
});


ipcMain.on("log-message", (event, msg) => {
    console.log("LOG from Renderer:", msg);
});


ipcMain.handle("save-dropped-file", async (event, fileData) => {
    try {
        const { name, buffer } = fileData;
        const destPath = path.join(fixedPath, name);
        await fs.promises.writeFile(destPath, Buffer.from(buffer));
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle("delete-file", async (event, fileName) => {
    try {
        await fs.promises.rm(`${fixedPath}/${fileName}`, { recursive: true, force: true });
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message }
    }
});


// --- Ollama 로컬 모델 목록 가져오기 ---
ipcMain.handle("get-local-models", async () => {
    return new Promise((resolve, reject) => {
        exec("ollama list", (err, stdout, stderr) => {
            if (err) {
                resolve({ error: stderr });
                return;
            }

            stdout = stdout.split("\n").slice(1).map(line => line.split(' ')[0]);

            // 예: stdout = "llama3.1\nqwen2.5\nmistral"
            const models = stdout.filter(m => m.trim() !== "");
            resolve({ models });
        });
    });
});


ipcMain.handle("create-directory", async (event, dirPath) => {
    const fullPath = path.join(fixedPath, dirPath);
    try {
        await fs.promises.mkdir(fullPath, { recursive: true });
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// Ollama 모델 다운로드
// ipcMain.handle("download-model", async (event, modelName) => {
//     return new Promise((resolve) => {
//         const downloadCommand = `ollama pull ${modelName}`;
//         const process = exec(downloadCommand);

//         process.stdout.on("data", (data) => {
//             event.sender.send("download-log", data.toString());
//         });

//         process.stderr.on("data", (data) => {
//             event.sender.send("download-log", "[ERROR] " + data.toString());
//         });

//         process.on("close", (code) => {
//             if (code === 0) {
//                 resolve({ success: true });
//             } else {
//                 resolve({ success: false, error: `Exit code ${code}` });
//             }
//         });
//     });
// });