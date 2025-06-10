const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const LearnerVideo = sequelize.define('LearnerVideo', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

LearnerVideo.prototype.toJSON = function () {
  const values = { ...this.get() };
  return values;
};

module.exports = LearnerVideo;
