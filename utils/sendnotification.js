const { Notification } = require('../models/index');
var moment = require('moment')
var firebasenotification = require('./firebase');


module.exports.SendNotification = async ({ user_id, therapist_id, type, title, message, image }) => {
  try {

    const date = moment().format("YYYY-MM-DD");
    const time = moment().format("HH:mm:ss");

    if (!message || !receiver_id) {
      return {
        result: false,
        message: "insufficient parameters",
      };
    }

    const notifiactionbody = { body: message };

    const messages = {
      message,
      type,
      message_date: date,
      message_time: time,
    };

    const senduser = await firebasenotification.FirebaseSendNotification(messages, notifiactionbody, user_id, 'user');

    const sendtherapist = await firebasenotification.FirebaseSendNotification(messages, notifiactionbody, therapist_id, 'therapist');

    const addnotification = await Notification.create({
      n_user_id: user_id,
      n_therapist_id: therapist_id,
      n_type: type,
      n_title: title,
      n_messages: message,
      n_image: image,
      n_date: date,
      n_time: time,
    });

    if (addnotification.affectedRows > 0) {
      return {
        result: true,
        message: send,
      };
    } else {
      return {
        result: false,
        message: "failed to send notification",
      };
    }
  } catch (error) {
    console.error(error);
    return {
      result: false,
      message: error.message,
    };
  }
};
