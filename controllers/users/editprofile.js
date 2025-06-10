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

      const { u_id, name, email, phone, gender } = fields;

      if (!u_id || !name || !email || !phone || !gender) {
        return res.status(400).send({
          result: false,
          message: "Insufficient parameters",
        });
      }

      
      const user = await User.findByPk(u_id);
      if (!user) {
        return res.status(404).send({
          result: false,
          message: "User not found",
        });
      }

      // Keep existing profile picture if none uploaded
      let imagePath = user.profile_pic;

      // Handle profile image upload
      if (files.image) {
        const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
        const oldPath = imageFile.filepath;
        const fileName = `${Date.now()}-${imageFile.originalFilename}`;
        const uploadDir = path.join(process.cwd(), 'uploads', 'profiles_pic');

        // Ensure the directory exists
        await fs.mkdir(uploadDir, { recursive: true });

        const newPath = path.join(uploadDir, fileName);
        const relativePath = path.join('uploads', 'profiles_pic', fileName);

        try {
          const rawData = await fs.readFile(oldPath);
          await fs.writeFile(newPath, rawData);
          imagePath = relativePath;
        } catch (fsErr) {
          return res.status(500).send({
            result: false,
            message: "Error saving image",
            data: fsErr.message
          });
        }
      }

      // Update the user
      await User.update(
        {
          name,
          email,
          phone,
          gender,
          profile_pic: imagePath
        },
        {
          where: { id: u_id }
        }
      );

      const updatedUser = await User.findByPk(u_id);

      return res.send({
        result: true,
        message: "Profile updated successfully",
        data: updatedUser.toJSON()
      });
    });
  } catch (error) {
    return res.status(500).send({
      result: false,
      message: error.message
    });
  }
};
