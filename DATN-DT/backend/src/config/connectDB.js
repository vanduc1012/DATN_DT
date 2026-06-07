const dns = require('dns');
const mongoose = require('mongoose');

dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
    try {
        const mongoUri = process.env.CONNECT_DB;

        if (!mongoUri) {
            throw new Error(
                'MongoDB connection URI is not defined. Please set CONNECT_DB in backend/.env or the environment.'
            );
        }

        console.log('CONNECT_DB exists:', true);
        console.log('Mongo URI:', mongoUri.replace(/\/\/.*@/, '//***@'));

        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
        });

        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;