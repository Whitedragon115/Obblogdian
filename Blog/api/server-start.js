const log = require('../utils/logging.js');

module.exports = (app, authenticate, getHexoUtils) => {

    app.post('/api/server/start', authenticate, async (req, res) => {
        try {

            log.infoLog('[Server Start] Initiating server start request...');
            const hexoUtils = getHexoUtils();
            
            if (hexoUtils.hexoInstance.running) {
                hexoUtils.resetAutoShutdownTimer();
                log.successLog('[Server Start] Server already started.');
                log.grayline();

                return res.json({
                    status: 'success',
                    message: 'Server already started.',
                    link: process.env.SERVER_LINK
                });
            }

            await hexoUtils.initHexoServer();
            hexoUtils.resetAutoShutdownTimer();
            log.successLog('[Server Start] Server started successfully.');
            log.grayline();

            return res.json({
                status: 'success',
                message: 'Server started.',
                link: process.env.SERVER_LINK
            });

        } catch (err) {

            log.errorLog('[Server Start Error]', err);
            log.grayline();

            return res.status(500).json({
                status: 'error',
                message: 'Server failed to start',
                error: err.message
            });

        }
    });
};
