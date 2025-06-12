const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const SubmittedQuestions = sequelize.define('SubmittedQuestions', {
    question: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    selectedAnswer: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    isCorrect: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true
});

SubmittedQuestions.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
};

module.exports = SubmittedQuestions;
