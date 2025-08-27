
// const client = require('twilio')(process.env.TWILIO_SID_TEST, process.env.TWILIO_AUTH_TOKEN_TEST);
const client = require('twilio')(process.env.TWILIO_SID_LIVE, process.env.TWILIO_AUTH_TOKEN_LIVE);
const axios = require('axios');

module.exports.SendWhatsappMessage = async (toNumber, message) => {
    try {
        console.log("toNumber : ", toNumber)
        console.log("message : ", message)
        const response = await client.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${toNumber}`, // e.g. whatsapp:+919999999999
            body: JSON.stringify(message),
        });
        console.log('Message sent:', response);
    } catch (error) {
        console.log("Error sending whatsapp message : ", error)
    }
}

module.exports.sendUserDetailsToAdmin = async (user) => {
    try {
        const response = await axios.post(
            'https://app-server.wati.io/api/v1/sendTemplateMessage',
            {
                template_name: 'user_registration_alert', // replace with your template name
                broadcast_name: 'New User Alert',
                parameters: [
                    { name: '1', value: user.name },
                    { name: '2', value: user.phone },
                    { name: '3', value: user.email }
                ],
                phone_number: '918921848655' // Admin's WhatsApp number (without +)
            },
            {
                headers: {
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkYTYyZGQ2Ny0zZTFlLTRiMTgtYjk1OC1lYzQxOTllOWFlNmYiLCJ1bmlxdWVfbmFtZSI6ImFyc2hhZGx1bmFyQGdtYWlsLmNvbSIsIm5hbWVpZCI6ImFyc2hhZGx1bmFyQGdtYWlsLmNvbSIsImVtYWlsIjoiYXJzaGFkbHVuYXJAZ21haWwuY29tIiwiYXV0aF90aW1lIjoiMDgvMjYvMjAyNSAwNToxOTo0OSIsImRiX25hbWUiOiJ3YXRpX2FwcF90cmlhbCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlRSSUFMIiwiZXhwIjoxNzU2ODU3NjAwLCJpc3MiOiJDbGFyZV9BSSIsImF1ZCI6IkNsYXJlX0FJIn0.6-1I9kZjKTwoY2_hdJpm3Etrb-_JOWwma09RrEQmyHs',
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Message sent to admin:', response.data);
    } catch (error) {
        console.error('❌ Failed to send message:', error.response?.data || error.message);
    }
};