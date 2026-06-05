const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        if (!process.env.CONNECT_DB) {
            throw new Error('CONNECT_DB is missing');
        }

        console.log('Connecting to MongoDB...');

        await mongoose.connect(process.env.CONNECT_DB, {
            serverSelectionTimeoutMS: 10000,
        });

        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error.message);
    }
};

module.exports = connectDB;