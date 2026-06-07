const modelUser = require('../models/users.model');
const modelApiKey = require('../models/apiKey.model');
const modelOtp = require('../models/otp.model');
const modelMessageChatbot = require('../models/messageChatbot.model');
const ChatbotService = require('./chatbot.service');

const { createToken, createRefreshToken, createApiKey, verifyToken } = require('../utils/jwt');
const { jwtDecode } = require('jwt-decode');
const jwt = require('jsonwebtoken');

const {
    ConflictRequestError,
    BadRequestError,
    AuthFailureError,
    ForbiddenError,
} = require('../core/error.response');
const NotificationService = require('./notification.service');

const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const CryptoJS = require('crypto-js');
const SendMailForgotPassword = require('../utils/sendMailForgotPassword');
const normalizeEmail = require('../utils/normalizeEmail');
const { isSuperAdmin } = require('../config/superAdmin');

class UserService {
    async createUser(data) {
        const { fullName, email, password, phone } = data;
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail) {
            throw new BadRequestError('Email không hợp lệ');
        }

        const findUser = await modelUser.findOne({ email: normalizedEmail });
        if (findUser) {
            throw new ConflictRequestError('Email đã tồn tại');
        }

        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const passwordHash = bcrypt.hashSync(password, salt);

        // Tạo user mới
        const newUser = await modelUser.create({
            fullName,
            email: normalizedEmail,
            password: passwordHash,
            phone: phone || '',
            typeLogin: 'email',
        });

        // Send welcome notification
        await NotificationService.createNotification({
            userId: newUser._id,
            type: 'system',
            title: '🎉 Chào mừng bạn đến với SânBóngPro!',
            message: `Xin chào ${fullName}! Cảm ơn bạn đã đăng ký. Khám phá các sân bóng chất lượng và đặt sân ngay hôm nay!`,
            data: { type: 'welcome' },
        });

        return true;
    }

    async authUser(id) {
        const findUser = await modelUser.findById(id);
        if (!findUser) {
            throw new AuthFailureError('Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại');
        }
        const userString = JSON.stringify(findUser);
        const auth = CryptoJS.AES.encrypt(userString, process.env.SECRET_CRYPTO).toString();
        return auth;
    }

    async login(data) {
        const { email, password } = data;
        const user = await modelUser.findOne({ email: normalizeEmail(email) });
        if (!user) {
            throw new BadRequestError('Tài khoản hoặc mật khẩu không chính xác');
        }
        if (user.typeLogin === 'google') {
            throw new BadRequestError('Tài khoản đăng nhập bằng google');
        }

        const checkPassword = bcrypt.compareSync(password, user.password);
        if (!checkPassword) {
            throw new BadRequestError('Tài khoản hoặc mật khẩu không chính xác');
        }
        await createApiKey(user._id);
        const token = await createToken({ id: user._id });
        const refreshToken = await createRefreshToken({ id: user._id });
        return { token, refreshToken };
    }

    async logout(id) {
        await modelApiKey.deleteMany({ userId: id });
        return { status: 200 };
    }

    async refreshToken(refreshToken) {
        const decoded = await verifyToken(refreshToken);

        const user = await modelUser.findOne({ _id: decoded.id });
        if (!user) {
            throw new AuthFailureError('Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại');
        }

        const token = await createToken({ id: user._id });
        return { token };
    }

    async getAllUser() {
        const data = await modelUser.find();
        return data;
    }

    async updateUserAdmin(id, data) {
        const { fullName, email, phone, address, isAdmin, typeLogin } = data;
        const user = await modelUser.findOne({ _id: id });
        if (!user) {
            throw new BadRequestError('Tài khoản không tồn tại');
        }

        if (isSuperAdmin(user)) {
            if (isAdmin === false) {
                throw new ForbiddenError('Không thể thu hồi quyền admin chính');
            }

            const normalizedEmail = normalizeEmail(email);
            if (normalizedEmail !== user.email) {
                throw new ForbiddenError('Không thể thay đổi email của admin chính');
            }

            user.fullName = fullName;
            user.phone = phone;
            user.address = address;
            user.isAdmin = true;
            user.typeLogin = typeLogin;
            await user.save();
            return user;
        }

        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail) {
            throw new BadRequestError('Email không hợp lệ');
        }

        const emailOwner = await modelUser.findOne({ email: normalizedEmail, _id: { $ne: id } });
        if (emailOwner) {
            throw new ConflictRequestError('Email đã được sử dụng bởi tài khoản khác');
        }

        user.fullName = fullName;
        user.email = normalizedEmail;
        user.phone = phone;
        user.address = address;
        user.isAdmin = isAdmin;
        user.typeLogin = typeLogin;
        await user.save();
        return user;
    }

    async deleteUser(id) {
        const user = await modelUser.findOne({ _id: id });
        if (!user) {
            throw new BadRequestError('Tài khoản không tồn tại');
        }

        if (isSuperAdmin(user)) {
            throw new ForbiddenError('Không thể xóa tài khoản admin chính');
        }

        await user.deleteOne();
        return user;
    }

    async changePassword(id, data) {
        const { currentPassword, newPassword } = data;
        const user = await modelUser.findOne({ _id: id });
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }
        const isPasswordValid = bcrypt.compareSync(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new BadRequestError('Mật khẩu hiện tại không chính xác');
        }
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const passwordHash = bcrypt.hashSync(newPassword, salt);
        user.password = passwordHash;
        await user.save();
        return user;
    }

    async updateUser(id, data) {
        // Chấp nhận cả 'birthday' (frontend) lẫn 'birthDay' (model)
        const { fullName, address, phone, birthDay, birthday } = data;
        const user = await modelUser.findOne({ _id: id });
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }
        // Chỉ update field được gửi lên, không override email
        if (fullName !== undefined) user.fullName = fullName;
        if (address !== undefined) user.address = address;
        if (phone !== undefined) user.phone = phone;
        // Hỗ trợ cả 2 tên field birthday/birthDay
        const birthdayValue = birthday !== undefined ? birthday : birthDay;
        if (birthdayValue !== undefined) user.birthDay = birthdayValue;
        await user.save();
        return user;
    }

    async uploadAvatar(id, filename) {
        const user = await modelUser.findOne({ _id: id });
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }
        // Lưu đường dẫn đầy đủ để frontend có thể dùng trực tiếp
        user.avatar = `/uploads/avatars/${filename}`;
        await user.save();
        return user;
    }

    async loginGoogle(credential) {
        const dataToken = jwtDecode(credential);
        const user = await modelUser.findOne({ email: normalizeEmail(dataToken.email) });

        if (user) {
            await createApiKey(user._id);
            const token = await createToken({ id: user._id });
            const refreshToken = await createRefreshToken({ id: user._id });
            return { token, refreshToken };
        } else {
            const newUser = await modelUser.create({
                email: normalizeEmail(dataToken.email),
                typeLogin: 'google',
                fullName: dataToken.name,
            });

            // Send welcome notification for new Google user
            await NotificationService.createNotification({
                userId: newUser._id,
                type: 'system',
                title: '🎉 Chào mừng bạn đến với SânBóngPro!',
                message: `Xin chào ${dataToken.name}! Cảm ơn bạn đã đăng ký bằng Google. Khám phá các sân bóng chất lượng và đặt sân ngay hôm nay!`,
                data: { type: 'welcome' },
            });

            await createApiKey(newUser._id);
            const token = await createToken({ id: newUser._id });
            const refreshToken = await createRefreshToken({ id: newUser._id });
            return { token, refreshToken };
        }
    }

    async forgotPassword(email) {
        const user = await modelUser.findOne({ email: normalizeEmail(email) });
        if (!user) {
            throw new BadRequestError('Tài khoản không tồn tại');
        }

        const token = jwt.sign({ id: user._id }, process.env.SECRET_CRYPTO, { expiresIn: '5m' });

        const otp = otpGenerator.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });

        const saltRounds = 10;

        const otpHash = bcrypt.hashSync(otp, saltRounds);

        await modelOtp.create({ email: user.email, otp: otpHash });

        await SendMailForgotPassword(user.email, otp);

        return { token, otp };
    }

    async resetPassword(token, otpUser, newPassword) {
        const decoded = jwt.verify(token, process.env.SECRET_CRYPTO);
        const user = await modelUser.findOne({ _id: decoded.id });

        if (!user) {
            throw new BadRequestError('Tài khoản không tồn tại');
        }
        const findOtp = await modelOtp.findOne({ email: user.email }).sort({ createdAt: -1 });

        if (!findOtp) {
            throw new BadRequestError('Mã OTP không hợp lệ');
        }

        const checkOtp = bcrypt.compareSync(otpUser, findOtp.otp);
        if (!checkOtp) {
            throw new BadRequestError('Mã OTP không hợp lệ');
        }
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const passwordHash = bcrypt.hashSync(newPassword, salt);
        user.password = passwordHash;
        await user.save();
        return user;
    }

    async chatbot(question, userId) {
        const result = await ChatbotService.processMessage(question, userId);

        await modelMessageChatbot.create({
            userId,
            sender: 'user',
            content: question,
        });

        await modelMessageChatbot.create({
            userId,
            sender: 'bot',
            content: result.reply,
            metadata: {
                intent: result.intent,
                suggestions: result.suggestions,
                needsHuman: result.needsHuman,
            },
        });

        return result;
    }

    async getMessageChatbot(userId) {
        const messageChatbot = await modelMessageChatbot.find({ userId });
        return messageChatbot;
    }
}

module.exports = new UserService();
