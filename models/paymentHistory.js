const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const PaymentHistory = sequelize.define('PaymentHistory', {
    ph_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    ph_therapist_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    ph_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    ph_learner_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    ph_booking_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    ph_type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ph_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    ph_price_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    ph_total_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    ph_pay_therapist: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    ph_pay_doctor: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    ph_payment_status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',

    },
    ph_status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active',
    },
}, {
    tableName: 'PaymentHistory',
    timestamps: true,
});

PaymentHistory.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
};

module.exports = PaymentHistory;
