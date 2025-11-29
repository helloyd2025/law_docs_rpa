const { app, shell } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const fixedPath = path.join(app.getPath('userData'), 'docs');

class FileService {
    async list(name) {
        try {
            const target = path.join(fixedPath, name);
            const stat = await fs.stat(target);
            if (stat.isDirectory()) {
                return await fs.readdir(target);
            } else if (stat.isFile()) {
                this.open(name); // 파일 클릭 시 에러 대신 파일 오픈
            }
        } catch (err) {
            throw new Error(`폴더 읽기 실패: ${err.message}`);
        }
    }

    async save({ name, buffer }) {
        const target = path.join(fixedPath, name);
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.writeFile(target, Buffer.from(buffer));
    }

    async delete(name) {
        const target = path.join(fixedPath, name);
        const stat = await fs.stat(target);
        if (stat.isDirectory()) {
            await fs.rm(target, { recursive: true, force: true });
        } else if (stat.isFile()) {
            await fs.unlink(target);
        }
    }

    async createDir(name) {
        await fs.mkdir(path.join(fixedPath, name), { recursive: true });
    }

    async open(name) {
        await shell.openPath(path.join(fixedPath, name));
    }
}

module.exports = new FileService();