const { Therapist, Role, fcmtoken } = require('../../models/index')
const { generateOTP } = require('../../utils/generateOTP')
const { sendSMS, formatPhoneNumber } = require('../../utils/sms')
const { GenerateToken } = require('../../utils/generateToken')
const { SendWhatsappMessage } = require('../../utils/whatsapp')
const logger = require('../../utils/logger')


module.exports.RegisterLearner = async (req, res) => {
    try {
        let { name, gender, phone, email, type } = req.body || {}
        if (!name || !gender || !email || !phone) {
            return res.send({
                result: false,
                message: "Name, phone, email and gender are required"
            })
        }

        if (type == 'learnerresend') {
            let checkPhone = await Therapist.findOne({
                where: { phone: formatPhoneNumber(phone) }
            })

            if (!checkPhone) {
                return res.send({
                    result: false,
                    message: "mobile number not found"
                })
            }

            let token = generateOTP()
            let smsBody = `Your student verification code for Marma App is: ${token}. Please do not share it with anyone.`
            let formattedNumber = await formatPhoneNumber(phone)

            await sendSMS(formattedNumber, smsBody)

            let updatedata = await Therapist.update({
                resetToken: token
            }, { where: { id: checkPhone.id } })

            if (!updatedata) {
                return res.send({
                    result: false,
                    message: "failed to update otp"
                })
            }
            return res.send({
                result: true,
                message: "OTP has been sent to your number.",
            });
        }
        await Therapist.destroy({
            where: {
                phone: formatPhoneNumber(phone),
                phoneVerified: 'false',
            },
        });
        await Therapist.destroy({
            where: {
                email: email.toLowerCase().trim(),
                phoneVerified: 'false',
            },
        })
        let checkEmail = await Therapist.findOne({
            where: { email: email.toLowerCase().trim(), phoneVerified: "true" }
        })
        if (checkEmail && checkEmail.payment_status == 'Paid') {
            return res.send({
                result: false,
                message: "Email already registered"
            })
        }
        let checkPhone = await Therapist.findOne({
            where: { phone: formatPhoneNumber(phone), phoneVerified: "true" }
        })
        if (checkPhone && checkPhone.payment_status == 'Paid') {
            return res.send({
                result: false,
                message: "Phone number is already registered"
            })
        }

        if (checkPhone && checkPhone.payment_status == 'Pending') {
            let token = generateOTP()
            let smsBody = `Your student verification code for Marma App is: ${token}. Please do not share it with anyone.`
            let formattedNumber = await formatPhoneNumber(phone)

            let updatedata = await Therapist.update({
                name,
                gender,
                phone: formattedNumber,
                email,
                roleId: 2,
                resetToken: token
            }, { where: { id: checkPhone.id } })
            if (updatedata) {
                await sendSMS(formattedNumber, smsBody)

                return res.send({
                    result: true,
                    message: "Registration successful. OTP has been sent to your number.",
                    learner_id: checkPhone.id,
                    name: checkPhone.name,
                    gender: checkPhone.gender,
                    phone: checkPhone.phone,
                    email: checkPhone.email
                });
            } else {
                return res.send({
                    result: false,
                    message: "Failed to register ."
                })
            }
        }

        let token = generateOTP()
        let smsBody = `Your verification code for Marma App is: ${token}. Please do not share it with anyone.`
        let formattedNumber = await formatPhoneNumber(phone)
        let createNew = await Therapist.create({
            name,
            gender,
            phone: formattedNumber,
            email,
            roleId: 2,
            resetToken: token
        })
        if (createNew) {

            await sendSMS(formattedNumber, smsBody)

            return res.send({
                result: true,
                message: "Registration successful. OTP has been sent to your number.",
                learner_id: createNew.id,
            });

        } else {
            return res.send({
                result: false,
                message: "Failed to register."
            })
        }
    } catch (error) {
        logger.error(error)
        return res.send({
            result: false,
            message: error.message
        })
    }
}


module.exports.VerifyOtp = async (req, res) => {
    try {
        let { phone, otp, fcm_token, type } = req.body || {}
        if (!phone || !otp || !type) {
            return res.send({
                result: false,
                message: "phone, otp and type are required"
            })
        }
        let checkPhone = await Therapist.findOne({
            where: {
                phone: formatPhoneNumber(phone),
            },
            include: [
                {
                    model: Role,
                    as: 'Role', // only if you used an alias
                    attributes: ['id', 'name'] // adjust fields as needed
                }
            ]
        })
        if (!checkPhone) {
            return res.send({
                result: false,
                message: "Phone not registered yet"
            })
        }

        if (checkPhone.resetToken != otp) {
            // if ('1111' !== otp) {
            return res.send({
                result: false,
                message: "Invalid otp"
            })
        }
        let updateUser = await Therapist.update(
            { phoneVerified: true, resetToken: null }, // values to set
            { where: { phone: formatPhoneNumber(phone) } } // condition
        );
        if (updateUser) {
            let token = await GenerateToken({
                id: checkPhone.id,
                name: checkPhone.name,
                email: checkPhone.email,
                phone: checkPhone.phone,
                location: checkPhone.location,
                role: checkPhone.Role.name
            })
            const data = {
                u_id: checkPhone.id,
                name: checkPhone.name,
                email: checkPhone.email,
                phone: checkPhone.phone,
                location: checkPhone.location,
                role: checkPhone.roleId,
                image: checkPhone.profile_pic,
                token
            }

            // FCM TOKEN
            if (fcm_token) {
                let checkuserlogin = await fcmtoken.findOne({ where: { ft_therapist_id: checkPhone.id } });

                if (checkuserlogin) {
                    await fcmtoken.update({ ft_fcm_token: fcm_token }, { where: { ft_therapist_id: checkPhone.id } });
                } else {
                    await fcmtoken.create({ ft_fcm_token: fcm_token, ft_therapist_id: checkPhone.id });
                }
            }

            return res.send({
                result: true,
                message: "Verification successfull.",
                payment_status: checkPhone.Role.name === "learner" ? checkPhone.payment_status : null,
                data: type === "login" ? data : null
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to verify"
            })
        }
    } catch (error) {
        return res.send({
            retult: false,
            message: error.message
        })
    }
}


module.exports.Login = async (req, res) => {
    try {
        let { phone } = req.body || {}
        if (!phone) {
            return res.send({
                result: false,
                message: "Phone is required"
            })
        }
        const formattedNumber = formatPhoneNumber(phone)
        let checkPhone = await Therapist.findOne({
            where: {
                phone: formattedNumber
            }
        })
        if (!checkPhone) {
            return res.send({
                result: false,
                message: "Phone not found."
            })
        }
        let token = generateOTP()
        let smsBody = `Use ${token} to securely log in to your therapist account on Marma App. Do not share this code with anyone.`;
        await Therapist.update(
            { resetToken: token }, // values to set
            { where: { phone: formattedNumber } } // condition
        );
        await sendSMS(formattedNumber, smsBody)
        return res.send({
            result: true,
            message: "OTP sended to phone number."
        })
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}