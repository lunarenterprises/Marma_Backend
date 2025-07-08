let { User, Booking, PaymentHistory } = require('../../models/index')
const { Op, fn, col, literal } = require('sequelize');

module.exports.Dasboard = async (req, res) => {
    try {
        const user = req.user;

        if (user.Role.name !== 'admin') {
            return res.send({
                result: false,
                message: "You are not authorized. Please contact management."
            });
        }

        // Group Users by Month Name (e.g., Jan, Feb)
        const userData = await User.findAll({
            attributes: [
                [fn('DATE_FORMAT', col('createdAt'), '%b'), 'month'],
                [fn('COUNT', col('id')), 'register_count']
            ],
            group: [literal('month')],
            order: [[literal('MIN(createdAt)'), 'ASC']],
            raw: true
        });

        // Group Therapists by Month Name
        const bookingData = await Booking.findAll({
            attributes: [
                [fn('DATE_FORMAT', col('createdAt'), '%b'), 'month'],
                [fn('COUNT', col('id')), 'booking_count']
            ],
            group: [literal('month')],
            order: [[literal('MIN(createdAt)'), 'ASC']],
            raw: true
        });

        // Group PaymentHistory by Month Name
        const paymentData = await PaymentHistory.findAll({
            attributes: [
                [fn('DATE_FORMAT', col('createdAt'), '%b'), 'month'],
                [fn('SUM', col('ph_total_amount')), 'total_amount']
            ],
            group: [literal('month')],
            order: [[literal('MIN(createdAt)'), 'ASC']],
            raw: true
        });

        return res.send({
            result: true,
            message: "Dashboard data retrieved",
            registration: userData,
            booking: bookingData,
            payments: paymentData
        });

    } catch (error) {
        console.error("Dashboard error:", error);
        return res.status(500).send({
            result: false,
            message: error.message
        });
    }
};
