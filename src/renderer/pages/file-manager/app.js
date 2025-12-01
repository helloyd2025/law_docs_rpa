let pwd;

document.addEventListener('DOMContentLoaded', async () => {
    pwd = '';
    await loadModels();
    await refreshFileList();
});

async function loadModels() {
    const models = await window.api.ollama.list();
    const select = document.getElementById('model-select');
    select.innerHTML = '<option>gemini-2.5-flash</option>';
    select.innerHTML += models.map(m => `<option>${m}</option>`).join('');
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

async function deleteFile(name, relativePath='') {
    const fullPath = relativePath ? `${relativePath}/${name}` : name;
    await window.api.file.delete(fullPath);
    appendLog(`삭제됨: ${fullPath}`);
    refreshFileList(relativePath);
}

// --- 모델 선택 시 로고 자동 변경 ---
document.getElementById("model-select").addEventListener("change", (e) => {
    let modelName = e.target.value;
    appendLog(`모델 선택: ${modelName}`);

    modelName = modelName.split(":")[0];
    modelName = modelName.indexOf("-") !== -1 ? modelName.split("-")[0] : modelName;
    modelName = modelName.replace(/[0-9]/g, '');

    // 로고 이미지 파일명 규칙: assets/{modelName}.png
    const logoPath = `assets/${modelName}.png`;
    const img = document.getElementById("model-logo");
    img.src = `../../../${logoPath}`;

    // 존재하지 않는 경우 기본 이미지 사용
    img.onerror = () => { img.src = "../../../assets/gemini.png"; }
});

document.getElementById('prompt-send').addEventListener('click', async (e) => {
    document.getElementById("main").classList.toggle("fullscreen");
    const modelSelected = document.getElementById('model-select').value;
    // await window.api.analysis.extract(['abc', 'def'], modelSelected);
});