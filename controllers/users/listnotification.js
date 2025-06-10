var {Notification} = require('../../models/index')

module.exports.GetNotification = async (req, res) => {
    try {
        let {user_id } = req.headers
        if (!user_id) {
            return res.send({
                result: false,
                message: "user id is required"
            })
        }
        let data = await Notification.findAll({
            where:{n_user_id:user_id}
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