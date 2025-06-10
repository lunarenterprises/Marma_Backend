const Category = require('../../models/admin/addCategory');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
let moment = require('moment')

module.exports.AddCategory = async (req, res) => {
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

            const { c_name } = fields;

            if (!c_name) {
                return res.status(400).send({
                    result: false,
                    message: "category name' is required.",
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
                const uploadDir = path.join(process.cwd(), 'uploads', 'category');
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

                    const imagepath = `uploads/category/${fileName}`;
                    try {
                        const newCategory = await Category.create({
                            c_name,
                            c_image: imagepath,
                        });

                        return res.send({
                            result: true,
                            message: "Category added successfully",
                            data: newCategory,
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



module.exports.ListCategory = async (req, res) => {
    try {

        let categorylist = await Category.findAll();

        if (categorylist.length > 0) {
            return res.send({
                result: true,
                message: "Data retrived",
                list: categorylist,
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



module.exports.EditCategory = async (req, res) => {
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

            const { c_id, c_name } = fields;

            if (!c_id || !c_name) {
                return res.status(400).send({
                    result: false,
                    message: "'id' and 'category name' are required.",
                });
            }

            const category = await Category.findByPk(c_id);

            if (!category) {
                return res.status(404).send({
                    result: false,
                    message: "Category not found.",
                });
            }

            let updatedData = { c_name };

            if (files.image) {
                const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;

                if (!imageFile.filepath || !imageFile.originalFilename) {
                    return res.status(400).send({
                        result: false,
                        message: "Invalid image file.",
                    });
                }

                const uploadDir = path.join(process.cwd(), 'uploads', 'category');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                const fileName = Date.now() + '-' + imageFile.originalFilename;
                const oldPath = imageFile.filepath;
                const newPath = path.join(uploadDir, fileName);
                const relativePath = `uploads/category/${fileName}`;

                try {
                    const rawData = fs.readFileSync(oldPath);
                    fs.writeFileSync(newPath, rawData);
                    updatedData.c_image = relativePath;
                } catch (fsErr) {
                    return res.status(500).send({
                        result: false,
                        message: "Image saving failed.",
                        data: fsErr.message,
                    });
                }
            }

            await category.update(updatedData);

            return res.send({
                result: true,
                message: "Category updated successfully",
                data: category,
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
