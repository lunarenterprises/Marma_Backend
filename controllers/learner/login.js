const User = require('../../models/user')
const { generateToken } = require('../../utils/generateToken')
const { sendSMS, formatPhoneNumber } = require('../../utils/sms')


module.exports.RegisterLearner = async (req, res) => {
    try {
        let { name, phone, location } = req.body || {}
        if (!name || !phone || !location) {
            return res.send({
                result: false,
                message: "Name, phone and location are required"
            })
        }
        await User.destroy({
            where: {
                phone: formatPhoneNumber(phone),
                phoneVerified: 'false',
            },
        });
        let checkPhone = await User.findOne({
            where: { phone: formatPhoneNumber(phone), phoneVerified: "true" }
        })
        if (checkPhone) {
            return res.send({
                result: false,
                message: "Phone already exists"
            })
        }
        let token = generateToken()
        let smsBody = `Your student verification code for Marma App is: ${token}. Please do not share it with anyone.`
        let formattedNumber = formatPhoneNumber(phone)
        let createNew = await User.create({
            name,
            phone: formattedNumber,
            location,
            resetToken: token
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
        let { phone, otp } = req.body || {}
        if (!phone || !otp) {
            return res.send({
                result: false,
                message: "phone and otp are required"
            })
        }
        let checkPhone = await User.findOne({
            where: {
                phone: formatPhoneNumber(phone),
            }
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
        } else {
            await User.update(
                { phoneVerified: true, resetToken: null }, // values to set
                { where: { phone: formatPhoneNumber(phone) } } // condition
            );
        }
        return res.send({
            result: true,
            message: "Verification successfull."
        })
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
        let checkPhone = await User.findOne({
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
        let token = generateToken()
        let smsBody = `Your student verification code for Marma App is: ${token}. Please do not share it with anyone.`
        await User.update(
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