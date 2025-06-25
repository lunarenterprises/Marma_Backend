const { Notification } = require('../../models/index')


module.exports.ListAllNotifications = async (req, res) => {
    try {
        let user = req.user
        let notifications = await Notification.findAll({
            where: {
                n_therapist_id: user.id
            },
            order: [['createdAt', 'DESC']]
        });
        return res.send({
            result: true,
            message: "Notifications fetched successfully",
            data: notifications
        })
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}


module.exports.UpdateNotificationStatus = async (req, res) => {
    try {
        let user = req.user
        let { notification_id } = req.body
        if (notification_id.lenth > 0) {
            notification_id.forEach(async (item) => {
                await Notification.update({ n_status: "inactive" }, { where: { n_id: item, n_therapist_id: user.id } })
            })
        }
        return res.send({
            result: true,
            message: "Notification updated successfully"
        })
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}