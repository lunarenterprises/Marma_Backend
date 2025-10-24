var { Notification } = require('../../models/index')

module.exports.GetNotification = async (req, res) => {
    try {
        let { user_id } = req.body
        if (!user_id) {
            return res.send({
                result: false,
                message: "user id is required"
            })
        }
        let data = await Notification.findAll({
            where: { n_user_id: user_id }
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

module.exports.MarkNotificationsAsRead = async (req, res) => {
    try {
        const user = req.user;

        if (!user || !user.id) {
            return res.status(400).json({
                result: false,
                message: "User ID is required."
            });
        }

        const [updatedCount] = await Notification.update(
            { n_user_read: '1' },
            {
                where: {
                    n_user_id: user.id,
                    n_user_read: '0'
                }
            }
        );

        if (updatedCount > 0) {
            return res.send({
                result: true,
                message: `${updatedCount} notification(s) marked as read.`
            });
        } else {
            return res.send({
                result: false,
                message: "No unread notifications found."
            });
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};
