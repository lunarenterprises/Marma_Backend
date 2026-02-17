const formidable = require('formidable');
const { Therapist } = require('../../models/index');
const { formatPhoneNumber } = require('../../utils/sms');
const moment = require('moment')
const path = require('path')
const fs = require('fs')

module.exports.EditProfile = async (req, res) => {
    try {
        const form = new formidable.IncomingForm({ multiples: true });
        const user = req.user;

        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(400).send({
                    result: false,
                    message: "File Upload Failed!",
                    data: err,
                });
            }

            let imagepath = null;

            // Handle file upload
            if (files.image && files.image.filepath && files.image.originalFilename) {
                const date = moment().format('YYYY-MM-DD');
                const uploadDir = path.join(process.cwd(), 'uploads', 'profiles_pic');

                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                const oldPath = files.image.filepath;
                const fileName = `${date}-${files.image.originalFilename}`;
                const newPath = path.join(uploadDir, fileName);
                const rawData = fs.readFileSync(oldPath);

                fs.writeFileSync(newPath, rawData);
                imagepath = `/uploads/profiles_pic/${fileName}`;
            }

            // Build update data dynamically
            const updateData = {};

            if (fields.name) updateData.name = fields.name;
            if (fields.clinicName) updateData.clinicName = fields.clinicName;
            if (fields.gender) updateData.gender = fields.gender;
            if (fields.category_id) updateData.category_id = fields.category_id;
            if (fields.email) updateData.email = fields.email;
            if (fields.phone) updateData.phone = formatPhoneNumber(fields.phone);
            if (fields.specialization) updateData.specialization = fields.specialization;
            if (fields.experience) updateData.experience = fields.experience;
            if (fields.specialty) updateData.specialty = fields.specialty;
            if (fields.description) updateData.description = fields.description;
            if (fields.state) updateData.state = fields.state;
            if (fields.district) updateData.district = fields.district;
            if (fields.location) updateData.location = fields.location;
            if (fields.longitude) updateData.longitude = fields.longitude;
            if (fields.latitude) updateData.latitude = fields.latitude;
            if (fields.availability) updateData.availability = fields.availability;
            if (fields.available_time) updateData.available_time = fields.available_time;
            if (imagepath) updateData.file = imagepath;

            // Update in DB
            const affectedCount = await Therapist.update(updateData, {
                where: { id: user.id }
            });

            (user.id, affectedCount, "eee");

            if (affectedCount > 0) {
                return res.send({
                    result: true,
                    message: "Profile updated successfully"
                });
            } else {
                return res.send({
                    result: false,
                    message: "No changes made to the profile"
                });
            }
        });

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};
