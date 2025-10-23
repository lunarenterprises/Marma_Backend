var { Notification } = require('../../models/index')

module.exports.GetNotification = async (req, res) => {
    try {
        let user = req.user
        let therapist_id = user.id
        if (!therapist_id) {
            return res.send({
                result: false,
                message: "therapist id is required"
            })
        }
        let data = await Notification.findAll({
            where: { n_therapist_id: therapist_id }
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
        const { user_id } = req.body;

        if (!user_id) {
            return res.send({
                result: false,
                message: "user id is required"
            });
        }

        const [updatedCount] = await Notification.update(
            { n_therapist_read: '1' }, // or 1, depending on DB type
            {
                where: {
                    n_therapist_id: user_id,
                    n_therapist_read: '0' // Only update unread ones
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