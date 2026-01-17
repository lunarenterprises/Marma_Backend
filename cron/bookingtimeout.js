const { Booking, User, Op } = require('../models/index'); // adjust path
const logger = require('../utils/logger');
const { sendSMS } = require('../utils/sms');
const moment = require('moment');

module.exports.bookingTimeout = async () => {
    try {
        const thirtyMinutesAgo = moment()
            .subtract(30, 'minutes')
            .toDate();
        console.log('thirtyMinutesAgo:', thirtyMinutesAgo);


        const expiredRequests = await Booking.findAll({
            where: {
                status: 'Upcoming',
                createdAt: {
                    [Op.lte]: thirtyMinutesAgo
                }
            }
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

                const smsBody = `Hi, Therapist you requested is not responding. Kindly select another therapist.`;


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
