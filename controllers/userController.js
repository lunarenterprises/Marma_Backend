const { User } = require('../models')


module.exports.getDashboard = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      message: 'User dashboard data fetched successfully',
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error in getDashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};


module.exports.DeleteMyAccount = async (req, res) => {
  try {
    const { id } = req.user
    const deleted = await User.destroy({
      where: { id }
    })
    if (deleted) {
      return res.send({
        result: true,
        message: "Account deleted successfully"
      })
    } else {
      return res.send({
        result: false,
        message: "Failed to delete account"
      })
    }
  } catch (error) {
    return res.send({
      result: false,
      message: error.message
    })
  }
}