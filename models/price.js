
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const priceDetails = sequelize.define('priceDetails', {
    pd_id : {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    pd_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
     pd_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    pd_therapist_fee: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    pd_doctor_fee: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    pd_maintenance_fee: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    pd_status: {
        type: DataTypes.STRING,
        defaultValue: 'active'
    }
});

priceDetails.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
};

module.exports = priceDetails;
