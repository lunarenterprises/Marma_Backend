const {Therapist,WalletHistory } = require('../../models/index');


module.exports.ListWalletHistory = async (req, res) => {
    try {
        
        let user = req.user
        let therapist_id = user.id
        const therapist = await Therapist.findOne({ where: { id: therapist_id } });
        if (!therapist) {
            return res.status(404).send({
                result: false,
                message: "Therapist details not found",
            });
        }

        let data = await WalletHistory.findAll({
            where: { wh_therapist_id: therapist_id }
        })

        if (data.length > 0) {
            return res.send({
                result: true,
                message: "data retrieved",
                data: data
            })
        } else {
            return res.send({
                result: false,
                message: "data not found"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}