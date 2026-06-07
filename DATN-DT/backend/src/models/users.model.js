const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelUser = new Schema(
    {
        fullName: { type: String, require: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: { type: String, require: true },
        isAdmin: { type: Boolean, default: false },
        address: { type: String, require: false, default: '' },
        phone: { type: String, require: false, default: '' },
        birthDay: { type: Date, require: false, default: null },
        typeLogin: { type: String, enum: ['email', 'google'] },
        avatar: { type: String, require: false, default: '' },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('user', modelUser);
