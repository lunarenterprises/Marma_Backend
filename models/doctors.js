const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const Doctors = sequelize.define('Doctors', {
  d_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  d_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  d_phone: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  d_specialization: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  d_image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  d_wallet: {
    type: DataTypes.INET,
    allowNull: true,
    defaultValue: '0',
  },
  d_status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'active',
  }
}, {
  tableName: 'Doctors',
  timestamps: true, // disable createdAt/updatedAt
});

module.exports = Doctors;
