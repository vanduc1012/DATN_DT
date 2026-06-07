const path = require('path');

if (!process.env.RAILWAY_ENVIRONMENT) {
    require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
}

const express = require('express');
const http = require('http');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { getAllowedOrigins, getCorsOptions } = require('./config/cors');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.set('trust proxy', 1);

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'ok',
        port,
        env: process.env.NODE_ENV || 'development',
    });
});

app.get('/', (req, res) => {
    res.json({ success: true, message: 'Backend API is running' });
});

const server = http.createServer(app);

server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on 0.0.0.0:${port}`);
    bootstrap();
});

server.on('error', (error) => {
    console.error('Server listen error:', error);
    process.exit(1);
});

async function bootstrap() {
    console.log('NODE_ENV =', process.env.NODE_ENV);
    console.log('RAILWAY_ENVIRONMENT =', process.env.RAILWAY_ENVIRONMENT || 'local');
    console.log('RAILWAY_PUBLIC_DOMAIN =', process.env.RAILWAY_PUBLIC_DOMAIN || 'none');
    console.log('PORT =', port);
    console.log('URL_CLIENT =', process.env.URL_CLIENT);
    console.log('allowedOrigins =', getAllowedOrigins());

    const { options: corsOptions } = getCorsOptions();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(cors(corsOptions));
    app.options(/.*/, cors(corsOptions));
    app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads/avatars')));

    const routes = require('./routes/index.routes');
    routes(app);

    app.use((err, req, res, next) => {
        const statusCode = err.statusCode || 500;
        if (statusCode >= 500) console.error('Server error:', err);
        res.status(statusCode).json({ success: false, message: err.message || 'Lỗi server' });
    });

    try {
        const { initSocket } = require('./config/socket');
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

    try {
        const connectDB = require('./config/connectDB');
        await connectDB();
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
    }
}

module.exports = app;
