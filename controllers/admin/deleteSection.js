const { User, Therapist } = require("../../models/index");

module.exports.DeleteSection = async (req, res) => {
    try {
        let user = req.user

        if (user.Role.name !== 'admin') {
            return res.send({
                result: false,
                message: "You are not authorized,Plaease contact mangaement"
            })
        }

        const { user_id, therapist_id } = req.body;

        let deleted = 0;

        if (user_id) {
            const user = await User.findOne({ where: { id: user_id } });

            if (!user) {
                return res.status(404).send({
                    result: false,
                    message: "User details not found"
                });
            }

            deleted = await User.destroy({ where: { id: user_id } });
        }

        if (therapist_id) {
            const therapist = await Therapist.findOne({ where: { id: therapist_id } });

            if (!therapist) {
                return res.status(404).send({
                    result: false,
                    message: "Therapist details not found"
                });
            }

            deleted = await Therapist.destroy({ where: { id: therapist_id } });
        }

        if (deleted > 0) {
            return res.send({
                result: true,
                message: "Deleted successfully"
            });
        } else {
            return res.send({
                result: false,
                message: "Failed to delete"
            });
        }

    } catch (error) {

        return res.status(500).send({
            result: false,
            message: "Server error",
            error: error.message
        });
    }
};
