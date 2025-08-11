const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const log = require('./utils/logging');
require('dotenv').config();

const API_PORT = process.env.API_PORT;
let hexoUtils;

const app = express();
app.use(express.json());

// Function

function getHexoUtils() {
    if (!hexoUtils) { hexoUtils = require('./utils/hexo'); }
    return hexoUtils;
}

function authenticate(req, res, next) {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized: missing or invalid Authorization header' });
        }
        const token = header.split(' ')[1];
        if (!token || token !== process.env.API_TOKEN) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized: token mismatch' });
        }
        next();
    } catch (error) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized: parse error', detail: error });
    }
}

const loadApiRoutes = async () => {
    const apiPath = path.join(__dirname, 'api');
    const apiFiles = await fs.readdir(apiPath);

    for (const file of apiFiles) {
        if (file.endsWith('.js')) {
            const routeModule = require(path.join(apiPath, file));
            if (typeof routeModule === 'function') {
                routeModule(app, authenticate, getHexoUtils);
                log.noteLog(`API route load: ${file}`);
            }
        }
    }

};

// Start server

async function init() {
    log.whitedoubleline()
    log.textLog('Starting Obblogdian API server...');
    log.grayline()
    app.listen(API_PORT, () => { log.successLog(`API server is running on port ${API_PORT}.`); });
    await loadApiRoutes();
    log.whiteline()
}

// call

init();