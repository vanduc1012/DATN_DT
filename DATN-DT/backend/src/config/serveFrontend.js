const fs = require('fs');
const path = require('path');
const express = require('express');

const distCandidates = [
    path.resolve(__dirname, '../../public'),
    path.resolve(__dirname, '../../../frontend/dist'),
];

function resolveDistPath() {
    return distCandidates.find((dir) => fs.existsSync(path.join(dir, 'index.html'))) || null;
}

function serveFrontend(app) {
    const distPath = resolveDistPath();

    if (!distPath) {
        console.log('Frontend dist not found — API-only mode');
        app.get('/', (req, res) => {
            res.json({ success: true, message: 'Backend API is running' });
        });
        return;
    }

    console.log('Serving frontend from', distPath);
    app.use(express.static(distPath));

    app.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path === '/health') {
            return next();
        }
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

module.exports = { serveFrontend, resolveDistPath };
