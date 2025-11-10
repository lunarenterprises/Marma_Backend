const { Op } = require('sequelize');
const { Therapist } = require('../../models/index');
const { formatPhoneNumber } = require('../../utils/sms')
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const formidable = require('formidable');

// Add a new therapist
exports.addTherapist = async (req, res) => {
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
            const { name, clinicName,gender, email, phone, specialization, experience, availability, description } = fields

            await Therapist.destroy({
                where: {
                    phone: formatPhoneNumber(phone),
                    phoneVerified: 'false',
                },
            });
            await Therapist.destroy({
                where: {
                    email: email.toLowerCase().trim(),
                    phoneVerified: 'false',
                },
            })
            let checkEmail = await Therapist.findOne({
                where: { email: email.toLowerCase().trim() }
            })
            if (checkEmail) {
                return res.send({
                    result: false,
                    message: "Email already registered"
                })
            }
            let checkPhone = await Therapist.findOne({
                where: { phone: formatPhoneNumber(phone), phoneVerified: "true" }
            })
            if (checkPhone) {
                return res.send({
                    result: false,
                    message: "Phone number is already registered"
                })
            }

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
            const therapist = await Therapist.create({
                name,
                clinicName,
                gender,
                email,
                phone,
                specialization,
                experience,
                availability,
                description,
                file: imagepath,
                roleId:'3',
                status:"Approved"
            });
            
            res.status(201).json({ success: true, data: therapist });
        })
    } catch (error) {
        console.error('Error creating therapist:', error);
        res.status(500).json({ success: false, message: 'Failed to add therapist.' });
    }
};