let { Questions, SubmitQuestions } = require('../../models/index')
const { Sequelize } = require('sequelize');
let { SendNotification } = require('../../utils/sendnotification')


module.exports.ListAllQuestions = async (req, res) => {
    try {
        let user = req.user
        let questions = await Questions.findAll({
            attributes: { exclude: ['answer'] },
            order: Sequelize.literal('RAND()'), // For MySQL
            limit: 15
        })
        const updatedQuestions = questions.map(q => {
            const plain = q.get({ plain: true });
            return {
                ...plain,
                options: JSON.parse(plain.options)
            };
        });
        return res.send({
            result: true,
            message: "Questions listed successfully",
            questions: updatedQuestions
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
        await SendNotification({
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