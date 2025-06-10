
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.js');

const Category = sequelize.define(
    'category',
    {
        c_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        c_name: {
            type: DataTypes.STRING,
            allowNull: false,

        },
        c_image: {
            type: DataTypes.STRING,
            allowNull: false,

        },
        c_status: {
            type: DataTypes.STRING,
            defaultValue: 'active',
            allowNull: false,
        },
    },
    {
        timestamps: true,
        tableName: 'category',
    }
);

Category.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
};

module.exports = Category;

