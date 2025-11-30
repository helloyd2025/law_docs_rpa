function appendLog(msg) {
    const log = document.getElementById('log-container');
    log.innerHTML += `<div>[${new Date().toLocaleTimeString()}] ${msg}</div>`;
    log.scrollTop = log.scrollHeight;
    window.api.log(msg);
}

function showTree(node, prefix='') {
    let log = '\n'.concat(prefix, (node.type === 'd' ? '📁 ' : '📄 '), node.name);

    if(node.type === 'd' && node.children) {
        const lastIndex = node.children.length - 1;
        node.children.forEach((child, index) => {
            const isLast = index === lastIndex;
            const newPrefix = prefix + (isLast ? '     ' : '│   ');
            log += showTree(child, newPrefix);
        });
    }

    return log;
}