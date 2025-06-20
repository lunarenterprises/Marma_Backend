let { User } = require('../../models/index')


module.exports.ListUSer = async (req, res) => {
    try {
        var { u_id } = req.body;
        const { Op } = require("sequelize");

        let userlist = await User.findAll(
            u_id
                ? { where: { id: u_id, roleId: { [Op.ne]: 1 } } }
                : { where: { roleId: { [Op.ne]: 1 } } }
        );

        if (userlist.length > 0) {
            return res.send({
                result: true,
                message: "Data retrived",
                list: userlist,
            });
        } else {
            return res.send({
                result: false,
                message: "user not found",
            });
        }
    } catch (error) {

        return res.send({
            result: false,
            message: error.message,
        });


    }
}