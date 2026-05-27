const express = require('express');
const http = require('http');
const app = express();
const port = 3000;

const connectDB = require('./config/connectDB');
const routes = require('./routes/index.routes');
const { initSocket } = require('./config/socket');

const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration to allow multiple origins
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', process.env.URL_CLIENT].filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    }),
);

app.use(express.static(path.join(__dirname, '../src')));

// Serve uploaded avatars
app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads/avatars')));

routes(app);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Lỗi server',
    });
});

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
initSocket(server);

// Start cron jobs
const { startBookingReminderJob } = require('./jobs/bookingReminder');
startBookingReminderJob();

server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
