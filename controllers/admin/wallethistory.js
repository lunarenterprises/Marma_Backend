const { Therapist, WalletHistory, User,Doctors } = require('../../models/index');

module.exports.ListWalletHistory = async (req, res) => {
  try {
    const user = req.user;
    let { therapist_id, doctor_id } = req.body || {}

    // // ✅ Authorization check
    // if (!user || user.Role?.name !== 'admin') {
    //   return res.status(403).send({
    //     result: false,
    //     message: "You are unauthorized, please contact the administrator.",
    //   });
    // }

    // ✅ Dynamic where clause
    const whereClause = {};
    if (therapist_id) whereClause.wh_therapist_id = therapist_id;
    if (doctor_id) whereClause.wh_doctor_id = doctor_id;

    // ✅ Define include relations
    const include = [
      {
        model: User,
        as: 'user',
        attributes: ['name', 'profile_pic'],
      },
      {
        model: Therapist,
        as: 'therapist',
        attributes: ['name', 'file'],
      },
      {
        model: Doctors,
        as: 'doctor',
        attributes: ['d_name', 'd_image'],
      },
    ];

    // ✅ Fetch wallet history
    const data = await WalletHistory.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      include,
    });

    // ✅ Return response
    return res.send({
      result: true,
      message: data.length > 0 ? "Data retrieved successfully" : "No history found",
      data,
    });

  } catch (error) {
    console.error("ListWalletHistory Error:", error);
    return res.status(500).send({
      result: false,
      message: error.message,
    });
  }
};

