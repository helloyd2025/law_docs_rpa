let pwd;

document.addEventListener('DOMContentLoaded', async () => {
    pwd = '';
    await loadModels();
    await refreshFileList();
});

async function loadModels() {
    const { models } = await window.api.ollama.list();
    const select = document.getElementById('model-select');
    select.innerHTML = models.map(m => `<option>${m}</option>`).join('');
}

async function refreshFileList(dirPath='') {
    const files = await window.api.file.list(dirPath);
    const list = document.getElementById('file-list');
    list.innerHTML = dirPath === '' ? '' : `<li onclick="selectFile('..');">..</li>`;
    list.innerHTML += files.map(f => `
        <li onclick="selectFile('${f}');">
            ${f}
            <span onclick="event.stopPropagation(); deleteFile('${f}', '${dirPath}');">✖</span>
        </li>
    `).join('');
}

async function selectFile(name) {
    // if (name === '..') {
    //     baseCracks = pwd.split('/');
    //     baseCracks.pop();
    //     pwd = baseCracks.join('/');
    // } else {
    //     pwd = `${pwd}/${name}`;
    // }
    // await refreshFileList(pwd);

    // const wdText = document.getElementById('file-wd');
    // wdText.textContent = pwd;
    appendLog(showTree(await window.api.file.getTree(name)));
}

function showTree(node, prefix = "") {
    let str = '\n'.concat(prefix, (node.type === 'd' ? '📁 ' : '📄 '), node.name, '\n');

    if(node.type === 'd' && node.children) {
        const lastIndex = node.children.length - 1;
        node.children.forEach((child, index) => {
            const isLast = index === lastIndex;
            const newPrefix = prefix + (isLast ? '     ' : '│   ');
            str += showTree(child, newPrefix);
        });
    }

    return str;
}

async function deleteFile(name, relativePath='') {
    const fullPath = relativePath ? `${relativePath}/${name}` : name;
    await window.api.file.delete(fullPath);
    appendLog(`삭제됨: ${fullPath}`);
    refreshFileList(relativePath);
}

function appendLog(msg) {
    const log = document.getElementById('log-container');
    log.innerHTML += `<div>[${new Date().toLocaleTimeString()}] ${msg}</div>`;
    log.scrollTop = log.scrollHeight;
    window.api.log(msg);
}


// --- 모델 선택 시 로고 자동 변경 ---
document.getElementById("model-select").addEventListener("change", (e) => {
    const modelName = e.target.value;
    appendLog(`모델 선택: ${modelName}`);

    modelName = modelName.split(":")[0];
    modelName = modelName.split("-")[0].replace(/[0-9]/g, '');

    // 로고 이미지 파일명 규칙: assets/{modelName}.png
    const logoPath = `assets/${modelName}.png`;
    const img = document.getElementById("model-logo");
    img.src = `../../../${logoPath}`;

    // 존재하지 않는 경우 기본 이미지 사용
    img.onerror = () => { img.src = "assets/deepseek.png"; }
});

// ------------------------
// 드래그 앤 드롭 이벤트 처리
// ------------------------
const fileFrame = document.getElementById("file-frame");

fileFrame.addEventListener("dragover", (e) => {
    e.preventDefault();
    fileFrame.classList.add("drag-hover");
});

fileFrame.addEventListener("dragleave", () => {
    fileFrame.classList.remove("drag-hover");
});

fileFrame.addEventListener("drop", async (e) => {
    e.preventDefault();
    fileFrame.classList.remove("drag-hover");

    const items = Array.from(e.dataTransfer.items);

    for (const item of items) {
        const entry = item.webkitGetAsEntry?.() || item.getAsEntry?.();
        if (!entry) {
            // 폴더 미지원 브라우저 대비 (파일만 처리)
            const file = item.getAsFile();
            if (file) await saveFile(file);
            continue;
        }

        if (entry.isFile) {
            const file = await getFileFromEntry(entry);
            await saveFile(file, pwd);
        } else if (entry.isDirectory) {
            await traverseDirectory(entry, pwd);  // 재귀 시작
        }
    }

    appendLog("모든 파일 및 폴더 복사 완료!");
    refreshFileList(pwd);
});

// FileEntry → File 객체 변환
function getFileFromEntry(entry) {
    return new Promise((resolve) => {
        entry.file(resolve);
    });
}

// 실제 파일 저장 (상대 경로 포함)
async function saveFile(file, relativePath='') {
    const fullPath = relativePath ? `${relativePath}/${file.name}` : file.name;

    try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await window.api.file.save({
            targetPath: fullPath,
            buffer: arrayBuffer
        });

        if (result.success) {
            appendLog(`복사 완료: ${fullPath}`);
        } else {
            appendLog(`실패: ${fullPath} → ${result.error}`);
        }
    } catch (err) {
        appendLog(`오류: ${fullPath} → ${err.message}`);
    }
}

// 디렉토리 재귀 탐색 + 폴더 생성
async function traverseDirectory(dirEntry, basePath='') {
    const currentDirPath = basePath ? `${basePath}/${dirEntry.name}` : dirEntry.name;

    // 1. 먼저 이 폴더 자체를 생성 (빈 폴더라도 만들어야 함)
    await window.api.file.createDir(currentDirPath);
    appendLog(`폴더 생성: ${currentDirPath}`);

    const reader = dirEntry.createReader();
    const entries = await readAllEntries(reader);

    for (const entry of entries) {
        if (entry.isFile) {
            const file = await getFileFromEntry(entry);
            await saveFile(file, currentDirPath);
        } else if (entry.isDirectory) {
            await traverseDirectory(entry, currentDirPath);
        }
    }
}

// readEntries는 한 번에 100개씩만 주므로 반복 호출 필요
function readAllEntries(reader) {
    return new Promise((resolve) => {
        const entries = [];
        const read = () => {
            reader.readEntries((results) => {
                if (results.length === 0) {
                    resolve(entries);
                } else {
                    entries.push(...results);
                    read(); // 더 있으면 계속 읽기
                }
            });
        };
        read();
    });
}