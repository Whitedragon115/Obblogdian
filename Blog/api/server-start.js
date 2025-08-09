module.exports = (app, authenticate, getHexoUtils) => {

    app.post('/api/server/start', authenticate, async (req, res) => {
        try {
            const hexoUtils = getHexoUtils();
            
            if (hexoUtils.hexoInstance.running) {
                hexoUtils.resetAutoShutdownTimer();
                return res.json({
                    status: 'success',
                    message: 'Server already started.',
                    link: process.env.SERVER_LINK
                });
            }

            await hexoUtils.initHexoServer();
            hexoUtils.resetAutoShutdownTimer();

            return res.json({
                status: 'success',
                message: 'Server started.',
                link: process.env.SERVER_LINK
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
};
