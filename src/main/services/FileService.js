const fs = require('fs').promises;
const path = require('path');
const fixedPath = process.env.DOCS_PATH;

class FileService {
    async list() {
        try {
            return await fs.readdir(fixedPath);
        } catch (err) {
            throw new Error(`폴더 읽기 실패: ${err.message}`);
        }
    }

    async save({ name, buffer }) {
        const destPath = path.join(fixedPath, name);
        await fs.mkdir(path.dirname(destPath), { recursive: true });
        await fs.writeFile(destPath, Buffer.from(buffer));
    }

    async delete(fileName) {
        const target = path.join(fixedPath, fileName);
        await fs.rm(target, { recursive: true, force: true });
    }

    async createDir(dirPath) {
        await fs.mkdir(path.join(fixedPath, dirPath), { recursive: true });
    }
}

module.exports = new FileService();