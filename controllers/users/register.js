const { User } = require('../../models');
const { Op } = require('sequelize');
const moment = require('moment');
const { sendEmail, emailUser } = require('../../utils/emailService');
const createOtpLog = require('../../utils/addOtpLog');
var { formatPhoneNumber, sendSMS } = require('../../utils/sms')

module.exports.Register = async (req, res) => {
    try {
        let {
            name,
            email,
            phone,
            second_phone,
            address,
            district,
            state,
            location,
            role,
            password,
            type
        } = req.body;

        if (type == 'userresend') {

            let checkPhone = await User.findOne({
                where: { phone: formatPhoneNumber(phone) }
            })

            if (!checkPhone) {
                return res.send({
                    result: false,
                    message: "mobile number not found"
                })
            }
            let otp = generateOTP()
            let message = `Your OTP is ${otp} for completing your login with Reflex Marma. It is valid for 5 minutes. Do not share this code with anyone`

            let formattedNumber = await formatPhoneNumber(phone)

            await sendSMS(formattedNumber, message)

            let updatedata = await User.update({
                resetToken: otp
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

        phone = formatPhoneNumber(phone);
        let deletemobile = await User.destroy({
            where: {
                phone,
                phoneVerified: 'false',
            },
        });
        let deleteemail = await User.destroy({
            where: {
                email,
                phoneVerified: 'false',
            },
        });

        // console.log(deleteemail, "eee");
        // Check required fields
        if (!name || !email || !phone || !address || !location || !role || !district || !state) {
            return res.status(400).json({
                result: false,
                message: 'Missing required fields',
            });
        }

        // Check existing phone
        const existingphone = await User.findOne({
            where: {
                phone,
                phoneVerified: 'true'
            }
        });

        if (existingphone) {
            return res.status(409).json({
                result: false,
                message: 'Phone number is already registered',
            });
        }

        // Check existing email
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(409).json({
                result: false,
                message: 'Email is already registered',
            });
        }

        // Check existing username
        // const existingUsername = await User.findOne({ where: { username } });
        // if (existingUsername) {
        //     return res.status(409).json({
        //         result: false,
        //         message: 'Username already taken',
        //     });
        // }

        // Check existing phone or second phone
        const existingPhone = await User.findOne({
            where: {
                [Op.or]: [
                    { phone },
                    second_phone ? { second_phone: formatPhoneNumber(second_phone) } : {},
                ],
            },
        });

        if (existingPhone) {
            return res.status(409).json({
                result: false,
                message: 'Phone number already registered',
            });
        }

        // Create user
        const adduser = await User.create({
            name,
            email,
            password,
            phone,
            second_phone: formatPhoneNumber(second_phone),
            address,
            district,
            state,
            location,
            roleId: role,
        });

        if (adduser) {
            const otp = Math.floor(1000 + Math.random() * 9000);
            const otpExpire = moment().add(5, 'minutes').toDate(); // Use Date object

            const userId = adduser.id;
            const purpose = 'register';

            await createOtpLog(phone, userId, null, purpose);

            await User.update(
                {
                    resetToken: otp,
                    resetTokenExpiry: otpExpire,
                },
                {
                    where: { id: userId },
                }
            );


            let message = `Your OTP is ${otp} for completing your registration with Reflex Marma. It is valid for 5 minutes. Do not share this code with anyone`

            let sendsms = await sendSMS(phone, message)


            return res.status(201).json({
                result: true,
                message: 'Registration successful, OTP sent to phone number',
                data: adduser,
            });
        }

    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({
            result: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};


