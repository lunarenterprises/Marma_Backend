const { Notification } = require('../models/index');

module.exports.addNotification = async (user_id, therapist_id,type, title, message,image) => {
  try {

    const addnotification = await Notification.create({
      n_user_id: user_id,
      n_therapist_id: therapist_id, 
      n_type: type,
      n_title:title,
      n_messages: message,
      n_image:image,
    });

    return !!addnotification; // Return true if the creation succeeded
  } catch (error) {
    console.log('Add Notification Error:', error.message);
    return false;
  }
};
