const { Booking, User, Therapist, Category, Op } = require('../../models/index.js');
const notification = require('../../utils/addNotification.js')
var moment = require('moment')

module.exports.AddBooking = async (req, res) => {
  try {
    var { service, user_id, therapist_id, duration } = req.body;
    if (!service || !user_id || !therapist_id || !duration) {
      return res.send({
        result: false,
        message: "Please make sure all required fields are filled in."
      })
    }
    let status = 'Request booking'

    const includeOptions = [
      {
        model: Category,
        as: 'category',
        attributes: ['c_id', 'c_name', 'c_image'],
        required: true,
      }
    ]


    const user = await User.findByPk(user_id);

    if (!user) {
      return res.send({
        result: false,
        message: "user not found"
      })
    }
    var therapist = await Therapist.findOne({
      where: {
        id: therapist_id
      },
      include: includeOptions,
    });
    console.log(therapist.category.c_name, "therapisttt");
    // console.log(bookingdetails, "booking");

    let categoryimage = therapist.category.c_image
    if (!therapist) {
      return res.send({
        result: false,
        message: "Therapist not found"
      })
    }
    let addboking = await Booking.create({
      service: service,
      userId: user_id,
      therapistId: therapist_id,
      duration: duration
    });

    await notification.addNotification(user_id, therapist_id, status, `Request Therapy section`, ` ${user.name} request ${service} therapy section to ${therapist.name}`, categoryimage)

    return res.send({
      result: true,
      message: "Therapy request send succesfully"
    })


  } catch (error) {
    return res.send({
      result: false,
      message: error.message
    })
  }
}


module.exports.ListBooking = async (req, res) => {
  try {
    const { u_id, therapist_id, previous, cancelled, appointment } = req.body || {};

    let whereClause = {};
    if (u_id) {
      whereClause.userId = u_id;
      whereClause.status = 'Upcoming';
    }

    if (therapist_id) whereClause.therapistId = therapist_id;

    if (u_id) {
      const checkUser = await User.findOne({ where: { id: u_id } });
      if (!checkUser) {
        return res.status(404).send({
          result: false,
          message: "User not found",
        });
      }
    }

    if (therapist_id) {
      const checkTherapist = await Therapist.findOne({ where: { id: therapist_id } });
      if (!checkTherapist) {
        return res.status(404).send({
          result: false,
          message: "Therapist not found",
        });
      }
    }

    if (previous) {
      if (!u_id) {
        return res.status(400).send({
          result: false,
          message: "User ID is required for previous bookings",
        });
      }
      const Bookinglist = await Booking.findAll({
        where: {
          userId: u_id,
          status: {
            [Op.in]: ['Completed'],
          },
        },
        include: [
          { model: User, as: 'user', attributes: ['name', 'address'] },
          { model: Therapist, as: 'therapist', attributes: ['name', 'specialty'] },
        ],
      });

      if (Bookinglist.length > 0) {
        return res.status(200).send({
          result: true,
          message: "Data retrieved successfully",
          list: Bookinglist,
        });
      } else {
        return res.status(404).send({
          result: false,
          message: "No bookings found",
        });
      }
    }

    if (cancelled) {
      if (!u_id) {
        return res.status(400).send({
          result: false,
          message: "User ID is required for cancelled bookings",
        });
      }
      const Bookinglist = await Booking.findAll({
        where: {
          userId: u_id,
          status: {
            [Op.in]: ['Cancelled'],
          },
        },
        include: [
          { model: User, as: 'user', attributes: ['name', 'address'] },
          { model: Therapist, as: 'therapist', attributes: ['name', 'specialty'] },
        ],
      });

      if (Bookinglist.length > 0) {
        return res.status(200).send({
          result: true,
          message: "Data retrieved successfully",
          list: Bookinglist,
        });
      } else {
        return res.status(404).send({
          result: false,
          message: "No bookings found",
        });
      }
    }

    if (appointment) {
      if (therapist_id) {
        whereClause.therapistId = therapist_id;
        whereClause.status = 'Approved';
      }
      if (u_id) {
        whereClause.userId = u_id;
        whereClause.status = 'Approved';
      }

      const Bookinglist = await Booking.findAll({
        where: whereClause,
        include: [
          { model: User, as: 'user', attributes: ['name', 'address'] },
          { model: Therapist, as: 'therapist', attributes: ['name', 'specialty'] },
        ],
      });

      if (Bookinglist.length > 0) {
        return res.status(200).send({
          result: true,
          message: "Data retrieved successfully",
          list: Bookinglist,
        });
      } else {
        return res.status(404).send({
          result: false,
          message: "No appointments found",
        });
      }
    }

    // Default booking list query
    const Bookinglist = await Booking.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'user', attributes: ['name', 'address'] },
        { model: Therapist, as: 'therapist', attributes: ['name', 'specialty'] },
      ],
    });

    if (Bookinglist.length > 0) {
      return res.status(200).send({
        result: true,
        message: "Data retrieved successfully",
        list: Bookinglist,
      });
    } else {
      return res.status(404).send({
        result: false,
        message: "No bookings found",
      });
    }

  } catch (error) {
    console.error("List Booking Error:", error);
    return res.status(500).send({
      result: false,
      message: "Internal server error: " + error.message,
    });
  }
};



module.exports.UpdateBooking = async (req, res) => {
  try {
    const { b_id, date, time, duration } = req.body;

    if (!b_id) {
      return res.send({
        result: false,
        message: "Booking id is required."
      });
    }

    const bookingdetails = await Booking.findByPk(b_id);

    if (!bookingdetails) {
      return res.send({
        result: false,
        message: "Booking details not found."
      });
    }

    // Build only fields to update
    const updatedFields = {};
    if (date) updatedFields.date = date;
    if (time) updatedFields.time = time;
    if (duration) updatedFields.duration = duration;

    // Only update if any fields are provided
    if (Object.keys(updatedFields).length === 0) {
      return res.send({
        result: false,
        message: "No fields provided to update."
      });
    }

    await Booking.update(updatedFields, {
      where: { id: b_id }
    });

    return res.send({
      result: true,
      message: "Therapy booking updated successfully."
    });

  } catch (error) {
    return res.send({
      result: false,
      message: error.message
    });
  }
};

module.exports.UpdateBookingStatus = async (req, res) => {
  try {
    let { user_id, role } = req.headers;
    const { b_id, status } = req.body;

    if (!b_id || !status) {
      return res.send({
        result: false,
        message: "Booking id and status is required."
      });
    }

    const bookingdetails = await Booking.findByPk(b_id);
    if (!bookingdetails) {
      return res.send({
        result: false,
        message: "Booking details not found."
      });
    }

    if (role === 'user') {
      var userdetails = await User.findByPk(user_id);
      if (!userdetails) {
        return res.send({
          result: false,
          message: "User not found."
        });
      }
    }

    if (role === 'therapist') {
      var userdetails = await Therapist.findByPk(user_id);
      if (!userdetails) {
        return res.send({
          result: false,
          message: "Therapist not found."
        });
      }
    }

    let u_id = bookingdetails.userId;
    let therapist_id = bookingdetails.therapistId;

    const therapistdetails = await Therapist.findOne({
      where: { id: therapist_id },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['c_id', 'c_name', 'c_image'],
          required: true,
        }
      ]
    });

    const categoryimage = therapistdetails?.category?.c_image || null;

    const updatestatus = await Booking.update(
      { status }, 
      { where: { id: b_id } }
    );

    if (updatestatus[0] === 0) {
      return res.send({
        result: false,
        message: "Failed to update booking status."
      });
    }

    await notification.addNotification(
      u_id,
      therapist_id,
      status,
      `Booking ${status}`,
      `${userdetails.name} ${status} ${bookingdetails.service} section`,
      categoryimage
    );

    return res.send({
      result: true,
      message: `Therapy booking ${status} successfully.`
    });

  } catch (error) {
    console.error("UpdateBookingStatus Error:", error);
    return res.send({
      result: false,
      message: error.message
    });
  }
};
