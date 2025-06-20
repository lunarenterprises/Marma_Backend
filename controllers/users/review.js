const { Reviews, User, Therapist, sequelize } = require('../../models/index.js');

module.exports.AddReview = async (req, res) => {
    try {
        const { user_id } = req.body;
        const { therapist_id, heading, comment, rating } = req.body;

        if (!therapist_id || !user_id || !heading || !comment || !rating) {
            return res.send({
                result: false,
                message: "Insufficient parameters"
            });
        }

        const user = await User.findByPk(user_id);
        if (!user) {
            return res.send({ result: false, message: "User not found" });
        }

        const therapist = await Therapist.findByPk(therapist_id);
        if (!therapist) {
            return res.send({ result: false, message: "Therapist not found" });
        }

        const addreview = await Reviews.create({
            r_user_id: user.id,
            r_therapist_id: therapist.id,
            r_heading: heading,
            r_comment: comment,
            r_rating: rating
        });

        // 🔢 Recalculate average rating after new review
        const avgRating = await Reviews.findOne({
            where: { r_therapist_id: therapist_id },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('r_rating')), 'average_rating']
            ],
            raw: true
        });

        const newAvgRating = parseFloat(avgRating.average_rating).toFixed(1); // Keep 1 decimal place

        // 💾 Update therapist's rating
        await Therapist.update(
            { rating: newAvgRating },
            { where: { id: therapist_id } }
        );
console.log(newAvgRating,"rating");

        return res.send({
            result: true,
            message: "Review added successfully",
        });

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};

