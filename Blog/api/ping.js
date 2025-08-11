const log = require('../utils/logging.js');

module.exports = (app, authenticate, getHexoUtils) => {
    app.post('/api/ping', authenticate, async (req, res) => {
        try {

            log.successLog('[Ping] Received ping request');
            log.grayline();

            return res.json({
                status: 'success',
                message: 'Ping successful.',
                serverLink: process.env.SERVER_LINK
            });

        } catch (err) {

            log.errorLog('[Ping Error]', err);
            log.grayline();
            return res.status(500).json({
                status: 'error',
                message: 'Ping failed',
                error: err.message
            });
            
        }
    });
};
