const { Therapist, WalletHistory } = require('../../models/index');
const { Sequelize } = require('sequelize');

module.exports.ListWalletHistory = async (req, res) => {
    try {
        let user = req.user;
        let therapist_id = user.id;

        const therapist = await Therapist.findOne({ where: { id: therapist_id } });

        if (!therapist) {
            return res.status(404).send({
                result: false,
                message: "Therapist details not found",
            });
        }

        // Fetch wallet history
        let data = await WalletHistory.findAll({
            where: { wh_therapist_id: therapist_id },
            order: [['createdAt', 'DESC']],
        });

        // Get total earnings (Credit)
        const totalEarnings = await WalletHistory.sum('wh_amount', {
            where: {
                wh_therapist_id: therapist_id,
                wh_type: 'Credit',
            },
        });

        // Get total withdrawals (Debit)
        const totalWithdrawals = await WalletHistory.sum('wh_amount', {
            where: {
                wh_therapist_id: therapist_id,
                wh_type: 'Debit',
            },
        });

        return res.send({
            result: true,
            message: data.length > 0 ? "Data retrieved" : "No history found",
            total_earnings: totalEarnings || 0,
            total_withdrawals: totalWithdrawals || 0,
            data: data

        });
    } catch (error) {
        return res.status(500).send({
            result: false,
            message: error.message,
        });
    }
};
