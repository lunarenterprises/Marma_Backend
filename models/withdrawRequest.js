const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const WithdrawRequest = sequelize.define(
  'WithdrawRequest',
  {
    wr_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    wr_therapist_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    wr_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    wr_status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
      allowNull: false,
      defaultValue: 'Pending',
    },
  },
  {
    tableName: 'WithdrawRequest',
    timestamps: true,
  }
);


module.exports = WithdrawRequest;
