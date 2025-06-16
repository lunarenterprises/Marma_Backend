const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const Notification = sequelize.define(
  'Notification',
  {
    n_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    n_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    n_therapist_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    n_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    n_messages: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    n_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    n_status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
    },
  },
  {
    tableName: 'notifications',
    timestamps: true,
  }
);

module.exports = Notification;
