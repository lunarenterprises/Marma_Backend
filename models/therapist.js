const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const Therapist = sequelize.define(
  'Therapist',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    clinicName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    specialization: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    specialty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    district: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    availability: {
      type: DataTypes.ENUM('Online', 'Offline'),
      defaultValue: 'Offline',
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5,
      },
    },
    file: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    wallet: {
      type: DataTypes.DECIMAL(10, 0),
      allowNull: true,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Inactive'),
      defaultValue: 'Pending',
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneVerified: {
      type: DataTypes.ENUM('true', 'false'),
      allowNull: true,
      defaultValue: 'false',
    }
  },
  {
    timestamps: true
  }
);

Therapist.prototype.toJSON = function () {
  const values = { ...this.get() };
  return values;
};

module.exports = Therapist;

