const { User, Role, OtpLog } = require('../../models/index'); // Sequelize model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { GenerateToken } = require('../../utils/generateToken')
// var nodemailer = require('nodemailer');
var moment = require('moment');
var { formatPhoneNumber, sendSMS } = require('../../utils/sms')


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
        console.log(user, "user");

        if (!user) {
            return res.send({
                result: false,
                message: 'Phone number is missing or invalid.',
            });
        }


        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const expirationDate = moment().add(5, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        // const localTime = moment.utc(expirationDate).local().format('YYYY-MM-DD HH:mm:ss');

        //         console.log(expirationDate, "eeee");
        //         console.log(localTime, "utc");
        //         console.log(user.resetTokenExpiry, "dbbb");


        //         // Store OTP and expiry in User table
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

        let message = `Your OTP is ${otp} for completing your registration with Reflex Marma. It is valid for 5 minutes. Do not share this code with anyone`

        await sendSMS(formattedNumber, message)

        // Email setup
        //         const transporter = nodemailer.createTransport({
        //             host: 'smtp.hostinger.com',
        //             port: 587,
        //             auth: {
        //                 type: 'custom',
        //                 method: 'PLAIN',
        //                 user: 'support@choiceglobal.in',
        //                 pass: 'support123abcAB@',
        //             },
        //         });

        //         const html = `
        //     <!DOCTYPE html>
        // <html lang="en">
        // <head>
        //   <meta charset="UTF-8">
        //   <title>REFLEX MARMA - Login OTP</title>
        //   <style>
        //     body {
        //       font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        //       background-color: #f5f8fa;
        //       margin: 0;
        //       padding: 40px 0;
        //     }

        //     .email-container {
        //       max-width: 600px;
        //       background-color: #ffffff;
        //       margin: auto;
        //       padding: 30px 40px;
        //       border-radius: 10px;
        //       box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        //     }

        //     .header {
        //       text-align: center;
        //       margin-bottom: 25px;
        //     }

        //     .header h1 {
        //       margin: 0;
        //       font-size: 24px;
        //       color: #1a202c;
        //     }

        //     .body-text {
        //       font-size: 16px;
        //       color: #4a5568;
        //       line-height: 1.6;
        //       margin-bottom: 25px;
        //     }

        //     .otp-code {
        //       display: block;
        //       text-align: center;
        //       font-size: 32px;
        //       font-weight: bold;
        //       background-color: #edf7ff;
        //       color: #007BFF;
        //       padding: 15px 0;
        //       border-radius: 8px;
        //       letter-spacing: 6px;
        //       margin-bottom: 20px;
        //     }

        //     .footer {
        //       font-size: 14px;
        //       color: #a0aec0;
        //       text-align: center;
        //       margin-top: 30px;
        //     }

        //     .brand {
        //       color: #2b6cb0;
        //       font-weight: 600;
        //     }
        //   </style>
        // </head>
        // <body>
        //   <div class="email-container">
        //     <div class="header">
        //       <h1>Your Login OTP</h1>
        //     </div>
        //     <div class="body-text">
        //       <p>Hello,</p>
        //       <p>Use the following One-Time Password (OTP) to log in to your <span class="brand">REFLEX MARMA</span> account:</p>
        //     </div>
        //     <div class="otp-code">${otp}</div>
        //     <div class="body-text">
        //       <p>This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.</p>
        //       <p>If you did not initiate this login, please contact us.</p>
        //     </div>
        //     <div class="footer">
        //       &copy; 2025 <span class="brand">REFLEX MARMA</span>. All rights reserved.
        //     </div>
        //   </div>
        // </body>
        // </html>
        // `;

        //         await transporter.sendMail({
        //             from: 'REFLEX MARMA <support@choiceglobal.in>',
        //             to: email,
        //             subject: 'REFLEX MARMA OTP',
        //             html,
        //         });

        return res.send({
            result: true,
            message: 'OTP send to your phone number'

        });
    } catch (error) {
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
        if (user.resetToken != otp
            // !user.resetTokenExpiry ||
            // moment().isAfter(user.resetTokenExpiry)
        ) {
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
                rolename: user.Role.name


            })


            // OTP is valid, clear it
            user.resetToken = null;
            user.resetTokenExpiry = null;
            await user.save();

            return res.json({
                result: true,
                message: "OTP verified successfully",
                u_id: user.id,
                name: user.name,
                role: user.roleId,
                token: token

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
        return res.status(500).json({
            result: false,
            message: error.message,
        });
    }
};




