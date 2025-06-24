const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const WalletHistory = sequelize.define(
  'WalletHistory',
  {
    wh_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    wh_therapist_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    wh_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    wh_type: {
      type: DataTypes.ENUM('Credit', 'Debit'),
      allowNull: false,
      defaultValue: 'Credit'
    },
    wh_status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
    },
  },
  {
    tableName: 'WalletHistory',
    timestamps: true, // set true if you want createdAt and updatedAt
  }
);

module.exports = WalletHistory;
