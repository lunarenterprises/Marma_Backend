const { Op } = require('sequelize');
const { Therapist } = require('../../models/index');
const { formatPhoneNumber } = require('../../utils/sms')
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const formidable = require('formidable');

// Add a new therapist
module.exports.addTherapist = async (req, res) => {
    logger.info("Add therapist request received");

    try {
        const form = new formidable.IncomingForm({ multiples: false });
        const user = req.user;

        form.parse(req, async (err, fields, files) => {
            try {
                if (err) {
                    logger.error("Formidable parse error", err);
                    return res.status(400).json({
                        result: false,
                        message: "File upload failed",
                    });
                }

                logger.info("Form parsed successfully");

                let {
                    name,
                    clinicName,
                    gender,
                    email,
                    phone,
                    specialization,
                    experience,
                    availability,
                    description
                } = fields;

                email = email?.toLowerCase().trim();
                const formattedNumber = formatPhoneNumber(phone);

                logger.info("Checking and cleaning unverified therapists", {
                    email,
                    phone: formattedNumber,
                });

                /** Remove unverified duplicates */
                await Therapist.destroy({
                    where: {
                        [Sequelize.Op.or]: [
                            { phone: formattedNumber },
                            { email }
                        ],
                        phoneVerified: false,
                    },
                });

                logger.info("Checking if email already exists", { email });

                const checkEmail = await Therapist.findOne({ where: { email } });
                if (checkEmail) {
                    logger.warn("Duplicate email detected", { email });
                    return res.status(409).json({
                        result: false,
                        message: "Email already registered",
                    });
                }

                logger.info("Checking if phone already exists", { phone: formattedNumber });

                const checkPhone = await Therapist.findOne({
                    where: {
                        phone: formattedNumber,
                        phoneVerified: true,
                    },
                });

                if (checkPhone) {
                    logger.warn("Duplicate phone detected", { phone: formattedNumber });
                    return res.status(409).json({
                        result: false,
                        message: "Phone number already registered",
                    });
                }

                /** Handle image upload */
                let imagepath = null;

                if (files?.image) {
                    logger.info("Image upload detected");

                    const uploadDir = path.join(process.cwd(), "uploads", "profiles_pic");
                    if (!fs.existsSync(uploadDir)) {
                        fs.mkdirSync(uploadDir, { recursive: true });
                        logger.info("Upload directory created", { uploadDir });
                    }

                    const date = moment().format("YYYY-MM-DD");
                    const fileName = `${date}-${files.image.originalFilename}`;
                    const newPath = path.join(uploadDir, fileName);

                    await fs.promises.copyFile(files.image.filepath, newPath);

                    imagepath = `/uploads/profiles_pic/${fileName}`;
                    logger.info("Image saved successfully", { imagepath });
                }

                logger.info("Creating therapist record");

                const therapist = await Therapist.create({
                    name,
                    clinicName,
                    gender,
                    email,
                    phone: formattedNumber,
                    specialization,
                    experience,
                    availability,
                    description,
                    file: imagepath,
                    roleId: 3,
                    status: "Approved",
                });

                logger.info("Therapist created successfully", {
                    therapistId: therapist.id,
                    email,
                });

                return res.status(201).json({
                    success: true,
                    data: therapist,
                });

            } catch (innerError) {
                logger.error("Error while processing add therapist form", innerError);
                return res.status(500).json({
                    success: false,
                    message: "Failed to add therapist",
                });
            }
        });

    } catch (error) {
        logger.fatal("Unexpected error in addTherapist controller", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};



module.exports.TherapistEditProfile = async (req, res) => {
    try {
        const form = new formidable.IncomingForm({ multiples: true });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(400).send({
                    result: false,
                    message: "File Upload Failed!",
                    data: err,
                });
            }
            let { therapist_id } = fields;

            if (!therapist_id) {
                return res.send({
                    result: false,
                    message: "therapist id is required"
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
            if (fields.status) updateData.status = fields.status;
            if (imagepath) updateData.file = imagepath;

            // Update in DB
            const affectedCount = await Therapist.update(updateData, {
                where: { id: therapist_id }
            });
            console.log(therapist_id, affectedCount, "eee");

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