
const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

module.exports.sendSMS = async (toNumber, message) => {
  try {
    const res = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: toNumber
    });
    console.log('Message SID:', res.sid);
  } catch (err) {
    console.error('Error sending SMS:', err);
  }
};


module.exports.formatPhoneNumber = (phone, defaultCountryCode = '+91') => {
  if (!phone) return null;

  // Remove spaces, dashes, etc.
  phone = phone.trim().replace(/[\s-]/g, '');

  // If number already starts with '+', assume it's in E.164 format
  if (phone.startsWith('+')) {
    return phone;
  }

  // If number starts with '0', remove it
  if (phone.startsWith('0')) {
    phone = phone.substring(1);
  }

  // Add country code
  return defaultCountryCode + phone;
}
