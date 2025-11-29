const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const { machineIdSync } = require('node-machine-id');
const crypto = require('crypto');

// 1. 앱 데이터 폴더에 UUID 파일 저장 위치
const UUID_FILE = path.join(app.getPath('userData'), 'device-uuid.txt');

class DeviceService {
    getUUID() {
        // 이미 저장된 UUID 가 있으면 바로 반환
        if (fs.existsSync(UUID_FILE)) {
            const saved = fs.readFileSync(UUID_FILE, 'utf8').trim();
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(saved)) {
                return saved;
            }
        }

        // 없으면 새로 생성 (하드웨어 기반 original id 사용 → 가장 강력)
        let rawId;
        try {
            // original: true → OS가 제공하는 가장 낮은 레벨의 고유값 (윈도우 GUID, mac IOPlatformUUID 등)
            rawId = machineIdSync({ original: true });
        } catch (e) {
            // fallback (드물게 발생)
            rawId = machineIdSync();
        }

        // SHA-256 → 32바이트 → UUID 형태로 변환 (법원이 좋아하는 형식)
        const hash = crypto.createHash('sha256').update(rawId + 'law-rpa-salt-2025').digest('hex');
        const uuid = `${hash.substr(0,8)}-${hash.substr(8,4)}-${hash.substr(12,4)}-${hash.substr(16,4)}-${hash.substr(20,12)}`;

        // 파일에 영구 저장 (앱 삭제 전까지 유지)
        try {
            fs.writeFileSync(UUID_FILE, uuid, 'utf8');
        } catch (e) {
            console.error('UUID 저장 실패 (권한 문제 등)', e);
        }

        return uuid;
    }
}

module.exports = new DeviceId();