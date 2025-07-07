const { Doctors } = require('../../models/index');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
let moment = require('moment');
const { where } = require('sequelize');

module.exports.AddDoctor = async (req, res) => {
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

            const { d_name, d_phone, d_specialization } = fields;

            if (!d_name || !d_phone || !d_specialization) {
                return res.status(400).send({
                    result: false,
                    message: "Doctor all details is required.",
                });
            }

            let date = moment().format('YYYY-MM-DD')

            if (!files.image) {
                return res.status(400).send({
                    result: false,
                    message: "Image is required.",
                });
            }

            try {
                const uploadDir = path.join(process.cwd(), 'uploads', 'doctors');
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

                    const imagepath = `uploads/doctors/${fileName}`;
                    try {
                        const newDoctor = await Doctors.create({
                            d_name, d_phone, d_specialization,
                            d_image: imagepath,
                        });

                        return res.send({
                            result: true,
                            message: "Doctor added successfully",
                            data: newDoctor,
                        });
                    } catch (dbErr) {
                        return res.status(500).send({
                            result: false,
                            message: "Database error.",
                            data: dbErr.message,
                        });
                    }
                });

            } catch (fileErr) {
                return res.status(500).send({
                    result: false,
                    message: "File processing error.",
                    data: fileErr.message,
                });
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send({
            result: false,
            message: "Unexpected server error.",
            data: error.message,
        });
    }
};



module.exports.ListDoctor = async (req, res) => {
    try {
        let { d_id } = req.body || {};
        let whereclause = {};

        if (d_id) {
            whereclause.d_id = d_id;
        }

        let Doctorlist = await Doctors.findAll({
            where: whereclause
        });


        if (Doctorlist.length > 0) {
            return res.send({
                result: true,
                message: "Data retrived",
                list: Doctorlist,
            });
        } else {
            return res.send({
                result: false,
                message: "data not found",
            });
        }
    } catch (error) {

        return res.send({
            result: false,
            message: error.message,
        });


    }
}



module.exports.EditDoctor = async (req, res) => {
    try {
        const form = new formidable.IncomingForm({ multiples: true });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(400).send({
                    result: false,
                    message: "Form parsing failed.",
                    data: err,
                });
            }

            const { d_id, d_name, d_phone, d_specialization } = fields;

            if (!d_id) {
                return res.status(400).send({
                    result: false,
                    message: "Doctor ID is required.",
                });
            }

            const doctor = await Doctors.findByPk(d_id);
            if (!doctor) {
                return res.status(404).send({
                    result: false,
                    message: "Doctor not found.",
                });
            }

            // Prepare updated fields
            const updatedData = {};
            if (d_name) updatedData.d_name = d_name;
            if (d_phone) updatedData.d_phone = d_phone;
            if (d_specialization) updatedData.d_specialization = d_specialization;

            // Handle file upload
            if (files.image) {
                const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;

                if (!imageFile.filepath || !imageFile.originalFilename) {
                    return res.status(400).send({
                        result: false,
                        message: "Invalid image file.",
                    });
                }

                const uploadDir = path.join(process.cwd(), 'uploads', 'doctors');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                const fileName = Date.now() + '-' + imageFile.originalFilename;
                const oldPath = imageFile.filepath;
                const newPath = path.join(uploadDir, fileName);
                const relativePath = `uploads/doctors/${fileName}`;

                try {
                    const rawData = fs.readFileSync(oldPath);
                    fs.writeFileSync(newPath, rawData);
                    updatedData.d_image = relativePath;
                } catch (fsErr) {
                    return res.status(500).send({
                        result: false,
                        message: "Image saving failed.",
                        data: fsErr.message,
                    });
                }
            }

            // Update doctor instance
            await Doctors.update(updatedData, {
                where: { d_id: d_id }
            });


            return res.send({
                result: true,
                message: "Doctor updated successfully",
                data: doctor, // returns updated doctor
            });
        });
    } catch (error) {
        return res.status(500).send({
            result: false,
            message: "Unexpected server error.",
            data: error.message,
        });
    }
};


module.exports.DeleteDoctor = async (req, res) => {
    try {
        let { d_id } = req.body || {};


        let checkDoctor = await Doctors.findAll({
            where: { d_id: d_id }
        });


        if (checkDoctor.length > 0) {
            let Deletedoctor = await Doctors.destroy({
                where: { d_id: d_id }
            });
            console.log("Deletedoctor :", Deletedoctor);

            if (Deletedoctor) {
                return res.send({
                    result: true,
                    message: "Doctor details deleted sucessfully",
                });
            }

        } else {
            return res.send({
                result: false,
                message: "doctor data not found",
            });
        }
    } catch (error) {

        return res.send({
            result: false,
            message: error.message,
        });


    }
}
