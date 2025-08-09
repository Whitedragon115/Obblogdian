module.exports = (app, authenticate, getHexoUtils) => {
    app.post('/api/ping', authenticate, async (req, res) => {
        try {
            return res.json({
                status: 'success',
                message: 'Ping successful.',
                serverLink: process.env.SERVER_LINK
            });
        } catch (err) {
            console.error('[Ping Error]', err);
            return res.status(500).json({
                status: 'error',
                message: 'Ping failed',
                error: err.message
            });
        }
    });
};
