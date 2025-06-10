exports.getDashboard = async (req, res) => {
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
