const cron = require('node-cron');
const Booking = require('../models/booking.model');
const NotificationService = require('../services/notification.service');

// Booking reminder - runs every 30 minutes
// Sends reminder 1 hour before booking time
function startBookingReminderJob() {
    // Run every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
        console.log('[CRON] Running booking reminder check...');

        try {
            const now = new Date();
            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
            const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

            // Get today's date string
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Find bookings for today that haven't been reminded yet
            const bookings = await Booking.find({
                bookingDate: {
                    $gte: today,
                    $lt: tomorrow,
                },
                status: { $in: ['paid', 'confirmed'] },
                reminderSent: { $ne: true },
            }).populate('fieldId', 'name address');

            const nowHours = now.getHours();
            const nowMinutes = now.getMinutes();
            const currentTimeMinutes = nowHours * 60 + nowMinutes;

            for (const booking of bookings) {
                // Parse startTime (format: "HH:MM")
                const [hours, minutes] = booking.startTime.split(':').map(Number);
                const bookingTimeMinutes = hours * 60 + minutes;

                // Check if booking is within 30-90 minutes from now
                const timeDiff = bookingTimeMinutes - currentTimeMinutes;

                if (timeDiff > 30 && timeDiff <= 90) {
                    // Send reminder notification
                    await NotificationService.createNotification({
                        userId: booking.userId,
                        type: 'booking_reminder',
                        title: '⏰ Nhắc nhở lịch đá bóng!',
                        message: `Bạn có lịch đá bóng tại ${booking.fieldId?.name || 'Sân bóng'} lúc ${booking.startTime} hôm nay. Đừng quên nhé!`,
                        data: {
                            bookingId: booking._id,
                            fieldId: booking.fieldId?._id,
                            startTime: booking.startTime,
                        },
                    });

                    // Mark as reminded
                    await Booking.findByIdAndUpdate(booking._id, { reminderSent: true });

                    console.log(`[CRON] Sent reminder for booking ${booking._id}`);
                }
            }

            console.log('[CRON] Booking reminder check complete');
        } catch (error) {
            console.error('[CRON] Error in booking reminder:', error);
        }
    });

    console.log('📅 Booking reminder cron job started (runs every 30 minutes)');
}

module.exports = { startBookingReminderJob };
