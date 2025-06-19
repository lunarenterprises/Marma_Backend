const { Therapist, Role } = require('../../models')
const { generateOTP } = require('../../utils/generateOTP')
const { sendSMS, formatPhoneNumber } = require('../../utils/sms')
const { GenerateToken } = require('../../utils/generateToken')


module.exports.RegisterLearner = async (req, res) => {
    try {
        let { name, phone, location } = req.body || {}
        if (!name || !phone || !location) {
            return res.send({
                result: false,
                message: "Name, phone and location are required"
            })
        }
        await Therapist.destroy({
            where: {
                phone: formatPhoneNumber(phone),
                phoneVerified: 'false',
            },
        });
        let checkPhone = await Therapist.findOne({
            where: { phone: formatPhoneNumber(phone), phoneVerified: "true" }
        })
        if (checkPhone) {
            return res.send({
                result: false,
                message: "Phone already exists"
            })
        }
        let token = generateOTP()
        let smsBody = `Your student verification code for Marma App is: ${token}. Please do not share it with anyone.`
        let formattedNumber = formatPhoneNumber(phone)
        let createNew = await Therapist.create({
            name,
            phone: formattedNumber,
            location,
            resetToken: token,
            roleId: 2
        })
        if (createNew) {
            await sendSMS(formattedNumber, smsBody)
            return res.send({
                result: true,
                message: "Registration successfull. OTP sended to your number."
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to register."
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}


module.exports.VerifyOtp = async (req, res) => {
    try {
        let { phone, otp, type } = req.body || {}
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
                token
            }
            return res.send({
                result: true,
                message: "Verification successfull.",
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
        let smsBody = `Your student verification code for Marma App is: ${token}. Please do not share it with anyone.`
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