const { Booking, Therapist, Category, User } = require('../../models/index.js');
const notification = require('../../utils/addNotification.js')
const { sendSMS } = require('../../utils/sms')

module.exports.ApproveTherapiRequest = async (req, res) => {
    try {
        let user = req.user
        var { request_id, status } = req.body || {}
        if (!request_id) {
            return res.send({
                result: false,
                message: "Booking id is required"
            })
        }

        // const validStatuses = ['Approve', 'Rejected'];

        // if (!validStatuses.includes(status)) {
        //     return res.send({
        //         result: true,
        //         message: "Invalid Status"
        //     });
        // }

        let therapist_id = user.id

        console.log("Status : ", status)
        const request = await Booking.findOne({
            where: {
                id: request_id,
                therapistId: therapist_id
            }
        });

        if (!request) {
            return res.send({
                result: false,
                message: "Booking details not found"
            })
        }

        const userdetails = await User.findOne({
            where: { id: request.userId },
            attributes: ['name', 'gender', 'address', 'email', 'phone', 'location', 'profile_pic']
        });
        if (!userdetails) {
            return res.send({
                result: false,
                message: "User details not found"
            })
        }
        const therapist = await Therapist.findOne({
            where: { id: therapist_id },
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['c_id', 'c_name', 'c_image'],
                    required: false,
                }
            ]
        });

        if (!therapist) {
            return res.send({
                result: false,
                message: "Therapist not found"
            })
        }

        const categoryimage = therapist?.category?.c_image || null;

        let updateBooking = await Booking.update(
            { status },
            { where: { id: request_id } }
        );

        let smsBody = `Hi, Your therapy request ${status} by therapist ${therapist.name}.`;

        if (status.toLowerCase() === 'approved') {
            smsBody += ' Please confirm therapy date and time through the app.';
        }
        if (status.toLowerCase() === 'rejected') {
            smsBody += 'due to his unavailability,please choose another therapist for your therapy.';
        }
        await sendSMS(userdetails.phone, smsBody);

        await notification.addNotification({
            user_id: request.userId,
            therapist_id: therapist_id,
            type: status,
            title: `Therapy Booking ${status}`,
            message: `${therapist.name} ${status} ${request.service} section`,
            image: categoryimage
        });
        console.log(updateBooking, "addbooking");

        return res.send({
            result: true,
            message: `Therapy booking ${status} succesfully`
        })

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}
