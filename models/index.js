const sequelize = require('../config/db.js');
const { Op } = require('sequelize');

// Import all models
const Role = require('./role.js');
const User = require('./user.js');
const Reviews = require('./review.js');
const LearnerVideo = require('./learnerVideo.js');
const Therapist = require('./therapist.js');
const Booking = require('./booking.js');
const OtpLog = require('./otpLog.js');
const Category = require('./admin/addCategory.js');
const Chat = require('./chat.js');
const Messages = require('./messages.js');
const Notification = require('./notification.js');
const Questions = require('./questions.js')
const SubmitQuestions = require('./submittedQuestions.js')
const Bank=require('./bank.js')
const PaymentHistory=require('./paymentHistory.js')
const WalletHistory=require('./wallethistory.js')
const WithdrawRequest=require('./withdrawRequest.js')





// === Define Associations === //

// Role ↔ Users
User.belongsTo(Role, { foreignKey: 'roleId' });
Role.hasMany(User, { foreignKey: 'roleId' });

Therapist.belongsTo(Role, { foreignKey: 'roleId' })
Role.hasMany(Therapist, { foreignKey: 'roleId' });

// User ↔ OTP Logs
OtpLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User ↔ Reviews
User.hasMany(Reviews, { foreignKey: 'r_user_id' });
Reviews.belongsTo(User, { foreignKey: 'r_user_id' });

// Therapist ↔ Category
Therapist.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Therapist ↔ Reviews
Therapist.hasMany(Reviews, { foreignKey: 'r_therapist_id', as: 'reviews' });
Reviews.belongsTo(Therapist, { foreignKey: 'r_therapist_id', as: 'therapist' });

// Therapist ↔ Bookings
Therapist.hasMany(Booking, { foreignKey: 'therapistId', as: 'bookings' });
Booking.belongsTo(Therapist, { foreignKey: 'therapistId', as: 'therapist' });

// Booking ↔ User
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Question → SubmittedQuestions (1:M)
Questions.hasMany(SubmitQuestions, { foreignKey: 'question' });
SubmitQuestions.belongsTo(Questions, { foreignKey: 'question' });

// Therapist → SubmittedQuestions (1:M)
Therapist.hasMany(SubmitQuestions, { foreignKey: 'userId' });
SubmitQuestions.belongsTo(Therapist, { foreignKey: 'userId' });

// then run associations after all models are loaded
Chat.belongsTo(User, { as: "sender", foreignKey: "sender_id" });
Chat.belongsTo(User, { as: "receiver", foreignKey: "receiver_id" });
Chat.hasMany(Messages, { foreignKey: "chat_id" });

User.hasMany(Chat, { as: "SentChats", foreignKey: "sender_id" });
User.hasMany(Chat, { as: "ReceivedChats", foreignKey: "receiver_id" });

Messages.belongsTo(Chat, { foreignKey: "chat_id" });
Messages.belongsTo(User, { foreignKey: "sender_id" });

Bank.belongsTo(Therapist,{ foreignKey: "therapist_id" })

// === Initial Seeding === //

const initRoles = async () => {
  try {
    const roles = ['admin', 'therapist', 'learner', 'user'];
    for (const roleName of roles) {
      await Role.findOrCreate({ where: { name: roleName } });
    }
    console.log('Roles initialized successfully');
  } catch (error) {
    console.error('Error initializing roles:', error);
  }
};

const createDefaultAdmin = async () => {
  try {
    const normalizedUsername = 'Admin'.toLowerCase();
    const normalizedEmail = 'admin@gmail.com'.toLowerCase();

    const existingAdmin = await User.findOne({
      where: {
        [Op.or]: [
          { name: normalizedUsername },
          { email: normalizedEmail },
        ],
      },
      paranoid: false, // Include soft-deleted users
    });

    if (existingAdmin) {
      if (existingAdmin.deletedAt) {
        await existingAdmin.restore();
        console.log('Restored soft-deleted admin user.');
      } else {
        console.log('Admin user already exists.');
      }
      return;
    }

    let adminRole = await Role.findOne({ where: { name: 'admin' } });
    if (!adminRole) {
      adminRole = await Role.create({ name: 'admin' });
    }

    await User.create({
      email: normalizedEmail,
      name: 'Admin',
      password: 'Admin@123',
      roleId: adminRole.id,
      status: 'active',
      phone: '1234567890',
      address: 'Reflex Marma',
      location: 'Reflex Marma Head Office',
    });

    console.log('Admin user created successfully!');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

const initializeDatabase = async () => {
  await initRoles();
  await createDefaultAdmin();
};

// === Export Everything === //
module.exports = {
  sequelize,
  Op,
  Role,
  User,
  Reviews,
  LearnerVideo,
  Therapist,
  Booking,
  OtpLog,
  Category,
  Messages,
  Chat,
  Notification,
  Questions,
  SubmitQuestions,
  Bank,
  PaymentHistory,
  WalletHistory,
  WithdrawRequest,
  initRoles,
  createDefaultAdmin,
  initializeDatabase,
};
