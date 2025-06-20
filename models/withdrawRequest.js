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
      type: DataTypes.ENUM('Pending', 'Approved', 'Reject'),
      allowNull: false,
      defaultValue: 'Pending',
    },
  },
  {
    tableName: 'withdraw_request',
    timestamps: true, 
  }
);


module.exports = WithdrawRequest;
