const { Op } = require('sequelize');
let { Chat, User, Messages } = require('../../models/index')

module.exports.GetChatId = async (req, res) => {
    try {
        const { receiver_id, user_id } = req.body || {}
        if (!receiver_id) {
            return res.send({
                result: false,
                message: "Receiver id is required"
            })
        }

        const user = await User.findByPk(user_id);
        if (!user) {
            return res.send({ result: false, message: "User not found" });
        }
        const receiver = await User.findByPk(receiver_id)
        if (!receiver) {
            return res.send({
                result: false,
                message: "Receiver not found"
            })
        }
        // ✅ Check if chat already exists (regardless of sender/receiver order)
        let chat = await Chat.findOne({
            where: {
                [Op.or]: [
                    { sender_id: user_id, receiver_id: receiver_id },
                    { sender_id: receiver_id, receiver_id: user_id }
                ]
            }
        });

        // ❌ If chat doesn't exist, create it
        if (!chat) {
            chat = await Chat.create({
                sender_id: user_id,
                receiver_id: receiver_id
            });
        }

        return res.send({
            result: true,
            message: "Chat retrieved successfully",
            chat_id: chat.id,
            chat
        });

    } catch (error) {
        return res.status(500).send({
            result: false,
            message: error.message
        })
    }
}


module.exports.SendMessage = async (req, res) => {
    try {
        const { user_id } = req.body;
        const { chat_id, message } = req.body
        if (!chat_id || !message) {
            return res.send({
                result: false,
                message: "Receiver id, chat id and message is required"
            })
        }
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.send({ result: false, message: "User not found" });
        }
        const chat = await Chat.findByPk(chat_id)
        if (!chat) {
            return res.send({
                result: false,
                message: "Chat not found"
            })
        }
        const messageData = await Messages.create({
            chat_id,
            sender_id: user_id,
            message
        })
        if (messageData) {
            return res.send({
                result: true,
                message: "Message send successfully"
            })
        } else {
            return res.send({
                result: false,
                message: "Failed to send message"
            })
        }
    } catch (error) {
        return res.status(500).send({
            result: false,
            message: error.message
        })
    }
}


module.exports.ListAllMessages = async (req, res) => {
    try {
        const { user_id } = req.body;
        const { chat_id } = req.body
        if (!chat_id) {
            return res.send({
                result: false,
                message: "Chat id is required"
            })
        }
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.send({ result: false, message: "User not found" });
        }
        const chat = await Chat.findByPk(chat_id)
        if (!chat) {
            return res.send({
                result: false,
                message: "Chat not found"
            })
        }
        let messages = await Messages.findAll({
            where: { chat_id }
        })
        return res.send({
            result: true,
            message: "Messages retrieved successfully",
            data: messages
        })
    } catch (error) {
        return res.status(500).send({
            result: false,
            message: error.message
        })
    }
}