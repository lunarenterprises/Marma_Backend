const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const Testimonial = sequelize.define('Testimonial', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    file: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    rating: {
        type: DataTypes.STRING,
        allowNull: true,
    }
});

Testimonial.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
};

module.exports = Testimonial;
