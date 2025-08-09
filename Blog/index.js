const express = require('express');
const path = require('path');
const fs = require('fs').promises;

require('dotenv').config();
const API_PORT = process.env.API_PORT;

const app = express();

app.use(express.json());

let hexoUtils;
const getHexoUtils = () => {
    if (!hexoUtils) { hexoUtils = require('./utils/hexo'); }
    return hexoUtils;
};

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
    try {
        const apiFiles = await fs.readdir(apiPath);

        for (const file of apiFiles) {
            if (file.endsWith('.js')) {
                const routeModule = require(path.join(apiPath, file));
                if (typeof routeModule === 'function') {
                    routeModule(app, authenticate, getHexoUtils);
                    console.log(`Loaded API route: ${file}`);
                }
            }
        }
    } catch (error) {
        console.warn('API folder not found or error loading routes:', error.message);
    }
};

loadApiRoutes();

app.listen(API_PORT, () => {
    console.log(`API server is running on port ${API_PORT}.`);
});