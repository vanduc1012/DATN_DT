const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        type: { type: String, enum: ['5', '7', '11'], required: true },
        description: String,
        images: [String],
        address: String,
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        totalReviews: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['active', 'maintenance', 'inactive'],
            default: 'active',
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Field', fieldSchema);
