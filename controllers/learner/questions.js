let { Questions, SubmitQuestions } = require('../../models/index')
let { addNotification } = require('../../utils/addNotification')


module.exports.ListAllQuestions = async (req, res) => {
    try {
        let user = req.user
        let questions = await Questions.findAll({
            attributes: { exclude: ['answer'] }
        })
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

module.exports.SubmitQuestions = async (req, res) => {
    try {
        let user = req.user
        let { submission } = req.body
        if (!submission) {
            return res.send({
                result: false,
                message: "Submission is required"
            })
        }
        const records = [];
        let correctCount = 0
        for (let item of submission) {
            const question = await Questions.findByPk(item.id);
            if (!question) continue;

            const isCorrect = question.answer.toLowerCase() === item.selectedAnswer.toLowerCase();
            if (isCorrect === true) {
                correctCount++
            }

            records.push({
                question: item.id,
                selectedAnswer: item.selectedAnswer,
                userId: user.id,
                isCorrect  // add this field in the model if needed
            });
        }
        await SubmitQuestions.bulkCreate(records);
        await addNotification({
            user_id: null,
            therapist_id: user.id,
            type: "Mock Test Submission",
            title: "Completed mock test",
            message: `${user.name} submitted mock test questions`,
        })
        return res.send({
            result: true,
            message: "Submission successfull",
            correctCount
        })
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}