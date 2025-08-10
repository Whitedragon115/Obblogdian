const Hexo = require('hexo');
const { spawn } = require('child_process');
const path = require('path');

const hexoPath = path.resolve(__dirname, '../../hexo/');

async function initHexoServer(hexoInstance) {
    if (hexoInstance.running) return { status: 'error', message: 'Hexo server is already running.' };

    hexoInstance.instance = new Hexo(hexoInstance.path, {});
    await hexoInstance.instance.init();
    await hexoInstance.instance.call('clean', {});
    await hexoInstance.instance.call('generate', {});
    await hexoInstance.instance.exit();
    startHexoServer(hexoInstance);

    hexoInstance.running = true;
    hexoInstance.instance = null;

    return { status: 'success', message: 'Hexo server initialized and started.' };
}

function startHexoServer(hexoInstance) {
    if (hexoInstance.serverProcess && hexoInstance.serverProcess.pid) {
        return { status: 'error', message: 'Hexo server is already running via child process.' };
    }

    hexoInstance.serverProcess = spawn('npx', ['hexo', 'server', '--port', process.env.PREVIEW_PORT || '4000', '--watch'], {
        cwd: hexoPath,
        detached: false,
        shell: true
    });

    console.log(`Hexo server started with PID: ${hexoInstance.serverProcess.pid}`);

    hexoInstance.serverProcess.stdout.on('data', (data) => {
        console.log(data.toString());
    });

    hexoInstance.serverProcess.stderr.on('data', (data) => {
        console.error(data.toString());
    });

    hexoInstance.serverProcess.on('close', (code) => {
        console.log(`Hexo server process PID ${hexoInstance.serverProcess ? hexoInstance.serverProcess.pid : 'unknown'} exited with code ${code}`);
        hexoInstance.serverProcess = null;
    });

    hexoInstance.serverProcess.on('error', (error) => {
        console.error('Hexo server error:', error);
        hexoInstance.serverProcess = null;
    });

    return { status: 'success', message: `Hexo server started via child process with PID: ${hexoInstance.serverProcess.pid}` };
}

module.exports = {
    initHexoServer
};