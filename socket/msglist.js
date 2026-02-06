const { Op, literal } = require("sequelize");
const { User, Therapist, Chat, Messages, Booking } = require('../models/index');

let ioInstance = null;

module.exports = function (io) {

    ioInstance = io; // 👈 SAVE io globally

    const onlineUsers = new Map(); // key: `${role}-${id}`, value: socket.id

    // ✅ Reusable broadcaster function
    function broadcastOnlineList() {
        const allOnline = Array.from(onlineUsers.keys());

        for (const [key, sockId] of onlineUsers.entries()) {
            const [role] = key.split("-");
            const filtered = allOnline.filter(
                k => k !== key && !k.startsWith(role)
            );

            const socketInstance = io.sockets.sockets.get(sockId);
            if (socketInstance) {
                socketInstance.emit("onlineUsers", filtered);
            }
        }
    }

    io.on("connection", (socket) => {
        console.log(`🔌 Socket ${socket.id} connected`);
        console.log("IP:", socket.handshake.address);
        console.log("connection:", socket.handshake.headers['user-agent']);

        // ⏳ IDENTIFICATION TIMEOUT (FIXED)
        socket.data.timer = setTimeout(() => {
            console.log("⏳ Unidentified socket timed out:", socket.id);
            socket.disconnect(true);
        }, 10000); // 10 seconds

        socket.on("userOnline", async ({ user_id, role }) => {
            try {
                if (!user_id || !role) return;

                // ✅ Clear timeout once identified
                if (socket.data.timer) {
                    clearTimeout(socket.data.timer);
                    socket.data.timer = null;
                }

                const key = `${role}-${user_id}`;

                // Store data for disconnect
                socket.data.userId = user_id;
                socket.data.userKey = key;
                socket.data.role = role;

                // Update availability
                if (role === "therapist") {
                    await Therapist.update(
                        { availability: "Online" },
                        { where: { id: user_id } }
                    );
                }

                // Single-session policy
                onlineUsers.set(key, socket.id);

                console.log("✅ Online user registered:", key);

                broadcastOnlineList();
            } catch (err) {
                console.error("userOnline error:", err);
            }
        });

        socket.on("listChats", async ({ user_id, role }) => {
            try {
                if (!user_id || !role)
                    return socket.emit("error", "Missing user ID(s) or role");

                const isUser = role === 'user';
                const user = isUser
                    ? await User.findByPk(user_id)
                    : await Therapist.findByPk(user_id);

                if (!user)
                    return socket.emit("error", `${role} not found`);

                const chats = await Chat.findAll({
                    where: {
                        [Op.or]: [
                            { sender_id: user_id },
                            { receiver_id: user_id }
                        ]
                    },
                    include: [
                        { model: User, as: "sender", attributes: ["id", "name", "profile_pic"] },
                        { model: User, as: "receiver", attributes: ["id", "name", "profile_pic"] }
                    ],
                    order: [["updatedAt", "DESC"]],
                    attributes: {
                        include: [
                            [literal(`(
                                SELECT id FROM Messages
                                WHERE Messages.chat_id = Chat.id
                                ORDER BY createdAt DESC
                                LIMIT 1
                            )`), "lastMessageId"],
                            [literal(`(
                                SELECT COUNT(*)
                                FROM Messages
                                WHERE Messages.chat_id = Chat.id
                                AND Messages.is_read = 0
                                AND Messages.sender_id != ${user_id}
                            )`), "unreadCount"]
                        ]
                    },
                    raw: true
                });

                const lastIds = chats.map(c => c.lastMessageId).filter(Boolean);

                const lastMessages = await Messages.findAll({
                    where: { id: lastIds },
                    attributes: ["id", "chat_id", "sender_id", "message", "createdAt"],
                    raw: true
                });

                const lastById = Object.fromEntries(
                    lastMessages.map(m => [m.chat_id, m])
                );

                const payload = [];

                for (const c of chats) {
                    const isSender = c.sender_id == user_id;

                    const partner = isSender
                        ? {
                            id: c["receiver.id"],
                            name: c["receiver.name"],
                            profile_pic: c["receiver.profile_pic"]
                        }
                        : {
                            id: c["sender.id"],
                            name: c["sender.name"],
                            profile_pic: c["sender.profile_pic"]
                        };

                    const userId = (c.sender_role === 4)
                        ? c.sender_id
                        : c.receiver_id;

                    const therapistId = (c.sender_role === 3)
                        ? c.sender_id
                        : c.receiver_id;

                    const booking = await Booking.findAll({
                        where: { userId, therapistId },
                        raw: true
                    });

                    payload.push({
                        chat_id: c.id,
                        partner,
                        lastMessage: lastById[c.id] || null,
                        unreadCount: Number(c.unreadCount) || 0,
                        booking
                    });
                }

                socket.emit("chats", payload);
            } catch (error) {
                console.error("listChats error:", error);
                socket.emit("error", "Could not fetch chat list");
            }
        });

        socket.on("joinRoom", async ({ user_id, receiver_id, user_role, receiver_role }) => {
            try {
                if (!user_id || !receiver_id || !user_role || !receiver_role)
                    return socket.emit("error", "Missing user ID(s) and roles");

                if (user_role === 3 && !(await Therapist.findByPk(user_id)))
                    return socket.emit("error", "Therapist (sender) not found");

                if (user_role === 4 && !(await User.findByPk(user_id)))
                    return socket.emit("error", "User (sender) not found");

                if (receiver_role === 3 && !(await Therapist.findByPk(receiver_id)))
                    return socket.emit("error", "Therapist (receiver) not found");

                if (receiver_role === 4 && !(await User.findByPk(receiver_id)))
                    return socket.emit("error", "User (receiver) not found");

                const [chat] = await Chat.findOrCreate({
                    where: {
                        [Op.or]: [
                            {
                                sender_id: user_id,
                                receiver_id,
                                sender_role: user_role,
                                receiver_role
                            },
                            {
                                sender_id: receiver_id,
                                receiver_id: user_id,
                                sender_role: receiver_role,
                                receiver_role: user_role
                            }
                        ]
                    },
                    defaults: {
                        sender_id: user_id,
                        receiver_id,
                        sender_role: user_role,
                        receiver_role
                    }
                });

                const room = String(chat.id);
                socket.join(room);

                const messages = await Messages.findAll({
                    where: { chat_id: chat.id },
                    order: [["createdAt", "ASC"]]
                });

                io.to(room).emit("joined", {
                    chat_id: chat.id,
                    messages
                });

                console.log(`👥 User ${user_id} joined room ${room}`);
            } catch (err) {
                console.error("joinRoom error:", err);
                socket.emit("error", "Could not join room");
            }
        });

        socket.on("sentMessage", async ({ chat_id, sender_id, message }) => {
            try {
                if (!chat_id || !sender_id || !message)
                    return socket.emit("error", "Invalid message data");

                const saved = await Messages.create({
                    chat_id,
                    sender_id,
                    message
                });

                io.to(String(chat_id)).emit("message", {
                    id: saved.id,
                    chat_id: saved.chat_id,
                    sender_id: saved.sender_id,
                    message: saved.message,
                    created_at: saved.createdAt
                });

                console.log("💬", { chat_id, sender_id, message });
            } catch (err) {
                console.error("sentMessage error:", err);
                socket.emit("error", "Message not sent");
            }
        });

        socket.on("typing", ({ chat_id, user_id }) => {
            if (!chat_id || !user_id) return;
            socket.to(String(chat_id)).emit("typing", { user_id });
        });

        socket.on("stopTyping", ({ chat_id, user_id }) => {
            if (!chat_id || !user_id) return;
            socket.to(String(chat_id)).emit("stopTyping", { user_id });
        });

        socket.on("messageRead", async ({ chat_id, user_id }) => {
            try {
                if (!chat_id || !user_id) return;

                await Messages.update(
                    { is_read: true },
                    {
                        where: {
                            chat_id,
                            is_read: false,
                            sender_id: { [Op.ne]: user_id }
                        }
                    }
                );

                socket.to(String(chat_id)).emit("messagesRead", {
                    chat_id,
                    reader_id: user_id
                });
            } catch (err) {
                console.error("messageRead error:", err);
            }
        });

        socket.on("triggerAction", ({ chat_id, action }) => {
            if (!chat_id || !action) return;
            socket.to(String(chat_id)).emit("triggerAction", { action });
            console.log(`📡 Action '${action}' triggered in chat ${chat_id}`);
        });

        socket.on("disconnect", async () => {
            try {
                if (socket.data.timer) {
                    clearTimeout(socket.data.timer);
                }

                const { userKey, userId, role } = socket.data;
                if (!userKey || !userId) return;

                onlineUsers.delete(userKey);

                if (role === "therapist") {
                    await Therapist.update(
                        { availability: "Offline" },
                        { where: { id: userId } }
                    );
                }

                broadcastOnlineList();

                console.log("User disconnected:", userKey);
            } catch (err) {
                console.error("Disconnect error:", err);
            }
        });
    });
};

module.exports.getIO = () => {
    if (!ioInstance) {
        throw new Error("Socket.io not initialized");
    }
    return ioInstance;
};
