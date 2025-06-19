
const axios = require("axios");
const moment = require("moment");
const { User, Therapist, PaymentHistory } = require('../../models/index');

module.exports.Payment = async (req, res) => {
    try {
        const {
            user_id,
            therapist_id,
            learner_id,
            name,
            email,
            phone,
            role,
            ph_type,
            ph_total_amount,
            ph_pay_amount

        } = req.body;

        let date= moment().format('YYYYY-MM-DD')


        if (user_id && therapist_id) {
            // Validate user
            const user = await User.findByPk(user_id);
            if (!user) {
                return res.status(404).send({
                    result: false,
                    message: "User not found",
                });
            }

            // Validate therapist
            const therapist = await Therapist.findByPk(therapist_id);
            if (!therapist) {
                return res.status(404).send({
                    result: false,
                    message: "Therapist not found",
                });
            }
        }

        if (learner_id) {
            // Validate learner

            const learner = await Therapist.findByPk(learner_id);
            if (!learner) {
                return res.status(404).send({
                    result: false,
                    message: "Learner not found",
                });
            }
        }


        // Create payment history
        let paymentData = {
            ph_type,
            ph_date:date,
            ph_total_amount,
        };

        if (role === 'user') {
            paymentData.ph_therapist_id = therapist_id;
            paymentData.ph_user_id = user_id;
            paymentData.ph_pay_amount = ph_pay_amount
        } else {
            paymentData.ph_learner_id = learner_id;
        }

        const addpaymenthistory = await PaymentHistory.create(paymentData);

        console.log("🧾 Payment history added:", addpaymenthistory.ph_id);

        // Razorpay setup
        const key_id = "rzp_test_OV69louybHZfVB";
        const key_secret = "n53FP19r6Wy35LLdlqBCxoCH";
        const amount = ph_total_amount;

        const callbackurl = `https://lunarsenterprises.com:6030/marma/razorpay/callback?payment_id=${addpaymenthistory.ph_id}`;

        const authHeader = {
            auth: {
                username: key_id,
                password: key_secret,
            },
        };

        const paymentLinkData = {
            amount: Number(amount) * 100, // Amount in paisa
            currency: 'INR',
            description: role === 'therapist' ? 'Payment for Therapy' : 'Payment for Course',
            customer: {
                name,
                email,
                contact: phone,
            },
            callback_url: callbackurl,
        };

        axios.post('https://api.razorpay.com/v1/payment_links', paymentLinkData, authHeader)
            .then(response => {
                console.log('Payment link created successfully:', response.data);
                return res.json({
                    result: true,
                    message: 'Payment Completed Successfully!',
                    paymentLinkUrl: response.data.short_url
                });
                // Handle response data as needed
            })
            .catch(error => {
                console.error('Error creating payment link:', error.response.data.error);
                // Handle error response
            });

    } catch (error) {
        console.error('❌ Error in Payment:', error.message);
        return res.status(500).send({
            result: false,
            message: error.message,
        });
    }
};
