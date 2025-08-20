const { User } = require('../../models');
const { Op } = require('sequelize');
const moment = require('moment');
const { sendEmail, emailUser } = require('../../utils/emailService');
const createOtpLog = require('../../utils/addOtpLog');
var sendSMS = require('../../utils/sms')


module.exports.Register = async (req, res) => {
    try {
        const {
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
        } = req.body;

        let deleteemail = await User.destroy({
            where: {
                email,
                emailVerified: 'false',
            },
        });

        console.log(deleteemail, "eee");

        // Check required fields
        if (!name || !email || !phone || !address || !location || !role || !district || !state) {
            return res.status(400).json({
                result: false,
                message: 'Missing required fields',
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
                    second_phone ? { second_phone } : {},
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
            second_phone,
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

            await createOtpLog( phone, userId,null, purpose );

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

            let sendsms = await sendSMS.sendSMS('+917034500199', message)


            // Compose email
            // const mailOptions = {
            //     from: `REFLEX MARMA <${emailUser}>`,
            //     to: email,
            //     subject: "Registration OTP",
            //     html: `
            //         <!DOCTYPE html>
            //         <html lang="en">
            //         <head>
            //             <meta charset="UTF-8" />
            //             <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            //             <title>Email Verification</title>
            //             <style>
            //                 body {
            //                     font-family: 'Segoe UI', sans-serif;
            //                     background-color: #f2f4f6;
            //                     margin: 0;
            //                     padding: 0;
            //                 }
            //                 .email-container {
            //                     max-width: 600px;
            //                     margin: 30px auto;
            //                     background-color: #ffffff;
            //                     padding: 40px 30px;
            //                     border-radius: 8px;
            //                     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            //                 }
            //                 .email-header {
            //                     text-align: center;
            //                     margin-bottom: 30px;
            //                 }
            //                 .email-header h2 {
            //                     color: #2c3e50;
            //                     font-size: 24px;
            //                     margin: 0;
            //                 }
            //                 .email-body {
            //                     color: #4a4a4a;
            //                     font-size: 16px;
            //                     line-height: 1.6;
            //                 }
            //                 .otp-box {
            //                     text-align: center;
            //                     margin: 30px 0;
            //                 }
            //                 .otp-code {
            //                     display: inline-block;
            //                     background-color: #f0f0f5;
            //                     padding: 15px 30px;
            //                     font-size: 28px;
            //                     font-weight: bold;
            //                     letter-spacing: 4px;
            //                     color: #007bff;
            //                     border-radius: 6px;
            //                 }
            //                 .footer {
            //                     text-align: center;
            //                     font-size: 14px;
            //                     color: #888;
            //                     margin-top: 40px;
            //                 }
            //             </style>
            //         </head>
            //         <body>
            //             <div class="email-container">
            //                 <div class="email-header">
            //                     <h2>Email Verification</h2>
            //                 </div>
            //                 <div class="email-body">
            //                     <p>Hi ${name},</p>
            //                     <p>Thank you for registering with us. Use the OTP below to complete your registration:</p>
            //                     <div class="otp-box">
            //                         <div class="otp-code">${otp}</div>
            //                     </div>
            //                     <p>This OTP is valid for <strong>5 minutes</strong>. If you didn’t request this, please ignore this email.</p>
            //                     <p>Thank you,<br/>REFLEX MARMA</p>
            //                 </div>
            //                 <div class="footer">
            //                     &copy; ${new Date().getFullYear()} Reflex Marma. All rights reserved.
            //                 </div>
            //             </div>
            //         </body>
            //         </html>
            //     `
            // };

            // await sendEmail(mailOptions);

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


