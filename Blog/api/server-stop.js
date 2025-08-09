module.exports = (app, authenticate, getHexoUtils) => {

    app.post('/api/server/stop', authenticate, async (req, res) => {
        const hexoUtils = getHexoUtils();
        try {

            const pcres = await hexoUtils.stopHexoServer();
            return res.json({ status: pcres.status ? 'success' : 'error', message: pcres.message });

        } catch (err) {
            console.error('[Server Close Error]', err);
            return res.status(500).json({
                status: 'error',
                message: 'Server failed to close',
                error: err.message
            });
        }
    });
};
