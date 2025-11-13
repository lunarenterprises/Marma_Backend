var { Testimonial } = require('../../models/index.js')
var formidable = require('formidable')
var fs = require('fs')
let path = require('path')

module.exports.AddTestimonial = async (req, res) => {
    try {
        var form = new formidable.IncomingForm({ multiples: true });
        form.parse(req, async function (err, fields, files) {
            if (err) {
                return res.send({
                    result: false,
                    message: "File Upload Failed!",
                    data: err,
                });
            }

            let { name, message, rating } = fields
            if (!name || !message || !rating) {

            }
            if (files.file) {
                // console.log("filesss",files.file);

                const file = Array.isArray(files.file) ? files.file[0] : files.file;

                const oldPath = file.filepath;
                const fileName = file.originalFilename;
                const fileType = file.mimetype.split('/')[0];

                const uploadDir = path.join(process.cwd(), 'uploads', 'testimonial');

                // Ensure directory exists
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                const newPath = path.join(uploadDir, fileName);
                const imagePath = `/uploads/testimonial/${fileName}`;

                const rawData = fs.readFileSync(oldPath);
                fs.writeFileSync(newPath, rawData);
                console.log(fileType, imagePath);

                var InsertTestimonial = await Testimonial.create({name:name, file: imagePath, message: message, rating: rating })
                console.log("InsertTestimonial", InsertTestimonial);

                if (InsertTestimonial) {
                    return res.send({
                        result: true,
                        message: "Testimonial is added"
                    })
                } else {
                    return res.send({
                        result: false,
                        message: "failed to add Testimonial"
                    })
                }

            } else {
                return res.send({
                    result: false,
                    message: "file is missing"
                })
            }

        })

    } catch
    (error) {
        return res.send({
            result: false,
            message: error.message
        })

    }
}

module.exports.listTestimonial = async (req, res) => {
    try {

        let listTestimonial = await Testimonial.findAll();
        if (listTestimonial.length > 0) {
            return res.send({
                result: true,
                message: "data retrived",
                list: listTestimonial
            });

        } else {
            return res.send({
                result: false,
                message: "data not found"
            })
        }
    } catch (error) {

        return res.send({
            result: false,
            message: error.message,
        });


    }
}

module.exports.EditTestimonial = async (req, res) => {
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

            const { testmonial_id, name, message, rating  } = fields;

            if (!testmonial_id) {
                return res.status(400).send({
                    result: false,
                    message: "Testimonial ID is required.",
                });
            }

            const testimonial = await Testimonial.findByPk(testmonial_id);
            if (!testimonial) {
                return res.status(404).send({
                    result: false,
                    message: "Testimonial not found.",
                });
            }

            // Prepare updated fields
            const updatedData = {};
            if (name) updatedData.name = name;
            if (message) updatedData.message = message;
            if (rating) updatedData.rating = rating;

            // Handle file upload
            if (files.file) {
                const imageFile = Array.isArray(files.file) ? files.file[0] : files.file;

                if (!imageFile.filepath || !imageFile.originalFilename) {
                    return res.status(400).send({
                        result: false,
                        message: "Invalid image file.",
                    });
                }

                const uploadDir = path.join(process.cwd(), 'uploads', 'testimonial');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                const fileName = Date.now() + '-' + imageFile.originalFilename;
                const oldPath = imageFile.filepath;
                const newPath = path.join(uploadDir, fileName);
                const relativePath = `uploads/testimonial/${fileName}`;

                try {
                    const rawData = fs.readFileSync(oldPath);
                    fs.writeFileSync(newPath, rawData);
                    updatedData.file = relativePath;
                } catch (fsErr) {
                    return res.status(500).send({
                        result: false,
                        message: "Image saving failed.",
                        data: fsErr.message,
                    });
                }
            }

            // Update Testimonial instance
            await Testimonial.update(updatedData, {
                where: { id: testmonial_id }
            });

            return res.send({
                result: true,
                message: "Testimonial updated successfully",
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


module.exports.DeleteTestimonial = async (req, res) => {
    try {

        var testimonial_id = req.body.testimonial_id;
        let deleteTestimonial = await Testimonial.destroy({ where: { id: testimonial_id } });

        if (deleteTestimonial) {
            return res.send({
                result: true,
                message: "Testimonial removed successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to delete Testimonial"
            })
        }
    } catch (error) {

        return res.send({
            result: false,
            message: error.message
        })
    }
}

