const log = require('../utils/logging.js');

module.exports = (app, authenticate, getHexoUtils) => {

    app.post('/api/server/stop', authenticate, async (req, res) => {
        const hexoUtils = getHexoUtils();
        try {
            
            log.infoLog('[Server Close] Initiating server close request...');
            const pcres = await hexoUtils.stopHexoServer();
            log.successLog('[Server Close] Server closed successfully.');
            log.grayline();
            return res.json({ status: pcres.status ? 'success' : 'error', message: pcres.message });

        } catch (err) {

            log.errorLog('[Server Close Error]', err);
            log.grayline();
            return res.status(500).json({
                status: 'error',
                message: 'Server failed to close',
                error: err.message
            });

        }
    });
};
