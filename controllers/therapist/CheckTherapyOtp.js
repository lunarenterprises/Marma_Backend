const { Booking, PaymentHistory, priceDetails, Doctors, WalletHistory, Therapist, User } = require('../../models/index')
let { generateOTP } = require('../../utils/generateOTP')
const moment = require("moment");
const { sendSMS } = require('../../utils/sms')

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

        let userDetails = await User.findOne({
            where: { id: checkbooking[0].userId }
        });

        if (!userDetails) {
            return res.send({
                result: false,
                message: "User not found",
            });
        }

        if (checkbooking[0].paymentStatus !== 'Paid') {
            return res.send({
                result: false,
                message: "Payment not completed",
            });
        }

        if (checkbooking.length > 0) {

            if (otp == checkbooking[0]?.otp) {
                if (checkbooking[0]?.status == 'Ongoing') {

                    let [updatestatus] = await Booking.update(
                        { status: 'Completed' },
                        { where: { id: b_id } }
                    );

                    let smsBody = `Dear ${userDetails.name} Your Reflexmarmaa therapy has been successfully completed.`
                    await sendSMS(userDetails.phone, smsBody)

                    if (updatestatus === 1) {
                        return res.send({
                            result: true,
                            message: "Therapy session OTP verified sucessfully",
                        });
                    } else {
                        return res.send({
                            result: false,
                            message: "Failed to verify Therapy session OTP ",
                        });
                    }

                } else {
                    // console.log("else Ongoing");

                    let [verifyotp] = await Booking.update(
                        { status: 'Ongoing' },
                        { where: { id: b_id } }
                    );

                    if (verifyotp === 1) {
                        return res.send({
                            result: true,
                            message: "Therapy session OTP verified sucessfully",
                        });
                    } else {
                        return res.send({
                            result: false,
                            message: "Failed to verify Therapy session OTP ",
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

        let { b_id, doctor_id } = req.body || {};
        if (!b_id) {
            return res.send({
                result: false,
                message: "booking id is required ",
            });
        }
        if (user.Role.name !== 'therapist') {
            return res.send({
                result: false,
                message: "You are Unautorized ,please contact adminstrator",
            });
        }

        let checkbooking = await Booking.findAll({
            where: { id: b_id }
        });

        let payment_details = await PaymentHistory.findOne({
            where: { ph_booking_id: b_id }
        });

        // console.log("payment_details", payment_details);

        if (!payment_details) {
            return res.send({
                result: false,
                message: "Payment details not found"
            });
        }

        var therapistdetails = await Therapist.findOne({
            where: { id: checkbooking[0].therapistId }
        });
        // console.log("therapistdetails", therapistdetails);

        if (!therapistdetails) {
            return res.send({
                result: false,
                message: "Therapist not found"
            });
        }

        if (doctor_id) {

            let doctordetails = await Doctors.findOne({
                where: { d_id: doctor_id }
            });

            if (!doctordetails) {
                return res.send({
                    result: false,
                    message: "Doctor details not found",
                });
            }

            let payment_details = await PaymentHistory.findOne({
                where: { ph_booking_id: b_id, ph_payment_status: 'paid' }
            });
            // console.log("payment_details",payment_details);

            if (payment_details) {

                let getprice = await priceDetails.findOne({
                    where: { pd_id: payment_details.ph_price_id }
                });

                // console.log("getprice", getprice, getprice.pd_doctor_fee);

                await PaymentHistory.update(
                    { ph_pay_doctor: getprice.pd_doctor_fee },
                    { where: { ph_id: payment_details.ph_id } }
                );
                let updatedWallet = Number(doctordetails.d_wallet) + Number(getprice.pd_doctor_fee);

                // console.log(doctordetails.d_wallet, "wallet");
                // console.log(getprice.pd_doctor_fee, "pd_therapist_fee");
                // console.log(updatedWallet, "updatedWallet");


                let updatedocwallet = await Doctors.update(
                    { d_wallet: updatedWallet },
                    { where: { d_id: doctor_id } }
                );
                if (!updatedocwallet) {
                    return res.send({
                        result: false,
                        message: "Failed to add doctors wallet amount  ",
                    });
                }

                let addwallethistory = await WalletHistory.create({
                    wh_doctor_id: doctor_id,
                    wh_user_id: payment_details.ph_user_id,
                    wh_amount: getprice.pd_doctor_fee,
                    wh_type: 'Credit'
                });

                if (!addwallethistory) {
                    return res.send({
                        result: false,
                        message: "Failed to add wallet history of doctor pay amount ",
                    });
                }
            } else {
                return res.send({
                    result: false,
                    message: "Payment details not found",
                });
            }
        }

        if (checkbooking[0]?.status == 'Completed') {
            return res.send({
                result: false,
                message: "This therapy session is already completed ",
            });
        }

        //------------therapist wallet update----------------

        let getprice = await priceDetails.findOne({
            where: { pd_id: checkbooking[0].price_id }
        });

        // console.log("getprice", getprice);
        // console.log("getprice", getprice.pd_therapist_fee);

        await PaymentHistory.update(
            { ph_pay_therapist: getprice.pd_therapist_fee },
            { where: { ph_id: payment_details.ph_id } }
        );

        let updatedWallet = Number(therapistdetails.wallet) + Number(getprice.pd_therapist_fee);

        // console.log(therapistdetails.wallet, "wallet");
        // console.log(getprice.pd_therapist_fee, "pd_therapist_fee");
        // console.log(updatedWallet, "updatedWallet");

        await Therapist.update(
            { wallet: updatedWallet },
            { where: { id: checkbooking[0].therapistId } }
        );

        let addwallethistory = await WalletHistory.create({
            wh_therapist_id: checkbooking[0].therapistId,
            wh_user_id: checkbooking[0].userId,
            wh_amount: getprice.pd_therapist_fee,
            wh_type: 'Credit'
        });

        //-----------------------------------------------------

        const therapyOTP = await generateOTP();

        if (checkbooking.length > 0) {

            let endtherapy = await Booking.update(
                { otp: therapyOTP, completed_time: moment().format('YYYY-MM-DD') },
                { where: { id: b_id } }
            );

            if (endtherapy) {
                return res.send({
                    result: true,
                    message: "Therapy session completed and OTP sent successfully.",
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
