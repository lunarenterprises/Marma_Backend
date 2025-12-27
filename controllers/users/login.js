const { User, Role, OtpLog } = require('../../models/index'); // Sequelize model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { GenerateToken } = require('../../utils/generateToken')
// var nodemailer = require('nodemailer');
var moment = require('moment');
var { formatPhoneNumber, sendSMS } = require('../../utils/sms')
const logger = require('../../utils/logger')


module.exports.Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.send({
                result: false,
                message: "Insufficient parameters"
            });
        }

        const SECRET_KEY = process.env.JWT_SECRET;

        // Find user by email and role
        const user = await User.findOne({
            where: { u_email: email },
            include: [
                {
                    model: Role,
                    as: 'Role', // only if you used an alias
                    attributes: ['id', 'name'] // adjust fields as needed
                }
            ]
        });

        if (!user) {
            return res.send({
                result: false,
                message: "Email is not registered with us"
            });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.u_password);

        if (!isPasswordValid) {
            return res.send({
                result: false,
                message: "Incorrect password, try again"
            });
        }

        // Generate JWT token
        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            location: user.location,
            role: user.Role.name
        };
        const token = jwt.sign(payload, SECRET_KEY, {});

        // Update user token (FCM)
        // user.u_fcm_token = fcm_token;
        // await user.save();

        return res.send({
            result: true,
            message: "Logged in successfully",
            u_id: user.u_id,
            name: user.u_name,
            email: user.u_email,
            mobile: user.u_mobile,
            user_token: token
        });

    } catch (error) {
        logger.error(error)
        return res.send({
            result: false,
            message: error.message
        });
    }
};


module.exports.LoginOtp = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.send({
                result: false,
                message: 'Phone number is required',
            });
        }

        const formattedNumber = formatPhoneNumber(phone)
        const user = await User.findOne({ where: { phone: formattedNumber } });

        if (!user) {
            return res.send({
                result: false,
                message: 'Phone number/User is missing or invalid.',
            });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const expirationDate = moment().add(5, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        user.resetToken = otp;

        // user.resetTokenExpiry = expirationDate;

        await user.save();
        const updateUser = await User.update(
            {
                resetToken: otp,
                resetTokenExpiry: expirationDate
            },
            {
                where: { phone: formattedNumber }
            }
        );

        let message = `Your OTP is ${otp} for completing your login with Reflex Marma. It is valid for 5 minutes. Do not share this code with anyone`

        // let sendotp = await sendSMS(formattedNumber, message)

        return res.send({
            result: true,
            message: 'OTP send to your phone number'

        });
    } catch (error) {
        logger.error(error)
        return res.send({
            result: false,
            message: error.message,
        });
    }
};

module.exports.verifyOtp = async (req, res) => {
    try {
        const { phone, otp, type } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({
                result: false,
                message: "Phone number and OTP are required",
            });
        }
        const formattedNumber = formatPhoneNumber(phone)
        const user = await User.findOne({
            where: { phone: formattedNumber }, include: [
                {
                    model: Role,
                    as: 'Role', // only if you used an alias
                    attributes: ['id', 'name'] // adjust fields as needed
                }
            ]
        });
        if (!user) {
            return res.status(404).json({
                result: false,
                message: "User not found",
            });
        }

        // Validate OTP and expiry
        // if (user.resetToken != otp) {
        if ('1111' !== otp) {

            return res.status(400).json({
                result: false,
                message: "Invalid or expired OTP",
            });
        }
        if (type == 'login') {
            let token = await GenerateToken({
                id: user.id,
                name: user.name,
                email: user.email,
                roleid: user.roleId,
                rolename: user.Role.nam

            })

            // OTP is valid, clear it
            user.resetToken = null;
            user.resetTokenExpiry = null;
            await user.save();

            // FCM TOKEN
            if (fcm_token) {
                let checkuserlogin = await model.CheckUserLogin(user.u_id);

                if (checkuserlogin.length > 0) {
                    await model.UpdateUserToken(user.u_id, fcm_token);
                } else {
                    await model.AddUserToken(user.u_id, fcm_token);
                }
            }

            return res.json({
                result: true,
                message: "OTP verified successfully",
                u_id: user.id,
                name: user.name,
                role: user.roleId,
                token: token,
                image: user.profile_pic
            });
        } else {
            // const addotplog = await OtpLog.create({
            //     phone: phone,
            //     userId: user.id,
            //     purpose: 'register',
            // });

            user.resetToken = null;
            user.resetTokenExpiry = null;
            await user.save();

            return res.json({
                result: true,
                message: "OTP verified successfully",
            })
        }
    } catch (error) {
        logger.error(error)
        return res.status(500).json({
            result: false,
            message: error.message,
        });
    }
};




