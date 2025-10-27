const { Booking, Therapist, Category } = require('../../models/index.js');
const notification = require('../../utils/addNotification.js')


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

        let u_id = request.userId
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

        const therapist = await Therapist.findOne({
            where: { id: user.id },
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['c_id', 'c_name', 'c_image'],
                    required: true,
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

        await notification.addNotification(
            u_id,
            therapist_id,
            status,
            `Therapy Booking ${status}`,
            `${therapist.name} ${status} ${request.service} section`,
            categoryimage
        );
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