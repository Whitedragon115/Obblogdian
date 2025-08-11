const fs = require('fs').promises;
const path = require('path');
const log = require('../utils/logging.js');
const { resetAutoShutdownTimer } = require('./hexo.js');

async function syncPosts() {
    const { createClient } = await import('webdav');
    const client = createClient(process.env.WEBDAV_URL, {
        username: process.env.WEBDAV_USERNAME,
        password: process.env.WEBDAV_PASSWORD
    });

    const remoteFiles = await client.getDirectoryContents(process.env.WEBDAV_REMOTE_BASE, { deep: true });
    const localBasePath = path.join(process.cwd(), 'hexo', 'source', '_posts');
    await fs.mkdir(localBasePath, { recursive: true });

    const remoteFilePaths = [];

    for (const item of remoteFiles) {
        if (item.filename.includes('~temp')) continue;
        if (item.type === 'file') {
            const relativeFilePath = item.filename.replace(process.env.WEBDAV_REMOTE_BASE, '').replace(/^\//, '');
            remoteFilePaths.push(item.basename);
            log.noteLog(`Syncing file: ${relativeFilePath}`);

            const localFilePath = path.join(localBasePath, relativeFilePath);
            const localDir = path.dirname(localFilePath);

            await fs.mkdir(localDir, { recursive: true });
            const content = await client.getFileContents(item.filename, { format: 'text' });
            await fs.writeFile(localFilePath, content, 'utf8');
        }
    }

    const allLocalFiles = await getAllLocalFiles(localBasePath);
    
    for (const localFile of allLocalFiles) {
        const localFileName = path.basename(localFile);
        if (!remoteFilePaths.includes(localFileName)) {
            const localFilePath = path.join(localFile);
            await fs.unlink(localFilePath);
            log.noteLog(`Deleted local file: ${localFileName}`);
        }
    }

    resetAutoShutdownTimer();
}

async function getAllLocalFiles(basePath) {
    const files = [];
    async function walk(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await walk(fullPath);
            } else if (entry.isFile()) {
                files.push(fullPath);
            }
        }
    }
    await walk(basePath);
    return files;
}

module.exports = {
    syncPosts
};