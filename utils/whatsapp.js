const twilio = require('twilio');
const axios = require('axios');

const client = twilio(
    process.env.TWILIO_SID_LIVE,
    process.env.TWILIO_AUTH_TOKEN_LIVE
);


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



