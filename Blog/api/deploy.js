module.exports = (app, authenticate, getHexoUtils) => {
    app.post('/api/deploy', authenticate, async (req, res) => {
        try {

            const hexoUtils = getHexoUtils();
            await hexoUtils.deployHexoSite();

            return res.json({
                status: 'success',
                message: 'Deploy completed.',
                serverLink: process.env.SERVER_LINK
            });
        } catch (err) {
            console.error('[Deploy Error]', err);
            return res.status(500).json({
                status: 'error',
                message: 'Deploy failed',
                error: err.message
            });
        }
    });
};
