const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const Gallery = sequelize.define('Gallery', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  file: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Gallery.prototype.toJSON = function () {
  const values = { ...this.get() };
  return values;
};

module.exports = Gallery;
