const mongoose = require('mongoose');

const chatbotSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
            unique: true,
        },
        flow: {
            type: String,
            enum: ['idle', 'booking', 'cancel', 'reschedule', 'lookup'],
            default: 'idle',
        },
        step: {
            type: String,
            default: null,
        },
        data: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('ChatbotSession', chatbotSessionSchema);
