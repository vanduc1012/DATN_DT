require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');
const { execSync } = require('child_process');

const PORT = process.env.PORT || 5000;

// Kill process đang chiếm port
const freePort = (port) => {
  try {
    const result = execSync(
      `for /f "tokens=5" %a in ('netstat -ano ^| findstr :${port} ^| findstr LISTENING') do taskkill /F /PID %a`,
      { shell: 'cmd.exe', stdio: 'pipe' }
    );
    logger.info(`Đã giải phóng port ${port}`);
  } catch {
    // Port chưa bị chiếm — bình thường
  }
};

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    logger.info(`📁 Môi trường: ${process.env.NODE_ENV}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.warn(`⚠️  Port ${PORT} đang bị chiếm, đang giải phóng...`);
      freePort(PORT);
      setTimeout(() => {
        server.close();
        app.listen(PORT, () => {
          logger.info(`🚀 Server khởi động lại tại http://localhost:${PORT}`);
        });
      }, 1000);
    } else {
      logger.error('Server error:', err);
      process.exit(1);
    }
  });
};

startServer().catch((err) => {
  logger.error('Không thể khởi động server:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

