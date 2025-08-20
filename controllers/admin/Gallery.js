var {Gallery} = require('../../models/index.js')
var formidable = require('formidable')
var fs = require('fs')

module.exports.AddGallery = async (req, res) => {
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

            if (files.file) {
                // console.log("filesss",files.file);
                
                files.file = Array.isArray(files.file) ? files.file[0] : files.file;

                var oldPath = files.file.filepath;
                var newPath =
                    process.cwd() +
                    "/uploads/gallery/" + files.file.originalFilename
                let rawData = fs.readFileSync(oldPath);
                let file_type = files.file.mimetype.split('/')[0]
                fs.writeFileSync(newPath, rawData)
                var imagepath = "/uploads/gallery/" + files.file.originalFilename
                console.log(file_type,imagepath);

                var Insertgallery = await Gallery.create({file:imagepath,type:file_type})

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

