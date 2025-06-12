const formidable = require('formidable');
const { Therapist } = require('../../models/index');
const { formatPhoneNumber } = require('../../utils/sms');
const moment = require('moment')
const path = require('path')
const fs = require('fs')


module.exports.EditProfile = async (req, res) => {
    try {
        const form = new formidable.IncomingForm({ multiples: true });
        let user = req.user
        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(400).send({
                    result: false,
                    message: "File Upload Failed!",
                    data: err,
                });
            }
            const { name, phone } = fields;
            if (!name || !phone) {
                return res.status(400).send({
                    result: false,
                    message: "Name and phone is required.",
                });
            }
            let imagepath = null
            if (files.image) {
                let date = moment().format('YYYY-MM-DD')
                const uploadDir = path.join(process.cwd(), 'uploads', 'profiles_pic');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                if (!files.image || !files.image.filepath || !files.image.originalFilename) {
                    return res.status(400).send({
                        result: false,
                        message: "Invalid image file upload.",
                        data: files.image || null,
                    });
                }
                const oldPath = files.image.filepath;
                const fileName = date + '-' + files.image.originalFilename;
                const newPath = path.join(uploadDir, fileName);
                const rawData = fs.readFileSync(oldPath);
                fs.writeFile(newPath, rawData, async (err) => {
                    if (err) {
                        return res.status(500).send({
                            result: false,
                            message: "File save failed.",
                            data: err,
                        });
                    }
                })
                imagepath = `/uploads/profiles_pic/${fileName}`;
            }
            let [affectedCount] = await Therapist.update(
                { name, phone: formatPhoneNumber(phone), file: imagepath }, // fields to update
                { where: { id: user.id } }        // condition
            );
            if (affectedCount > 0) {
                return res.send({
                    result: true,
                    message: "Profile updated successfully"
                })
            } else {
                return res.send({
                    result: false,
                    message: "Failed to update profile"
                })
            }
        });
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}


module.exports.DeleteProfilePic = async (req, res) => {
    try {
        let user = req.user
        let [affectedCount] = await Therapist.update(
            { file: null },
            { where: { id: user.id } }
        )
        if (affectedCount > 0) {
            return res.send({
                result: true,
                message: "Profile picture removed successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to remove profile picture"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}


module.exports.DeleteProfile = async (req, res) => {
    try {
        const user = req.user;
        const [affectedCount] = await Therapist.update(
            { status: "inactive" },
            { where: { id: user.id } }
        );

        if (affectedCount > 0) {
            return res.send({
                result: true,
                message: "Profile deleted successfully"
            });
        } else {
            return res.send({
                result: false,
                message: "Failed to delete profile"
            });
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};
