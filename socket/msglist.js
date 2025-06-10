    // sockets/index.js  (or whatever you call this file)
const { Op, literal } = require("sequelize");
const Chat = require("../models/chat");
const Message = require("../models/messages");
const User = require('../models/user')

module.exports = function (io) {
    const onlineUsers = new Map(); // user_id => socket.id
    io.on("connection", (socket) => {
        console.log(`🔌  Socket ${socket.id} connected`);

        // When a user connects and identifies themselves
        socket.on("userOnline", ({ user_id }) => {
            if (!user_id) return;
            onlineUsers.set(user_id, socket.id);
            io.emit("onlineUsers", Array.from(onlineUsers.keys())); // broadcast online user IDs
        });

        socket.on("listChats", async ({ user_id }) => {
            try {
                if (!user_id) {
                    return socket.emit("error", "Missing user ID(s)");
                }
                let user = await User.verifyUser(user_id)
                if (!user) {
                    return socket.emit("error", "Sender not found");
                }
                /* ---------------- core query ---------------- */
                const chats = await Chat.findAll({
                    where: {
                        [Op.or]: [{ sender_id: user_id }, { receiver_id: user_id }]
                    },
                    /* bring in the “other” user’s public info */
                    include: [
                        {
                            model: User,
                            as: "sender",
                            attributes: ["id", "name", "username", "profile_pic"]
                        },
                        {
                            model: User,
                            as: "receiver",
                            attributes: ["id", "name", "username", "profile_pic"]
                        }
                    ],
                    /* put newest chats first */
                    order: [["updatedAt", "DESC"]],
                    /* add two computed columns with SQL sub-queries */
                    attributes: {
                        include: [
                            /* lastMessageId – we’ll use it in a moment */
                            [
                                literal(`
                (SELECT id
                 FROM   Messages
                 WHERE  Messages.chat_id = Chat.id
                 ORDER BY createdAt DESC
                 LIMIT 1)
              `),
                                "lastMessageId"
                            ],
                            /* unreadCount */
                            [
                                literal(`
                (SELECT COUNT(*)
                 FROM   Messages
                 WHERE  Messages.chat_id = Chat.id
                   AND  Messages.is_read = 0
                   AND  Messages.sender_id != ${user_id})
              `),
                                "unreadCount"
                            ]
                        ]
                    },
                    raw: true
                });
                console.log("chats : ", chats)
                /* ---------- fetch all last messages in one go ---------- */
                const lastIds = chats.map(c => c.lastMessageId).filter(Boolean);
                const lastMessages = await Message.findAll({
                    where: { id: lastIds },
                    attributes: ["id", "chat_id", "sender_id", "message", "createdAt"],
                    raw: true
                });
                console.log("lastMessages : ", lastMessages)
                const lastById = Object.fromEntries(
                    lastMessages.map(m => [m.chat_id, m])
                );

                /* ---------- shape final payload ---------- */
                const payload = chats.map(c => {
                    const partner =
                        c.sender_id === user_id
                            ? { id: c["receiver.id"], name: c["receiver.name"], username: c["receiver.username"], profile_pic: c["receiver.profile_pic"] }
                            : { id: c["sender.id"], name: c["sender.name"], username: c["sender.username"], profile_pic: c["sender.profile_pic"] };

                    return {
                        chat_id: c.id,
                        partner,
                        lastMessage: lastById[c.id] || null,
                        unreadCount: Number(c.unreadCount) || 0
                    };
                });
                socket.emit("chats", payload);
            } catch (error) {
                console.error("joinRoom error:", error);
                socket.emit("error", "Could not join room");
            }
        })

        /* ---------- 1. JOIN A CHAT ROOM ---------- */
        socket.on("joinRoom", async ({ user_id, receiver_id }) => {
            try {
                if (!user_id || !receiver_id) {
                    return socket.emit("error", "Missing user ID(s)");
                }
                let user = await User.findByPk(user_id)
                if (!user) {
                    return socket.emit("error", "Sender not found");
                }
                /* a) fetch or create the one-to-one Chat row */
                const [chat] = await Chat.findOrCreate({
                    where: {
                        [Op.or]: [
                            { sender_id: user_id, receiver_id },   // A→B
                            { sender_id: receiver_id, receiver_id: user_id } // B→A
                        ]
                    },
                    defaults: {                                         // 👈  <- ADD THIS
                        sender_id: user_id,
                        receiver_id: receiver_id
                    }
                });
                /* b) make the socket join the room named = chat.id */
                const room = String(chat.id);              // rooms must be strings
                socket.join(room);

                /* c) pull full history (order oldest→newest) */
                const messages = await Message.findAll({
                    where: { chat_id: chat.id },
                    order: [["createdAt", "ASC"]]
                });

                /* d) broadcast “joined” + history to *everyone* in the room
                      (so the sender also receives it)                      */
                io.to(room).emit("joined", { chat_id: chat.id, messages });

                console.log(
                    `👥  User ${user_id} joined room ${room} with user ${receiver_id}`
                );
            } catch (err) {
                console.error("joinRoom error:", err);
                socket.emit("error", "Could not join room");
            }
        });

        /* ---------- 2. SEND A MESSAGE ---------- */
        socket.on("sentMessage", async ({ chat_id, sender_id, message }) => {
            try {
                if (!chat_id || !sender_id || !message) {
                    return socket.emit("error", "Invalid message data");
                }
                /* save message first (so DB is source-of-truth) */
                const saved = await Message.create({
                    chat_id,
                    sender_id,
                    message,
                });

                /* broadcast to *everyone* in the room, including sender */
                io.to(String(chat_id)).emit("message", {
                    id: saved.id,
                    chat_id: saved.chat_id,
                    sender_id: saved.sender_id,
                    message: saved.message,
                    created_at: saved.createdAt
                });

                console.log("💬  ", { chat_id, sender_id, message });
            } catch (err) {
                console.error("sentMessage error:", err);
                socket.emit("error", "Message not sent");
            }
        });

        socket.on("typing", ({ chat_id, user_id }) => {
            socket.to(String(chat_id)).emit("typing", { user_id });
        });

        socket.on("stopTyping", ({ chat_id, user_id }) => {
            socket.to(String(chat_id)).emit("stopTyping", { user_id });
        });

        socket.on("messageRead", async ({ chat_id, user_id, message_id }) => {
            try {
                await Message.update(
                    { is_read: true }, // you need a boolean `is_read` column
                    { where: { id: message_id } }
                );
                socket.to(String(chat_id)).emit("messageRead", { message_id, user_id });
            } catch (err) {
                console.error("messageRead error:", err);
            }
        });

        // When a user disconnects
        socket.on("disconnect", () => {
            for (const [userId, sockId] of onlineUsers.entries()) {
                if (sockId === socket.id) {
                    onlineUsers.delete(userId);
                    break;
                }
            }
            io.emit("onlineUsers", Array.from(onlineUsers.keys())); // update all clients
        });
    });
};



