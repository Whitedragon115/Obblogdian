const { hexoInstance } = require('../hexo.js');

async function stopHexoServer() {

    if (!hexoInstance.serverProcess || !hexoInstance.running) return { status: false, message: 'Hexo server is not running.' };

    const pid = hexoInstance.serverProcess.pid;
    const platform = process.platform;

    console.log(pid)

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
    const { exec } = require('child_process');
    exec(`ss -tlnp | grep :4001 | grep -o 'pid=[0-9]*'`, (error, stdout, stderr) => {
        if (error) {
            console.log(`Failed to find processes on port 4001: ${error.message}`);
        } else if (stdout.trim()) {
            const pidLines = stdout.trim().split('\n');
            console.log(`Found processes on port 4001: ${pidLines.join(', ')}`);

            pidLines.forEach(pidLine => {
                const processId = pidLine.split('=')[1];
                if (processId) {
                    exec(`kill -KILL ${processId}`, (killError) => {
                        if (killError) console.log(`Failed to kill PID ${processId}: ${killError.message}`);
                    });
                }
            });
        } else {
            console.log(`No processes found using port 4001`);
        }

        exec(`kill -KILL ${pid} 2>/dev/null`, (originalError) => { console.log(originalError ? `Original PID ${pid} cleanup had issues` : `Original PID ${pid} cleaned up`) });
    });
}

function userPlatformKill(pid) {
    const { spawn: spawnKiller } = require('child_process');
    const killer = spawnKiller('<kill command>', ['arg1', String(pid)], { shell: true });

    killer.on('close', (code) => { console.log(`Kill exited with code ${code} for PID ${pid}`) });
}
module.exports = {
    stopHexoServer
}