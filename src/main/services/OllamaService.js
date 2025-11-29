const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class OllamaService {
    async list() {
        const { stdout } = await execPromise('ollama list');
        return stdout
            .split('\n')
            .slice(1)
            .map(line => line.split(' ')[0])
            .filter(Boolean);
    }

    pull(modelName, ipcEvent) {
        const process = exec(`ollama pull ${modelName}`);

        process.stdout.on('data', (data) => {
            ipcEvent.sender.send('ollama:pull:log', data.toString());
        });

        process.stderr.on('data', (data) => {
            ipcEvent.sender.send('ollama:pull:log', `[ERROR] ${data.toString()}`);
        });

        return new Promise((resolve) => {
            process.on('close', (code) => {
            resolve(code === 0);
            });
        });
    }
}

module.exports = new OllamaService();