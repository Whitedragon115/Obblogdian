require('dotenv').config();
const express = require('express');
const Hexo = require('hexo');
const path = require('path');
const fs = require('fs').promises;
const cfg = require('./config.json');

const API_PORT = cfg.API_PORT;
const PREVIEW_PORT = cfg.PREVIEW_PORT;
const SERVER_LINK = cfg.SERVER_LINK;

const WEBDAV_URL = cfg.WEBDAV_URL;
const WEBDAV_USERNAME = cfg.WEBDAV_USERNAME;
const WEBDAV_PASSWORD = cfg.WEBDAV_PASSWORD;
const WEBDAV_REMOTE_BASE = cfg.WEBDAV_REMOTE_BASE;

const app = express();
app.use(express.json());

let hexoInstance = null;
let hexoServer = null;
let isServerRunning = false;

let autoShutdownTimer = null;

const AUTO_SHUTDOWN_MS = 30 * 60 * 1000;

function resetHexoState() {
    hexoInstance = null;
    hexoServer = null;
    isServerRunning = false;
}

function resetAutoShutdownTimer() {
    if (autoShutdownTimer) {
        clearTimeout(autoShutdownTimer);
        autoShutdownTimer = null;
    }
    if (isServerRunning) {
        autoShutdownTimer = setTimeout(async () => {
            console.log(`[AutoShutdown] Server is inactive for 30 minutes. Shutting down...`);
            await stopHexoServer();
        }, AUTO_SHUTDOWN_MS);
    }
}

function authenticate(req, res, next) {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized: missing or invalid Authorization header' });
        }
        const token = header.split(' ')[1];
        if (!token || token !== process.env.API_TOKEN) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized: token mismatch' });
        }
        next();
    } catch (error) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized: parse error', detail: error });
    }
}

async function startHexoServer() {
    if (isServerRunning) return;

    hexoInstance = new Hexo(process.cwd(), {});
    await hexoInstance.init();
    await hexoInstance.call('clean', {});
    await hexoInstance.call('generate', {});

    hexoServer = await hexoInstance.call('server', { port: PREVIEW_PORT });
    isServerRunning = true;

    resetAutoShutdownTimer();
}

async function stopHexoServer() {
    if (!isServerRunning || !hexoServer) return;

    await hexoServer.close();

    if (hexoInstance) {
        await hexoInstance.exit();
    }

    resetHexoState();

    if (autoShutdownTimer) {
        clearTimeout(autoShutdownTimer);
        autoShutdownTimer = null;
    }
}

async function deployHexoSite() {
    if (isServerRunning) {
        await stopHexoServer();
    }

    const tmpHexo = new Hexo(process.cwd(), {});
    await tmpHexo.init();
    await tmpHexo.call('clean', {});
    await tmpHexo.call('generate', {});
    await tmpHexo.call('deploy', {});
    await tmpHexo.exit();
}

async function syncPosts() {
    const { createClient } = await import('webdav');
    const client = createClient(WEBDAV_URL, {
        username: WEBDAV_USERNAME,
        password: WEBDAV_PASSWORD
    });

    const remoteFiles = await client.getDirectoryContents(WEBDAV_REMOTE_BASE, { deep: true });

    const localBasePath = path.join(process.cwd(), 'source', '_posts');
    await fs.rm(localBasePath, { recursive: true, force: true });
    await fs.mkdir(localBasePath, { recursive: true });

    for (const item of remoteFiles) {
        if (item.type === 'file') {
            const relativeFilePath = item.filename
                .replace(WEBDAV_REMOTE_BASE, '')
                .replace(/^\//, '');

            const localFilePath = path.join(localBasePath, relativeFilePath);
            const localDir = path.dirname(localFilePath);

            await fs.mkdir(localDir, { recursive: true });
            const content = await client.getFileContents(item.filename, { format: 'text' });
            await fs.writeFile(localFilePath, content, 'utf8');
        }
    }
}

app.post('/sync', authenticate, async (req, res) => {
    try {
        await syncPosts();

        if (isServerRunning) {
            resetAutoShutdownTimer();
        }

        return res.json({
            status: 'success',
            message: 'Sync completed.',
            link: `${SERVER_LINK}`,
            localSyncPath: `${path.join(process.cwd(), 'source', '_posts')}`
        });

    } catch (err) {
        console.error('[Sync Error]', err);
        return res.status(500).json({
            status: 'error',
            message: 'Sync failed',
            error: err.message
        });
    }
});

app.post('/deploy', authenticate, async (req, res) => {
    try {
        await deployHexoSite();

        const { keepServer } = req.body;
        if (keepServer) {
            await startHexoServer();
            if (isServerRunning) {
                resetAutoShutdownTimer();
            }
        }

        return res.json({
            status: 'success',
            message: 'Deploy completed.',
            serverLink: keepServer ? `${SERVER_LINK}` : null
        });
    } catch (err) {
        console.error('[Deploy Error]', err);
        return res.status(500).json({
            status: 'error',
            message: 'Deploy failed',
            error: err.message
        });
    }
});

app.post('/server/start', authenticate, async (req, res) => {
    try {
        if (isServerRunning) {
            resetAutoShutdownTimer();
            return res.json({
                status: 'success',
                message: 'Server already started.',
                link: `${SERVER_LINK}`
            });
        }

        await startHexoServer();

        return res.json({
            status: 'success',
            message: 'Server started.',
            link: `${SERVER_LINK}`
        });
    } catch (err) {
        console.error('[Server Start Error]', err);
        return res.status(500).json({
            status: 'error',
            message: 'Server failed to start',
            error: err.message
        });
    }
});

app.post('/server/close', authenticate, async (req, res) => {
    try {
        if (!isServerRunning) {
            return res.json({ status: 'success', message: 'Server already closed.' });
        }

        await stopHexoServer();

        return res.json({
            status: 'success',
            message: 'Server closed.'
        });
    } catch (err) {
        console.error('[Server Close Error]', err);
        return res.status(500).json({
            status: 'error',
            message: 'Server failed to close',
            error: err.message
        });
    }
});

app.listen(API_PORT, () => {
    console.log(`API server is running on port ${API_PORT}.`);
});