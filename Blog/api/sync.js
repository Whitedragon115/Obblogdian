const log = require('../utils/logging.js');

module.exports = (app, authenticate, getHexoUtils) => {
    app.post('/api/sync', authenticate, async (req, res) => {
        try {

            log.infoLog('[Sync] Initiating sync request...');
            const { syncPosts } = require('../utils/sync.js');
            await syncPosts();

            const hexoUtils = getHexoUtils();
            if (hexoUtils.hexoInstance.running) hexoUtils.resetAutoShutdownTimer();
            log.successLog('[Sync] Sync completed successfully.');
            log.grayline();

            return res.json({
                status: 'success',
                message: 'Sync completed.',
                link: process.env.SERVER_LINK,
                localSyncPath: require('path').join(process.cwd(), 'source', '_posts')
            });

        } catch (err) {

            log.errorLog('[Sync Error]', err);
            log.grayline();
            
            return res.status(500).json({
                status: 'error',
                message: 'Sync failed',
                error: err.message
            });
        
        }
    });
};
