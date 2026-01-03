const formidable = require('formidable');
const { Therapist } = require('../../models/index');
const { formatPhoneNumber } = require('../../utils/sms');
const moment = require('moment')
const path = require('path')
const fs = require('fs')
const { addNotification } = require('../../utils/addNotification');
const { log } = require('console');


module.exports.EditProfile = async (req, res) => {
    try {
        const form = new formidable.IncomingForm({ multiples: false });
        const user = req.user;

        form.parse(req, async (err, fields, files) => {
            try {
                if (err) {
                    return res.status(400).send({
                        result: false,
                        message: "File Upload Failed!",
                        data: err,
                    });
                }

                // Normalize fields (formidable sometimes returns arrays)
                const learner_id = fields.learner_id?.toString();
                const name = fields.name?.toString();
                const phone = fields.phone?.toString();
                const email = fields.email?.toString();
                const location = fields.location?.toString();

                if (!learner_id) {
                    return res.status(400).send({
                        result: false,
                        message: "Learner id is required",
                    });
                }

                let imagepath = null;

                // Handle image upload
                if (files.image) {
                    const file = files.image;
                    if (!file.filepath || !file.originalFilename) {
                        return res.status(400).send({
                            result: false,
                            message: "Invalid image file upload.",
                        });
                    }

                    const uploadDir = path.join(process.cwd(), "uploads", "profiles_pic");
                    if (!fs.existsSync(uploadDir)) {
                        fs.mkdirSync(uploadDir, { recursive: true });
                    }

                    const date = moment().format("YYYY-MM-DD");
                    const fileName = `${date}-${file.originalFilename}`;
                    const newPath = path.join(uploadDir, fileName);

                    // Move file instead of reading/writing manually
                    await fs.promises.rename(file.filepath, newPath);

                    imagepath = `/uploads/profiles_pic/${fileName}`;
                }

                // Build update object
                const updateData = {};
                if (name) updateData.name = name;
                if (phone) updateData.phone = formatPhoneNumber(phone);
                if (email) updateData.email = email;
                if (location) updateData.location = location;
                if (imagepath) updateData.file = imagepath;

                const [affectedCount] = await Therapist.update(
                    updateData,
                    { where: { id: learner_id } }
                );


                if (affectedCount > 0) {

                    return res.send({
                        result: true,
                        message: "Profile updated successfully",
                    });
                } else {
                    return res.send({
                        result: false,
                        message: "Failed to update profile",
                    });
                }

            } catch (innerError) {
                return res.status(500).send({
                    result: false,
                    message: innerError.message,
                });
            }
        });
    } catch (error) {
        return res.status(500).send({
            result: false,
            message: error.message,
        });
    }
};



module.exports.DeleteProfilePic = async (req, res) => {
    try {
        const { learner_id } = req.query.learner_id;

        const checklearner = await Therapist.findAll(
            { where: { id: learner_id } }
        );
        if (!checklearner) {
            return res.send({
                result: false,
                message: "Learner not found"
            });
        }
        let [affectedCount] = await Therapist.update(
            { file: null },
            { where: { id: learner_id } }
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
        const learner_id = parseInt(req.query.learner_id); // Convert to integer

        if (!learner_id || isNaN(learner_id)) {
            return res.send({
                result: false,
                message: "Invalid learner ID"
            });
        }

        const checklearner = await Therapist.findByPk(learner_id); // Use findByPk for single record

        if (!checklearner) {
            return res.send({
                result: false,
                message: "Learner not found"
            });
        }

        const affectedCount = await Therapist.destroy({ where: { id: learner_id } }); // No destructuring

        if (affectedCount > 0) {
            await addNotification({
                user_id: null,
                therapist_id: learner_id,
                type: "Deleted Profile",
                title: "Learner Profile Deleted",
                message: `Admin deleted learner ${checklearner.name} profile.`,
                image:null  
            });
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


module.exports.GetProfile = async (req, res) => {
    try {
        let user = req.user
        let therapist = await Therapist.findOne({
            where: { id: user.id },
            attributes: ['id', 'name', 'email', 'phone', 'file']
        })
        if (therapist) {
            return res.send({
                result: true,
                message: "Profile fetched successfully",
                data: therapist
            })
        } else {
            return res.send({
                result: false,
                message: "Profile not found"
            })
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}