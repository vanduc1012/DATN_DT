const path = require('path');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const User = require('../models/users.model');
const normalizeEmail = require('../utils/normalizeEmail');

const fixDuplicateEmails = async () => {
    await mongoose.connect(process.env.CONNECT_DB, { serverSelectionTimeoutMS: 20000 });

    const users = await User.find().sort({ createdAt: 1 });
    const seen = new Map();
    let removed = 0;

    for (const user of users) {
        const email = normalizeEmail(user.email);

        if (user.email !== email) {
            user.email = email;
            await user.save();
        }

        if (seen.has(email)) {
            await user.deleteOne();
            removed += 1;
            console.log(`Removed duplicate: ${user.fullName} <${email}>`);
            continue;
        }

        seen.set(email, user._id);
    }

    await User.syncIndexes();
    console.log(`Done. Removed ${removed} duplicate account(s).`);
};

fixDuplicateEmails()
    .then(() => mongoose.disconnect())
    .catch(async (error) => {
        console.error('Failed:', error.message);
        await mongoose.disconnect();
        process.exit(1);
    });
