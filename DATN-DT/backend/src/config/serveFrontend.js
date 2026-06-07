const fs = require('fs');
const path = require('path');
const express = require('express');

const distPath = path.resolve(__dirname, '../../../frontend/dist');

function hasFrontendBuild() {
    return fs.existsSync(path.join(distPath, 'index.html'));
}

function serveFrontend(app) {
    if (!hasFrontendBuild()) {
        console.log('Frontend dist not found — API-only mode');
        app.get('/', (req, res) => {
            res.json({ success: true, message: 'Backend API is running' });
        });
        return;
    }

    console.log('Serving frontend from', distPath);
    app.use(express.static(distPath));

    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path === '/health') {
            return next();
        }
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

module.exports = { serveFrontend, hasFrontendBuild };
