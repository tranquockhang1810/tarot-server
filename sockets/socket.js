const socketIo = require("socket.io");
const {
  handleSendMessage,
  registerUser,
  removeUserSocket,
  updateMessagesStatus
} = require("../controllers/mesage.controller");
const { checkUnreadNotification, seenNotification } = require("../controllers/notification.controller");

let io;
const userSockets = {}; // Lưu socket ID của user

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    }
  });

  io.on("connection", (socket) => {
    console.log("🔥 Client connected:", socket.id);

    // ✅ Đăng ký user khi kết nối
    socket.on("registerUser", async (data) => {
      const { userId, fcmToken } = data;
      await registerUser(userId, socket.id, userSockets, fcmToken);
    });

    // ✅ Xử lý tin nhắn khi user gửi
    socket.on("sendMessage", async ({ userID, chatID, message }) => {
      await handleSendMessage(io, socket, userID, chatID, message);
    });

    // ✅ Xử lý khi user xem tin nhắn
    socket.on("seenMessages", async ({ chatId }) => {
      await updateMessagesStatus(chatId);
    });

    // ✅ Khi user ngắt kết nối
    socket.on("disconnect", () => {
      removeUserSocket(socket.id, userSockets);
    });

    // ✅ Khi user xem thông báo
    socket.on("seenNotification", async ({ userId, id }) => {
      console.log("User seen notification:", userId, id);
      await seenNotification({ userId, id });
      socket.emit("seenNotificationDone");
    })

    socket.on("checkUnreadNotification", async ({ userId }) => {
      if (!userId) return;
      console.log("Checking unread notifications for user:", userId);
      
      const unreadNotification = await checkUnreadNotification(userId);
      socket.emit("unreadNotification", unreadNotification);
    })
  });
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  if (!userSockets) throw new Error("User sockets not initialized!");
  return { io, userSockets };
};

module.exports = { initSocket, getIO };
