const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const http = require('http');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const connectDB = require('./config/connectDB');
const routes = require('./routes/index.routes');
const { initSocket } = require('./config/socket');

const app = express();
const port = process.env.PORT || 3000;

const normalizeOrigin = (origin) => origin?.replace(/\/$/, '');

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://datn-dt.vercel.app',
    'https://datn-3j79n4hob-vanduc1012-s-projects.vercel.app',
    'https://datndt-production.up.railway.app',
    normalizeOrigin(process.env.URL_CLIENT),
].filter(Boolean);

console.log('URL_CLIENT =', process.env.URL_CLIENT);
console.log('allowedOrigins =', allowedOrigins);

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        const normalizedOrigin = normalizeOrigin(origin);

        if (allowedOrigins.includes(normalizedOrigin)) {
            return callback(null, true);
        }

        console.log('Blocked by CORS:', normalizedOrigin);
        return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads/avatars')));

routes(app);

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Backend API is running',
    });
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    if (statusCode >= 500) {
        console.error('Server error:', err);
    }

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Lỗi server',
    });
});

const server = http.createServer(app);

try {
    initSocket(server);
} catch (error) {
    console.error('Socket init error:', error.message);
}

try {
    const { startBookingReminderJob } = require('./jobs/bookingReminder');
    startBookingReminderJob();
} catch (error) {
    console.error('Cron job error:', error.message);
}

connectDB();

server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;
