const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const Questions = sequelize.define('Questions', {
    question: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    options: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    answer: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mark: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: true
});

Questions.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
};

module.exports = Questions;
