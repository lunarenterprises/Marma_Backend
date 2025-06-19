let { sendEmail } = require('../../utils/emailService');
let { User, PaymentHistory, Therapist } = require('../../models/index');
let moment = require('moment')
module.exports.RazorpayCallback = async (req, res) => {
    try {
        let payment_id = req.query.payment_id;

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
            // console.log(payment_details,"payment_details");
            let date = moment().format('YYYYY-MM-DD')

            let user_id = payment_details.ph_user_id;
            let amount = payment_details.ph_total_amount;
            let payment_date = payment_details.ph_date;

            let Userdetails = await User.findOne({
                where: { id: user_id }
            });

            if (!Userdetails) {
                return res.send({
                    result: false,
                    message: "User not found"
                });
            }

            let username = Userdetails.name;

            // ✅ Corrected update
            const [updateCount] = await PaymentHistory.update(
                { ph_payment_status: 'paid' },
                { where: { ph_id: payment_id } }
            );

            if (updateCount > 0) {

                let payAmount = amount * 0.20
                let updatedWallet = (Userdetails.wallet_amount || 0) + payAmount;

                await Therapist.update(
                    { wallet_amount: updatedWallet },
                    { where: { id: user_id } }
                );
                // let addwallethistory = await WalletHistory.create({
                //     wh_user_id: user_id,
                //     wh_amount: payAmount,
                //     wh_date: date
                // });
                let mailOptions = {
                    from: "REFLEX MARMA <nocontact@drlifeboat.com>",
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
    <a href="https://marma.com/" class="btn">Back to Home</a>
  </div>
</body>
</html>
`);
            }
        } else {
            // Payment failed
            await PaymentHistory.destroy({
                where: { ph_id: payment_id }
            });

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
    <a href="https://marma.com/" class="btn">Back to Home</a>
  </div>
</body>
</html>`);
        }
    } catch (error) {
        console.error('RazorpayCallback error:', error);
        return res.status(500).send('Internal Server Error');
    }
};
