const twilio = require('twilio');
const axios = require('axios');

const client = twilio(
    process.env.TWILIO_SID_LIVE,
    process.env.TWILIO_AUTH_TOKEN_LIVE
);

module.exports.SendWhatsappMessage = async (toNumber, message) => {
    try {
        console.log("toNumber :", toNumber);
        console.log("message :", message);

        const response = await client.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${toNumber}`,
            body: message   // ❗ FIXED — message should NOT be JSON.stringify()
        });

        console.log('✅ WhatsApp message sent:', response.sid);
    } catch (error) {
        console.error("❌ Error sending WhatsApp message:", error.message);
    }
};



// module.exports.sendUserDetailsToAdmin = async (user) => {
//     try {
//         const response = await axios.post(
//             'https://app-server.wati.io/api/v1/sendTemplateMessage',
//             {
//                 template_name: 'user_registration_alert',
//                 broadcast_name: 'New User Alert',
//                 parameters: [
//                     { name: '1', value: user.name },
//                     { name: '2', value: user.phone },
//                     { name: '3', value: user.email }
//                 ],
//                 phone_number: process.env.ADMIN_WHATSAPP_NUMBER // ❗ FIXED — moved to env
//             },
//             {
//                 headers: {
//                     'Authorization': `Bearer ${process.env.WATI_API_TOKEN}`,   // ❗ FIXED — removed hard-coded token
//                     'Content-Type': 'application/json'
//                 }
//             }
//         );

//         console.log('✅ Admin template message sent:', response.data);
//     } catch (error) {
//         console.error(
//             '❌ Failed to send admin message:',
//             error.response?.data || error.message
//         );
//     }
// };


module.exports.sendUserDetailsToAdmin = async (name, phone, email, gender) => {
    try {
        const message = await client.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${process.env.ADMIN_WHATSAPP_NUMBER}`,
            contentSid: process.env.TWILIO_WHATSAPP_TEMPLATE_SID,
            contentVariables: JSON.stringify({
                "1": name,
                "2": phone,
                "3": email,
                "4": gender
            })
        });


        console.log("Template message sent:", message.sid);
        return message;
    } catch (err) {
        console.error("Error sending template message:", err);
    }
}

