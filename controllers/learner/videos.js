const { LearnerVideo } = require('../../models')


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