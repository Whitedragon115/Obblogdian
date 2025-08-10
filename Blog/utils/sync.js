const fs = require('fs').promises;
const path = require('path');
const { resetAutoShutdownTimer } = require('./hexo.js');

async function syncPosts() {
    const { createClient } = await import('webdav');
    const client = createClient(process.env.WEBDAV_URL, {
        username: process.env.WEBDAV_USERNAME,
        password: process.env.WEBDAV_PASSWORD
    });

    const remoteFiles = await client.getDirectoryContents(process.env.WEBDAV_REMOTE_BASE, { deep: true });

    const localBasePath = path.join(process.cwd(), 'hexo', 'source', '_posts');
    // await fs.rm(localBasePath, { recursive: true, force: true });
    // await fs.mkdir(localBasePath, { recursive: true });

    for (const item of remoteFiles) {
        if(item.filename.includes('~temp')) continue;
        if (item.type === 'file') {
            const relativeFilePath = item.filename
                .replace(process.env.WEBDAV_REMOTE_BASE, '')
                .replace(/^\//, '');

            const localFilePath = path.join(localBasePath, relativeFilePath);
            const localDir = path.dirname(localFilePath);

            await fs.mkdir(localDir, { recursive: true });
            const content = await client.getFileContents(item.filename, { format: 'text' });
            await fs.writeFile(localFilePath, content, 'utf8');
        }
    }

    resetAutoShutdownTimer();
}

module.exports = {
    syncPosts
};
