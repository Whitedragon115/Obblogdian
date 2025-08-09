module.exports = (app, authenticate, getHexoUtils) => {
    app.post('/api/sync', authenticate, async (req, res) => {
        try {

            const { syncPosts } = require('../utils/sync.js');
            await syncPosts();

            const hexoUtils = getHexoUtils();
            if (hexoUtils.hexoInstance.running) hexoUtils.resetAutoShutdownTimer();

            return res.json({
                status: 'success',
                message: 'Sync completed.',
                link: process.env.SERVER_LINK,
                localSyncPath: require('path').join(process.cwd(), 'source', '_posts')
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
};
