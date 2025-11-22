var { Gallery } = require('../../models/index.js')
var formidable = require('formidable')
var fs = require('fs')
let path = require('path')
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB in bytes
module.exports.AddGallery = async (req, res) => {
    try {
        var form = new formidable.IncomingForm({ multiples: true, maxFileSize: MAX_FILE_SIZE, });
        form.parse(req, async function (err, fields, files) {
            if (err) {
                return res.send({
                    result: false,
                    message: "File Upload Failed!",
                    data: err,
                });
            }

            let { description } = fields
            if (files.file) {
                // console.log("filesss",files.file);

                const file = Array.isArray(files.file) ? files.file[0] : files.file;

                const oldPath = file.filepath;
                const fileName = file.originalFilename;
                const fileType = file.mimetype.split('/')[0];

                const uploadDir = path.join(process.cwd(), 'uploads', 'gallery');

                // Ensure directory exists
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                const newPath = path.join(uploadDir, fileName);
                const imagePath = `/uploads/gallery/${fileName}`;

                const rawData = fs.readFileSync(oldPath);
                fs.writeFileSync(newPath, rawData);
                console.log(fileType, imagePath);

                var Insertgallery = await Gallery.create({ file: imagePath, description: description, type: fileType })

                if (Insertgallery) {
                    return res.send({
                        result: true,
                        message: "Gallery File added"
                    })
                } else {
                    return res.send({
                        result: false,
                        message: "failed to add Gallery File"
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

module.exports.listGallery = async (req, res) => {
    try {

        let listGallery = await Gallery.findAll();
        if (listGallery.length > 0) {
            return res.send({
                result: true,
                message: "data retrived",
                list: listGallery
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


module.exports.DeleteGallery = async (req, res) => {
    try {

        var Gallery_id = req.body.Gallery_id;
        let deleteGallery = await Gallery.destroy({ where: { id: Gallery_id } });

        if (deleteGallery) {
            return res.send({
                result: true,
                message: "Gallery file removed successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to delete Gallery file"
            })
        }
    } catch (error) {

        return res.send({
            result: false,
            message: error.message
        })
    }
}

