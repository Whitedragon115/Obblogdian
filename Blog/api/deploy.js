const log = require('../utils/logging.js');

module.exports = (app, authenticate, getHexoUtils) => {
    app.post('/api/deploy', authenticate, async (req, res) => {
        try {

            log.infoLog('[Deploy] Initiating deployment...');
            const hexoUtils = getHexoUtils();
            await hexoUtils.deployHexoSite();
            
            log.successLog('[Deploy] Deployment successful.');
            log.grayline();

            return res.json({
                status: 'success',
                message: 'Deploy completed.',
                serverLink: process.env.SERVER_LINK
            });

        } catch (err) {
            log.errorLog('[Deploy Error]', err);
            log.grayline();
            return res.status(500).json({
                status: 'error',
                message: 'Deploy failed',
                error: err.message
            });
        }
    });
};
