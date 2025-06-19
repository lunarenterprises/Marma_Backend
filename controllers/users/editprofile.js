const User = require('../../models/user'); // Adjust the path as needed
const formidable = require('formidable');
const fs = require('fs').promises;
const path = require('path');

module.exports.EditProfile = async (req, res) => {
  try {
    const form = new formidable.IncomingForm({ multiples: false });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).send({
          result: false,
          message: "File upload failed!",
          data: err,
        });
      }

      const { u_id } = fields;
      if (!u_id) {
        return res.status(400).send({
          result: false,
          message: "User ID is required",
        });
      }

      const user = await User.findByPk(u_id);
      if (!user) {
        return res.status(404).send({
          result: false,
          message: "User not found",
        });
      }

      // Build dynamic update object based on input fields
      const updateData = {};
      if (fields.name) updateData.name = fields.name;
      if (fields.gender) updateData.gender = fields.gender;
      if (fields.email) updateData.email = fields.email;
      if (fields.phone) updateData.phone = fields.phone;
      if (fields.second_phone) updateData.second_phone = fields.second_phone;
      if (fields.address) updateData.address = fields.address;
      if (fields.district) updateData.district = fields.district;
      if (fields.state) updateData.state = fields.state;
      if (fields.location) updateData.location = fields.location;

      // Handle profile_pic upload
      if (files.image) {
        const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
        const oldPath = imageFile.filepath;
        const fileName = `${Date.now()}-${imageFile.originalFilename}`;
        const uploadDir = path.join(process.cwd(), 'uploads', 'profiles_pic');

        await fs.mkdir(uploadDir, { recursive: true });
        const newPath = path.join(uploadDir, fileName);
        const relativePath = path.join('uploads', 'profiles_pic', fileName);

        try {
          const rawData = await fs.readFile(oldPath);
          await fs.writeFile(newPath, rawData);
          updateData.profile_pic = relativePath;
        } catch (fsErr) {
          return res.status(500).send({
            result: false,
            message: "Error saving image",
            data: fsErr.message,
          });
        }
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).send({
          result: false,
          message: "No fields provided for update",
        });
      }

      // Update user record
      await User.update(updateData, {
        where: { id: u_id }
      });

      const updatedUser = await User.findByPk(u_id);

      return res.send({
        result: true,
        message: "Profile updated successfully",
        data: updateData
      });
    });
  } catch (error) {
    return res.status(500).send({
      result: false,
      message: error.message
    });
  }
};
