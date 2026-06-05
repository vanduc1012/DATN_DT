const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('CONNECT_DB exists:', !!process.env.CONNECT_DB);
        console.log(
            'Mongo URI:',
            process.env.CONNECT_DB?.replace(/\/\/.*@/, '//***@')
        );

        await mongoose.connect(process.env.CONNECT_DB, {
            serverSelectionTimeoutMS: 10000,
        });

        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
    }
};

module.exports = connectDB;