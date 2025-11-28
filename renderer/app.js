// Electron API로 파일 목록 불러오기
document.addEventListener("DOMContentLoaded", async () => {
    // --- Ollama 모델 목록 가져오기 ---
    const res = await window.electronAPI.getLocalModels();
    const select = document.getElementById("model-select");

    if (res.error) {
        appendLog("모델 목록 로딩 오류: " + res.error);
    } else {
        select.innerHTML = ""; // 기존 옵션 제거
        res.models.forEach(model => {
            const option = document.createElement("option");
            option.value = model;
            option.textContent = model;
            select.appendChild(option);
        });
        appendLog("모델 목록 로딩 완료: " + res.models.join(", "));
    }

    // --- 파일 리스트 초기화 ---
    refreshFileList();
});


// 파일 리스트 다시 불러오기
async function refreshFileList() {
    const list = document.getElementById("file-list");
    list.innerHTML = "";
    const files = await window.electronAPI.requestFileList();

    if (files.error) {
        appendLog("폴더 읽기 오류: " + files.error);
        return;
    }

    files.forEach(f => {
        const li = document.createElement("li");
        li.textContent = f;
        li.onclick = () => appendLog(`선택됨: ${f}`);
        list.appendChild(li);
    });
    appendLog("파일 목록 갱신 완료");
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
    img.src = logoPath;

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
            if (file) await saveFile(file, "");
            continue;
        }

        if (entry.isFile) {
            const file = await getFileFromEntry(entry);
            await saveFile(file, "");
        } else if (entry.isDirectory) {
            await traverseDirectory(entry, "");  // 재귀 시작
        }
    }

    appendLog("모든 파일 및 폴더 복사 완료!");
    refreshFileList();
});

// FileEntry → File 객체 변환
function getFileFromEntry(entry) {
    return new Promise((resolve) => {
        entry.file(resolve);
    });
}

// 실제 파일 저장 (상대 경로 포함)
async function saveFile(file, relativePath) {
    const fullPath = relativePath ? `${relativePath}/${file.name}` : file.name;

    try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await window.electronAPI.saveDroppedFile({
            name: fullPath,
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
async function traverseDirectory(dirEntry, basePath) {
    const currentDirPath = basePath ? `${basePath}/${dirEntry.name}` : dirEntry.name;

    // 1. 먼저 이 폴더 자체를 생성 (빈 폴더라도 만들어야 함)
    await window.electronAPI.createDirectory(currentDirPath);
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

// 로그 UI 표시
function appendLog(text) {
    const logBox = document.getElementById("log-container");
    const entry = document.createElement("div");
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    logBox.appendChild(entry);
    logBox.scrollTop = logBox.scrollHeight;

    // 메인 프로세스에도 로그 전달
    window.electronAPI.log(text);
}

document.getElementById("prompt-send").onclick = () => {
    const input = document.getElementById("prompt-input");
    appendLog(`프롬프트 전송: ${input.value}`);
    input.value = "";
};



// 모델 다운로드 버튼 클릭
// document.getElementById("download-model-btn").addEventListener("click", async () => {
//     const modelName = document.getElementById("model-select").value;
//     appendLog(`모델 다운로드 시작: ${modelName}`);

//     // 다운로드 로그 수신
//     window.electronAPI.onDownloadLog((msg) => {
//         appendLog(msg);
//     });

//     const result = await window.electronAPI.downloadModel(modelName);

//     if (result.success) {
//         appendLog(`모델 다운로드 완료: ${modelName}`);
//         // 다운로드 후 목록 갱신
//         const res = await window.electronAPI.getLocalModels();
//         if (!res.error) {
//             const select = document.getElementById("model-select");
//             select.innerHTML = "";
//             res.models.forEach(model => {
//                 const option = document.createElement("option");
//                 option.value = model;
//                 option.textContent = model;
//                 select.appendChild(option);
//             });
//         }
//     } else {
//         appendLog(`다운로드 실패: ${result.error}`);
//     }
// });