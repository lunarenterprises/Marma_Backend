const { Booking } = require('../../models/index')

module.exports.CheckTherapyOTP = async (req, res) => {
    try {
        let user = req.user

        let { b_id, otp } = req.body || {};


        if (user.Role.name !== 'therapist') {
            return res.send({
                result: false,
                message: "You are Unautorized ,please contact adminstrator",
            });
        }

        let checkbooking = await Booking.findAll({
            where: { id: b_id }
        });

        if (checkbooking.length > 0) {

            if (otp === checkbooking[0]?.otp) {

                let [verifyotp] = await Booking.update(
                    { status: 'Ongoing' },
                    { where: { id: b_id } }
                );

                if (verifyotp === 1) {
                    return res.send({
                        result: true,
                        message: "Therapy secssion OTP verified sucessfully",
                    });
                } else {
                    return res.send({
                        result: false,
                        message: "Failed to verify Therapy secssion OTP ",
                    });
                }
            } else {
                return res.send({
                    result: false,
                    message: "Invalid OTP ",
                });
            }
        } else {
            return res.send({
                result: false,
                message: "Booking details not found",
            });
        }
    } catch (error) {

        return res.send({
            result: false,
            message: error.message,
        });


    }
}
