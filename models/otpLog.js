const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const OtpLog = sequelize.define('OtpLog', {
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  purpose: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Verified', 'Expired', 'Failed'),
    defaultValue: 'Pending',
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

OtpLog.prototype.toJSON = function () {
  const values = { ...this.get() };
  return values;
};

module.exports = OtpLog;
