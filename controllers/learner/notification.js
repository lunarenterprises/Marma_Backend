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