var {Notification} = require('../../models/index')

module.exports.GetNotification = async (req, res) => {
    try {
        let {therapist_id } = req.headers
        if (!therapist_id) {
            return res.send({
                result: false,
                message: "therapist id is required"
            })
        }
        let data = await Notification.findAll({
            where:{n_therapist_id:therapist_id}
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