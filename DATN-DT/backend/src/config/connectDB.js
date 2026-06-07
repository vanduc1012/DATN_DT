const dns = require('dns');
const mongoose = require('mongoose');

dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
    const mongoUri = process.env.CONNECT_DB;

    if (!mongoUri) {
        console.error('CONNECT_DB is not set — API runs without database');
        return;
    }

    console.log('CONNECT_DB exists:', true);
    console.log('Mongo URI:', mongoUri.replace(/\/\/.*@/, '//***@'));

    await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
    });

    console.log('✅ MongoDB connected');
};

module.exports = connectDB;