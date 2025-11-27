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
        let admin_id =user.id

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
            { roleId: 3 ,status:'Approved'},
            { where: { id: learner_id } }
        );

        let status = 'Promote Learner'

        await notification.addNotification(
            admin_id,
            learner_id,
            status,
            `Promoting Learner to Therapist`,
            `${therapistdata.name} Promoted from Learner to Therapist`,
            therapistdata.file
        );

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