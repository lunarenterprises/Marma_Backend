
const axios = require("axios");
const moment = require("moment");
const { User, Therapist, PaymentHistory, Booking } = require('../../models/index');
let generateOTP = require('../../utils/generateOTP')
let createOtpLog = require('../../utils/addOtpLog')


module.exports.Payment = async (req, res) => {
    try {
        const {
            user_id,
            therapist_id,
            learner_id,
            booking_id,
            name,
            email,
            phone,
            role,
            ph_type,
            ph_total_amount,
        } = req.body;

        const date = moment().format('YYYY-MM-DD'); // fixed typo: YYYYY ➝ YYYY

        // Booking validation (only if booking_id exists)
        if (booking_id) {
            if (!user_id || !therapist_id) {
                return res.status(400).json({
                    result: false,
                    message: "User ID and Therapist ID are required",
                });
            }

            const booking = await Booking.findOne({ where: { id: booking_id } });
            if (!booking) {
                return res.status(404).json({
                    result: false,
                    message: "Booking not found",
                });
            }

            if (booking.paymentStatus === 'paid') {
                return res.status(409).json({
                    result: false,
                    message: "Payment has already been made for this booking",
                });
            }

            const user = await User.findByPk(user_id);
            if (!user) {
                return res.status(404).json({
                    result: false,
                    message: "User not found",
                });
            }

            const therapist = await Therapist.findByPk(therapist_id);
            if (!therapist) {
                return res.status(404).json({
                    result: false,
                    message: "Therapist not found",
                });
            }
        }

        // Learner validation (only if learner_id exists)
        if (learner_id) {
            const learner = await Therapist.findByPk(learner_id);
            if (!learner) {
                return res.status(404).json({
                    result: false,
                    message: "Learner not found",
                });
            }
        }

        // Save Payment History
        const paymentData = {
            ph_type,
            ph_date: date,
            ph_total_amount,
        };

        if (role === 'user') {
            paymentData.ph_user_id = user_id;
            paymentData.ph_therapist_id = therapist_id;
            paymentData.ph_booking_id = booking_id;
        } else {
            paymentData.ph_learner_id = learner_id;
        }

        const addPaymentHistory = await PaymentHistory.create(paymentData);
        console.log("🧾 Payment history added:", addPaymentHistory.ph_id);

        const payment_id = addPaymentHistory.ph_id;

        // Razorpay credentials
        // test api key

        const key_id = process.env.TEST_KEY_ID;
        const key_secret = process.env.TEST_KEY_SECRET;

        //live api keys

        // const key_id = process.env.KEY_ID;
        // const key_secret = process.env.KEY_SECRET;

        const callback_url = `https://lunarsenterprises.com:6030/api/therapist/razorpay/callback?payment_id=${payment_id}`;

        const authHeader = {
            auth: {
                username: key_id,
                password: key_secret,
            },
        };

        const paymentLinkData = {
            amount: Number(ph_total_amount) * 100, // convert to paisa
            currency: 'INR',
            description: role === 'user' ? 'Payment for Therapy' : 'Payment for Course',
            customer: {
                name,
                email,
                contact: phone,
            },
            callback_url,
        };

        // Generate OTP and create Razorpay payment link
        const therapyOTP = await generateOTP.generateOTP();
        let purpose = '';
        if (learner_id) {
            purpose = 'Course payment';
        } else {
            purpose = 'Therapy session';
        }
        try {
            const response = await axios.post(
                'https://api.razorpay.com/v1/payment_links',
                paymentLinkData,
                authHeader
            );
            // console.log("otp log :", phone, learner_id ? learner_id : user_id, purpose);
            if (learner_id) {
                await createOtpLog(phone,null, learner_id, purpose);

            } else {
                await createOtpLog(phone, user_id,null, purpose);

            }

            if (booking_id) {
                await Booking.update(
                    { otp: therapyOTP },
                    { where: { id: booking_id } }
                );
            }

            // console.log('✅ Payment link created successfully:', response.data);

            return res.status(200).json({
                result: true,
                message: 'Payment link created successfully!',
                paymentLinkUrl: response.data.short_url,
            });
        } catch (error) {
            console.error('❌ Error creating payment link:', error.response?.data?.error || error.message);
            return res.status(500).json({
                result: false,
                message: 'Failed to create payment link',
                error: error.response?.data?.error || error.message,
            });
        }

    } catch (error) {
        console.error('❌ Error in Payment:', error.message);
        return res.status(500).json({
            result: false,
            message: error.message,
        });
    }
};



module.exports.ListPaymentHistory = async (req, res) => {
    try {

        let user = req.user
        let therapist_id = user.id

        const therapist = await Therapist.findOne({ where: { id: therapist_id } });
        if (!therapist) {
            return res.status(404).send({
                result: false,
                message: "Therapist details not found",
            });
        }

        const includeOptions = [
            {
                model: User,
                as: 'user',
                attributes: ['name', 'profile_pic', 'phone'],
                required: false, 
            },
            {
                model: Therapist,
                as: 'therapist',         // must match alias in association
                attributes: ['name', 'file', 'phone'],
                required: false,        // left join so therapists with zero bookings included
            }
        ];

        let data = await PaymentHistory.findAll({
            where: { ph_therapist_id: therapist_id },
            include: includeOptions
        })

        if (data.length > 0) {
            return res.send({
                result: true,
                message: "data retrieved",
                data: data
            })
        } else {
            return res.send({
                result: false,
                message: "data not found"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}