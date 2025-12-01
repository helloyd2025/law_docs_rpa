const { spawn, exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class OllamaService {
    constructor() {
        this.api = 'http://localhost:11434/api';
        this.startIfNeeded();
    }

    // Ollama 자동 실행 (윈도우/맥 공통)
    async startIfNeeded() {
        try {
            await execPromise('ollama --version');
        } catch {
            spawn('ollama', ['serve'], { detached: true, stdio: 'ignore' }).unref();
            await new Promise(r => setTimeout(r, 3000)); // 3초 대기
        }
    }

    // 모델 목록
    async list() {
        const { stdout } = await execPromise('ollama list');
        return stdout
            .split('\n')
            .slice(1)
            .map(line => line.split(/\s+/)[0])
            .filter(Boolean)
            .sort();
    }

    // 모델 다운로드 + 실시간 로그
    async pull(model, event) {
        const proc = spawn('ollama', ['pull', model]);
        
        proc.stdout.on('data', data => {
            const line = data.toString();
            const percent = line.match(/(\d+)%/);
            if (percent) event.sender.send('ollama:pull:progress', + percent[1]);
            event.sender.send('ollama:pull:log', line);
        });

        proc.on('close', code => {
            event.sender.send('ollama:pull:complete', code === 0);
        });
    }

    // LLM 직접 호출
    async chat(prompt, model='llama3.1', temperature=0.1) {
        await this.startIfNeeded();
        const payload = JSON.stringify({ model, prompt, stream: false, options: { temperature } });

        const { stdout } = await execPromise(
            `curl -s ${this.api}/generate -d '${payload}'`
        );

        const res = JSON.parse(stdout);
        return res.response?.trim();
    }

    // 법률 문서 분석 전용 (작업 예정)
    async analyze(content, docType) {
        const prompt = `
        다음 법률 문서에서 아래 항목을 정확히 추출해. JSON만 반환:
        - 문서종류 (상고이유서, 민사소장 등)
        - 사건 번호
        - 법원명
        - 당사자명
        - 청구금액
        - 제출일자

        문서 내용:
        ${content.slice(0, 12000)}
        `;

        const result = await this.chat(prompt, 'llama3.1:8b', 0.05);
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : { error: '파싱 실패', raw: result };
    }
}

module.exports = new OllamaService();