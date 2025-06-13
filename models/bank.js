const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const Bank = sequelize.define(
    'Bank',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        bank_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        account_number: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active',
        },
        ifsc_code: {
            type: DataTypes.STRING,
        },
        branch: {
            type: DataTypes.STRING,
        },
        therapist_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        timestamps: true,
        tableName: 'Bank',
    }
);

Bank.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
};

module.exports = Bank;
