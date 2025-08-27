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
        let { toNumber, message } = req.body
        // await SendWhatsappMessage(toNumber, message)
        const resposne = await sendUserDetailsToAdmin({ name: "sample", phone: "1236654789", email: "qwerty@gmail.com" })
        console.log("resposne : ", resposne)
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