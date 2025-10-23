const { Booking } = require('../../models/index')
let { generateOTP } = require('../../utils/generateOTP')

module.exports.CheckTherapyOTP = async (req, res) => {
    try {
        let user = req.user

        let { b_id, otp } = req.body || {};

        // if (user.Role.name !== 'therapist') {
        //     return res.send({
        //         result: false,
        //         message: "You are Unautorized ,please contact adminstrator",
        //     });
        // }

        let checkbooking = await Booking.findAll({
            where: { id: b_id }
        });


        if (checkbooking.length > 0) {

            if (otp === checkbooking[0]?.otp) {
                if (checkbooking[0]?.status == 'Ongoing') {
                    console.log("Ongoing");

                    let [updatestatus] = await Booking.update(
                        { status: 'Completed' },
                        { where: { id: b_id } }
                    );

                    console.log("updatestatus", updatestatus);

                    if (updatestatus === 1) {
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
                    console.log("else Ongoing");


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


module.exports.EndTherapy = async (req, res) => {
    try {
        let user = req.user

        let { b_id } = req.body || {};
        if (!b_id) {
            return res.send({
                result: false,
                message: "booking id is required ",
            });
        }
        // if (user.Role.name !== 'therapist') {
        //     return res.send({
        //         result: false,
        //         message: "You are Unautorized ,please contact adminstrator",
        //     });
        // }

        let checkbooking = await Booking.findAll({
            where: { id: b_id }
        });
        if (checkbooking[0]?.status == 'Completed') {
            return res.send({
                result: false,
                message: "This therapy session is already completed ",
            });
        }
        const therapyOTP = await generateOTP();

        if (checkbooking.length > 0) {

            let endtherapy = await Booking.update(
                { otp: therapyOTP },
                { where: { id: b_id } }
            );

            console.log("endtherapy", endtherapy);

            if (endtherapy) {
                return res.send({
                    result: true,
                    message: "Therapy session finished and OTP sent successfully.",
                });

            } else {
                return res.send({
                    result: false,
                    message: "Failed to update finished therapy session  ",
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
