let { Questions } = require('../../models/index')


module.exports.ListAllQuestions = async (req, res) => {
    try {
        let user = req.user
        let questions = await Questions.findAll()
        return res.send({
            result: true,
            message: "Questions listed successfully",
            questions
        })
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}