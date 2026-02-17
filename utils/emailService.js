const nodemailer = require('nodemailer');

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 587, // Correct port for Gmail SMTP with TLS
  auth: {
    type: 'custom',
    method: 'PLAIN',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const sendEmail = async (mailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    // console.log(`Email sent: ${info.response}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email sending failed');
  }
};


const emailTemplates = {
  resetPassword: (resetUrl, name) => {
    return `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #333;
              line-height: 1.5;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .btn {
              background-color: #007bff;
              color: #fff;
              padding: 12px 20px;
              text-decoration: none;
              border-radius: 5px;
            }
            .footer {
              font-size: 12px;
              color: #777;
              text-align: center;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Hello, ${name}!</h2>
            <p>We received a request to reset your password. To reset it, click the link below:</p>
            <a href="${resetUrl}" class="btn">Reset Password</a>
            <p>If you didn't request this change, you can ignore this email.</p>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  welcomeEmail: (name) => {
    return `
      <html>
        <body>
          <h2>Welcome to our platform, ${name}!</h2>
          <p>Thank you for signing up. We are excited to have you on board.</p>
        </body>
      </html>
    `;
  },
};

module.exports = { sendEmail,emailUser: process.env.EMAIL_USER, emailTemplates };
