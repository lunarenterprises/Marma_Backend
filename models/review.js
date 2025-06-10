
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const Reviews = sequelize.define('reviews', {
    r_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    r_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
     r_therapist_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    r_heading: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    r_comment: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    r_rating: {
        type: DataTypes.DECIMAL(2,1),
        allowNull: false,
        validate: {
            min: 0,
            max: 5
        }
    },
    r_status: {
        type: DataTypes.STRING,
        defaultValue: 'active'
    }
});

Reviews.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
};

module.exports = Reviews;
