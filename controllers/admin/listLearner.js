let { Therapist, Op } = require('../../models/index')


module.exports.ListLearners = async (req, res) => {
    try {
        var { learner_id } = req.body || {}

        let Learnerslist = await Therapist.findAll(
            learner_id
                ? { where: { id: learner_id, roleId: 2 } }
                : { where: { roleId: 2 } }
        );

        if (Learnerslist.length > 0) {
            return res.send({
                result: true,
                message: "Data retrived",
                list: Learnerslist,
            });
        } else {
            return res.send({
                result: false,
                message: "Learners not found",
            });
        }
    } catch (error) {

        return res.send({
            result: false,
            message: error.message,
        });


    }
}