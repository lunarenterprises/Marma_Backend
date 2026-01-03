const { Therapist } = require('../../models/index.js');
const notification = require('../../utils/addNotification.js')


module.exports.PromoteLearner = async (req, res) => {
    try {
        let user = req.user

        if (user.Role.name !== 'admin') {
            return res.send({
                result: false,
                message: "You are not authorized,Plaease contact mangaement"
            })
        }
        var { learner_id } = req.body || {}
        let admin_id = user.id

        if (!learner_id) {
            return res.send({
                result: false,
                message: "Therapist id is required"
            })
        }

        const therapistdata = await Therapist.findOne({
            where: {
                id: learner_id,
            }
        });

        if (!therapistdata) {
            return res.send({
                result: false,
                message: "Therapist details not found"
            })
        }

        let promoteLearner = await Therapist.update(
            { roleId: 3, status: 'Approved' },
            { where: { id: learner_id } }
        );

        let status = 'Promote Learner'

        await notification.addNotification({
            user_id: admin_id,
            therapist_id: learner_id,
            type: status,
            title: `Promoting Learner to Therapist`,
            message: `${therapistdata.name} Promoted from Learner to Therapist`,
            image: therapistdata.file
        });

        return res.send({
            result: true,
            message: `Learner Promoted succesfully`
        })


    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.ApproveLearner = async (req, res) => {
    try {
        let user = req.user

        if (user.Role.name !== 'admin') {
            return res.send({
                result: false,
                message: "You are not authorized,Plaease contact mangaement"
            })
        }
        var { learner_id } = req.body || {}
        let admin_id = user.id

        if (!learner_id) {
            return res.send({
                result: false,
                message: "learner id is required"
            })
        }

        const therapistdata = await Therapist.findOne({
            where: {
                id: learner_id,
            }
        });

        if (!therapistdata) {
            return res.send({
                result: false,
                message: "learner details not found"
            })
        }

        let promoteLearner = await Therapist.update(
            { status: 'Approved' },
            { where: { id: learner_id } }
        );
        if (!promoteLearner) {
            return res.send({
                result: false,
                message: `Failed to approve learner`
            })
        }
        let status = 'Approve Learner'

        await notification.addNotification({
            user_id: admin_id,
            therapist_id: learner_id,
            type: status,
            title: `Approve Learner`,
            message: `${therapistdata.name} details approved`,
            image: therapistdata.file
        });

        return res.send({
            result: true,
            message: `Approved Learner succesfully`
        })


    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}