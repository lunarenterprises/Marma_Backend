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
        const user = req.user;

        if (!user || !user.id) {
            return res.status(400).json({
                result: false,
                message: "User ID is required."
            });
        }


          const  [updatedCount] = await Notification.update(
                { n_therapist_read: '1' },
                {
                    where: {
                        n_therapist_id: user.id,
                        n_therapist_read: '0'
                    }
                }
            );
        

        if (updatedCount > 0) {
            return res.status(200).json({
                result: true,
                message: `${updatedCount} notification(s) marked as read.`
            });
        } else {
            return res.status(200).json({
                result: false,
                message: "No unread notifications found."
            });
        }

    } catch (error) {
        console.error("Error marking notifications as read:", error);
        return res.status(500).json({
            result: false,
            message: error.message || "An error occurred while marking notifications as read."
        });
    }
};
