const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const Chat = sequelize.define(
    'Chat',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        sender_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        receiver_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = Chat   ;