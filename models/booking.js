const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const Booking = sequelize.define(
  'Booking',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    service: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    therapistId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    accepted_time: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    completed_time: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Upcoming', 'Approved', 'Ongoing', 'Completed', 'Cancelled', 'Rescheduled', 'Rejected', 'Timeout'),
      defaultValue: 'Upcoming',
    },
    otp: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    duration: {
      type: DataTypes.STRING,
    },
    date: {
      type: DataTypes.DATEONLY,
    },
    time: {
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.STRING,
    },
    paymentStatus: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
    tableName: 'bookings',
  }
);

Booking.prototype.toJSON = function () {
  const values = { ...this.get() };
  return values;
};

module.exports = Booking;
