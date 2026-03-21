const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 7+ không cần useNewUrlParser, useUnifiedTopology nữa
    });
    logger.info(`✅ MongoDB kết nối thành công: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`❌ Lỗi kết nối MongoDB: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
