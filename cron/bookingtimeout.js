const { Booking, User } = require('../models/index'); // adjust path
const logger = require('../utils/logger');
const sendSMS = require('../utils/sms');

module.exports.bookingTimeout = async () => {
    try {
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

        const expiredRequests = await Booking.find({
            status: 'Upcoming',
            createdAt: { $lte: thirtyMinutesAgo }
        });

        if (expiredRequests.length === 0) {
            logger.info('No expired bookings found');
            return;
        }

        for (const request of expiredRequests) {
            try {
                const userdata = await User.findByPk(request.userId);

                if (!userdata) {
                    logger.warn(`User not found for bookingId=${request.id}`);
                    continue;
                }

                const smsBody =
                    'Hi, Therapist you requested is not responding. Kindly select another therapist.';

                await sendSMS(userdata.phone, smsBody);

                request.status = 'Timeout';
                await request.save();

                logger.info(
                    `Timeout SMS sent | bookingId=${request.id} | userId=${request.userId}`
                );
            } catch (innerErr) {
                logger.error(
                    `Failed processing bookingId=${request.id} | ${innerErr.message}`
                );
            }
        }

        logger.info(`Booking timeout processed: ${expiredRequests.length}`);
    } catch (error) {
        logger.error(`Booking timeout cron error: ${error.message}`);
    }
};


