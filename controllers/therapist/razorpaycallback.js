let { sendEmail } = require('../../utils/emailService');
let { User, PaymentHistory, Therapist, WalletHistory, Booking, priceDetails, Chat, Messages, Op } = require('../../models/index');
const { sendUserDetailsToAdmin, sendUserDetailsToUser } = require('../../utils/whatsapp')
let { addNotification } = require('../../utils/addNotification')
const { sendSMS } = require('../../utils/sms')
let moment = require('moment')
const { getIO } = require("../../socket/msglist");

module.exports.RazorpayCallback = async (req, res) => {
  try {
    let payment_id = req.query.payment_id;
    // console.log("callback :", payment_id, req.query.razorpay_payment_link_status);

    if (req.query.razorpay_payment_link_status === 'paid') {

      let payment_details = await PaymentHistory.findOne({
        where: { ph_id: payment_id }
      });

      if (!payment_details) {
        return res.send({
          result: false,
          message: "Payment details not found"
        });
      }
      // let date = moment().format('YYYYY-MM-DD')

      let user_id = payment_details.ph_user_id;
      let therapist_id = payment_details.ph_therapist_id;
      let learner_id = payment_details.ph_learner_id;
      let booking_id = payment_details.ph_booking_id;
      let amount = payment_details.ph_total_amount;
      let payment_date = payment_details.ph_date;

      if (!learner_id) {
        var Userdetails = await User.findOne({
          where: { id: user_id }
        });

        if (!Userdetails) {
          return res.send({
            result: false,
            message: "User not found"
          });
        }

        var username = Userdetails.name;

        var therapistdetails = await Therapist.findOne({
          where: { id: therapist_id }
        });

        if (!therapistdetails) {
          return res.send({
            result: false,
            message: "Therapist not found"
          });
        }

        // ✅ Corrected update
        const [updateCount] = await PaymentHistory.update(
          { ph_payment_status: 'paid' },
          { where: { ph_id: payment_id } }
        );

        const [updatebookingpaymentstatus] = await Booking.update(
          { paymentStatus: 'paid' },
          { where: { id: booking_id } }
        );

        // ====================== SOCKET FIX START ======================
        try {
          const io = getIO();
          const { Op } = require("sequelize");

          // 1️⃣ Find or create chat between user and therapist
          const [chat] = await Chat.findOrCreate({
            where: {
              [Op.or]: [
                {
                  sender_id: user_id,
                  receiver_id: therapist_id,
                  sender_role: 4, // user
                  receiver_role: 3 // therapist
                },
                {
                  sender_id: therapist_id,
                  receiver_id: user_id,
                  sender_role: 3,
                  receiver_role: 4
                }
              ]
            },
            defaults: {
              sender_id: user_id,
              receiver_id: therapist_id,
              sender_role: 4,
              receiver_role: 3
            }
          });

          // 2️⃣ Prepare messages
          const userMessage = `Dear ${username}, Your payment has been successfully completed. The therapy is scheduled on ${payment_date} at ${therapistdetails.location}. Thank you. Team Stylus Wellness. If you have any query regarding therapy pls WhatsApp: +917025050147`;

          const therapistMessage = `Dear ${therapistdetails.name}, The payment from ${username} has been successfully completed. The therapy is scheduled on ${payment_date} at your location. Thank you. Team Stylus Wellness. If you have any query regarding therapy pls WhatsApp: +917025050147`;

          // 3️⃣ Save USER message
          const savedUserMessage = await Messages.create({
            chat_id: chat.id,
            sender_id: user_id,
            message: userMessage
          });

          // Emit to chat room
          io.to(String(chat.id)).emit("message", {
            id: savedUserMessage.id,
            chat_id: chat.id,
            sender_id: savedUserMessage.sender_id,
            message: savedUserMessage.message,
            created_at: savedUserMessage.createdAt
          });

          // 4️⃣ Save THERAPIST message
          const savedTherapistMessage = await Messages.create({
            chat_id: chat.id,
            sender_id: therapist_id,
            message: therapistMessage
          });

          // Emit to chat room
          io.to(String(chat.id)).emit("message", {
            id: savedTherapistMessage.id,
            chat_id: chat.id,
            sender_id: savedTherapistMessage.sender_id,
            message: savedTherapistMessage.message,
            created_at: savedTherapistMessage.createdAt
          });

        } catch (err) {
          console.error("Socket chat messages failed:", err);
        }

        // ====================== SOCKET FIX END ======================


        // let smsBody = `Dear ${Userdetails.name}, Your booking for Cp's Reflex Marmaa Therapy is completed.Thank you.Team Stylus Wellness,If you have any query regarding training pls WhatsApp : +917025050147`

        // await sendSMS(Userdetails.phone, smsBody)

      } else {
        //learner checking
        var Userdetails = await Therapist.findOne({
          where: { id: learner_id }
        });

        if (!Userdetails) {
          return res.send({
            result: false,
            message: "Learner details not found"
          });
        }

        var username = Userdetails.name;

        const [updateCount] = await PaymentHistory.update(
          { ph_payment_status: 'paid' },
          { where: { ph_id: payment_id } }
        );

        const [updatebookingpaymentstatus] = await Therapist.update(
          { payment_status: 'paid' },
          { where: { id: learner_id } }
        );

        let smsBody = `Dear ${Userdetails.name}, Your student registration for Cp's Reflex Marmaa Therapy is completed.Thank you.Team Stylus Wellness,If you have any query regarding training pls WhatsApp : +917025050147`
        await sendSMS(Userdetails.phone, smsBody)

        await addNotification({
          user_id: "",
          therapist_id: learner_id,
          type: "Course Payment",
          title: "Course Payment",
          message: "Your Course Payment is done successfully.",
          image: null,
        });

      }

      //=====================whatsapp message==========================

      const sendadminwhatsappmessage = await sendUserDetailsToAdmin(username, Userdetails.phone, Userdetails.email, Userdetails.gender)

      const senduserwhatsappmessage = await sendUserDetailsToUser(username, Userdetails.phone, Userdetails.email, Userdetails.gender)

      //===============================================================

      //=====================user  mail ================================
      let mailOptions = {
        from: `REFLEX MARMA <${process.env.EMAIL_USER}>`,
        to: Userdetails.email,
        subject: "MESSAGE FROM REFLEX MARMA",
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Success</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
    }

    .email-container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }

    .header {
      background-color: #4caf50;
      color: white;
      text-align: center;
      padding: 30px 20px;
    }

    .header h1 {
      margin: 0;
      font-size: 24px;
    }

    .content {
      padding: 30px 20px;
      color: #333;
    }

    .content p {
      line-height: 1.6;
    }

    .order-summary {
      margin-top: 20px;
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
    }

    .order-summary table {
      width: 100%;
      border-collapse: collapse;
    }

    .order-summary th, .order-summary td {
      text-align: left;
      padding: 8px;
    }

    .order-summary th {
      background-color: #eeeeee;
    }

    .footer {
      text-align: center;
      font-size: 12px;
      color: #888;
      padding: 20px;
    }

    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100%;
      }
    }

  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>✅ Payment Successful</h1>
    </div>

    <div class="content">
      <p>Dear ${username},</p>
      <p>We’re happy to let you know that your payment was successfully processed.</p>

      <div class="order-summary">
        <h3>🧾 Payment Details</h3>
        <table>
          <tr>
            <th>Payment ID</th>
            <td>#${payment_id}</td>
          </tr>
          <tr>
            <th>Amount</th>
            <td>RS.${amount}</td>
          </tr>
          <tr>
            <th>Date</th>
            <td>${payment_date}</td>
          </tr>
        </table>
      </div>

      <p>If you have any questions or didn’t authorize this payment, please contact our support team immediately.</p>

      <p>Thank you for your business!<br />
      — THE REFLEX MARMA TEAM </p>
    </div>

    <div class="footer">
      © 2025 Reflex Marma. All rights reserved.
    </div>
  </div>
</body>
              </html>`
      };

      await sendEmail(mailOptions);

      //============================admin mail =======================//

      let mailOptionsAdmin = {
        from: `REFLEX MARMA <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: "New Course Payment Received",
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Payment Notification</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
    }

    .email-container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }

    .header {
      background-color: #2196f3;
      color: white;
      text-align: center;
      padding: 30px 20px;
    }

    .header h1 {
      margin: 0;
      font-size: 24px;
    }

    .content {
      padding: 30px 20px;
      color: #333;
    }

    .content p {
      line-height: 1.6;
    }

    .order-summary {
      margin-top: 20px;
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
    }

    .order-summary table {
      width: 100%;
      border-collapse: collapse;
    }

    .order-summary th, .order-summary td {
      text-align: left;
      padding: 8px;
    }

    .order-summary th {
      background-color: #eeeeee;
    }

    .footer {
      text-align: center;
      font-size: 12px;
      color: #888;
      padding: 20px;
    }
  </style>
</head>
<body>

  <div class="email-container">
    <div class="header">
      <h1>📢 New Course Payment Received</h1>
    </div>

    <div class="content">
      <p>Hello Sir,</p>
      <p>A student has successfully completed a course payment. Below are the details:</p>

      <div class="order-summary">
        <h3>🧾 Student & Payment Details</h3>
        <table>
          <tr>
            <th>Student Name</th>
            <td>${username}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>${Userdetails.email}</td>
          </tr>
          <tr>
            <th>Phone</th>
            <td>${Userdetails.phone}</td>
          </tr>
          <tr>
            <th>Payment ID</th>
            <td>${payment_id}</td>
          </tr>
          <tr>
            <th>Amount</th>
            <td>RS.${amount}</td>
          </tr>
          <tr>
            <th>Date</th>
            <td>${payment_date}</td>
          </tr>
        </table>
      </div>

      <p>Please review and update your records accordingly.</p>

      <p>Regards,<br />
      Reflex Marma</p>
    </div>

    <div class="footer">
      © 2025 Reflex Marma. All rights reserved.
    </div>
  </div>

</body>
</html>

  `
      };

      await sendEmail(mailOptionsAdmin);

      //------------------------------------------------------------------------//
      return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payment Successful</title>
  <style>
    body {
      margin: 0;
      background: #e9f7ef;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }

    .card {
      background: #fff;
      padding: 40px 30px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 450px;
      width: 90%;
      animation: fadeIn 0.6s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .icon {
      font-size: 60px;
      color: #2ecc71;
      margin-bottom: 20px;
    }

    h1 {
      margin: 0 0 15px;
      color: #2ecc71;
      font-size: 26px;
    }

    p {
      color: #333;
      font-size: 16px;
      margin-bottom: 30px;
    }

    .btn {
      background-color: #2ecc71;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      text-decoration: none;
      font-weight: bold;
      font-size: 16px;
      transition: background-color 0.3s ease;
    }

    .btn:hover {
      background-color: #27ae60;
    }

    @media (max-width: 500px) {
      .card {
        padding: 30px 20px;
      }

      h1 {
        font-size: 22px;
      }

      .icon {
        font-size: 48px;
      }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🎉</div>
    <h1>Payment Successful</h1>
    <p>Thank you for your purchase! Your transaction has been completed successfully.</p>
  </div>
</body>
</html>
`);

    } else {
      // Payment failed
      try {
        const paymentData = await PaymentHistory.findOne({
          where: { ph_id: payment_id }
        });

        if (!paymentData) {
          throw new Error(`Payment record with ID ${payment_id} not found.`);
        }

        await PaymentHistory.destroy({
          where: { ph_id: payment_id }
        });

        if (paymentData.ph_learner_id) {
          const therapistExists = await Therapist.findOne({
            where: { id: paymentData.ph_learner_id }
          });

          if (therapistExists && therapistExists.status === 'Pending') {
            await Therapist.destroy({
              where: { id: paymentData.ph_learner_id }
            });
          } else {
            console.warn(`Therapist with ID ${paymentData.ph_learner_id} not found.`);
          }
        }
      } catch (error) {
        console.error("Error during payment deletion:", error);
        // Handle gracefully or rethrow
      }


      return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payment Failed</title>
  <style>
    body {
      margin: 0;
      background-color: #fef2f2;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #b91c1c;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }

    .card {
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      padding: 40px 30px;
      max-width: 450px;
      text-align: center;
      border-top: 8px solid #dc2626;
    }

    .icon {
      font-size: 60px;
      margin-bottom: 20px;
    }

    h1 {
      font-size: 26px;
      margin-bottom: 10px;
    }

    p {
      font-size: 16px;
      margin-bottom: 25px;
    }

    a {
      background-color: #dc2626;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-weight: bold;
      display: inline-block;
      transition: background-color 0.3s ease;
    }

    a:hover {
      background-color: #b91c1c;
    }

    @media only screen and (max-width: 500px) {
      .card {
        margin: 20px;
        padding: 30px 20px;
      }

      .icon {
        font-size: 48px;
      }

      h1 {
        font-size: 22px;
      }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">❌</div>
    <h1>Payment Failed</h1>
    <p>Unfortunately, your payment could not be completed.</p>
    <p>Please try again or contact our support team if the problem continues.</p>
  </div>
</body>
</html>`);
    }

  } catch (error) {
    console.error('RazorpayCallback error:', error);
    return res.status(500).send('Internal Server Error');
  }
};

