const OtpLog = require('../models/otpLog'); 


const createOtpLog = async ( phone, userId, purpose ) => {
  try {
    
    const otpLog = await OtpLog.create({
      phone,
      userId,
      purpose,
      status: 'Pending', 
    });

    return otpLog;
  } catch (error) {
    console.error('Error creating OTP log:', error);
    throw new Error('Failed to create OTP log');
  }
};

module.exports = createOtpLog;
