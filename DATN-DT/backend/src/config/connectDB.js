const Mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    const mongoUri = process.env.CONNECT_DB || 'mongodb://127.0.0.1:27017/datn';
    try {
        await Mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
    }
};

module.exports = connectDB;
