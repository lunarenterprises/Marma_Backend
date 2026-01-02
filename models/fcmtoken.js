const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const fcmtoken = sequelize.define(
    'fcmtoken',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        ft_u_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        ft_therapist_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        ft_fcm_token: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = fcmtoken;