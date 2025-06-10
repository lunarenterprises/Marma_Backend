const { Booking, Therapist } = require('../../models/index.js');


module.exports.ApproveTherapiRequest = async (req, res) => {
    try {
        let { therapist_id } = req.headers
        var { request_id, status } = req.body;
        if (!request_id) {
            return res.send({
                result: false,
                message: "Request id is required"
            })
        }
        console.log("Sttatus : ", status)
        const request = await Booking.findOne({
            where: {
                id: request_id,
                therapistId: therapist_id
            }
        });


        if (!request) {
            return res.send({
                result: false,
                message: "Request details not found"
            })
        }
        const therapist = await Therapist.findByPk(therapist_id);

        if (!therapist) {
            return res.send({
                result: false,
                message: "Therapist not found"
            })
        }

        let updateBooking = await Booking.update(
            { status },
            { where: { id: request_id } }
        );

        console.log(updateBooking, "addbooking");

        return res.send({
            result: true,
            message: "Therapy request status updated succesfully"
        })


    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}