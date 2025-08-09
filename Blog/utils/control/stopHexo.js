const { hexoInstance } = require('../hexo.js');

async function stopHexoServer() {

    if (!hexoInstance.serverProcess || !hexoInstance.running) return { status: false, message: 'Hexo server is not running.' };

    const pid = hexoInstance.serverProcess.pid;
    const platform = process.platform;

    switch (platform) {
        case 'win32':
            win32Taskkill(pid);
            break;
        case 'linux':
            linuxKill(pid);
            break;
        case 'your_platform':
            userPlatformKill(pid);
            break;
        default:
            console.log(`Stopping Hexo server because of unknown platform: ${platform}`);
            process.exit(1);
    }
    
    hexoInstance.serverProcess = null;
    hexoInstance.running = false;
    return { status: true, message: 'Hexo server stopped successfully.' };
}

function win32Taskkill(pid) {
    const { spawn: spawnKiller } = require('child_process');
    const killer = spawnKiller('taskkill', ['/PID', String(pid), '/T', '/F'], { shell: true });

    killer.on('close', (code) => { console.log(`Taskkill exited with code ${code} for PID ${pid}`) });
}

function linuxKill(pid) {
    const { spawn: spawnKiller } = require('child_process');
    const killer = spawnKiller('kill', ['-9', String(pid)], { shell: true });

    killer.on('close', (code) => { console.log(`Kill exited with code ${code} for PID ${pid}`) });
}

function userPlatformKill(pid) {
    const { spawn: spawnKiller } = require('child_process');
    const killer = spawnKiller('<kill command>', ['arg1', String(pid)], { shell: true });

    killer.on('close', (code) => { console.log(`Kill exited with code ${code} for PID ${pid}`) });
}
module.exports = {
    stopHexoServer
}