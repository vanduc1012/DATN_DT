const mongoose = require('mongoose');
const fieldPriceSchema = new mongoose.Schema(
    {
        fieldId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Field',
            required: true,
        },

        dayOfWeek: {
            type: Number, // 0 = Chủ nhật, 1 = Thứ 2 ...
            required: true,
        },

        startTime: {
            type: String, // "17:00"
            required: true,
        },

        endTime: {
            type: String, // "19:00"
            required: true,
        },

        price: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('FieldPrice', fieldPriceSchema);
