require('dotenv').config();

const express = require('express');
const http = require('http');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/connectDB');
const routes = require('./routes/index.routes');
const { initSocket } = require('./config/socket');

const app = express();
const port = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const normalizeOrigin = (origin) => origin?.replace(/\/$/, '');

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    normalizeOrigin(process.env.URL_CLIENT),
].filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(normalizeOrigin(origin))) {
                return callback(null, true);
            }

            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
    }),
);

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

if (process.env.NODE_ENV !== 'production') {
    server.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
    });
}

module.exports = app;