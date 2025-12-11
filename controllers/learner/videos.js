const { LearnerVideo } = require('../../models')
const { SendWhatsappMessage, sendUserDetailsToAdmin } = require('../../utils/whatsapp')


module.exports.ListAllVideos = async (req, res) => {
    try {
        let user = req.user
        let videos = await LearnerVideo.findAll()
        return res.send({
            result: true,
            messsage: "Videos retrived successfully",
            videos
        })
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

module.exports.TestWhatsapp = async (req, res) => {
    try {
        // let { toNumber, message } = req.body
        let toNumber = "+919497042580"
        let message = "sample test message"
        let name = "Jack"
        let phone ="9876543210"
        let email ="jack@gmail.com"
        let gender ="male"
        // await SendWhatsappMessage(toNumber, message)
        // const adminresposne = await sendUserDetailsToAdmin({ name: "sample", phone: "1236654789", email: "qwerty@gmail.com" })
        const userresposne = await sendUserDetailsToAdmin(name, phone, email, gender)

        // console.log("adminresposne : ", adminresposne)
        console.log("userresposne : ", userresposne)

        return res.send({
            result: true,
            message: "Message sended successfully"
        })
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}