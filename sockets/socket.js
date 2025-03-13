const socketIo = require("socket.io");
const { 
  handleSendMessage, 
  registerUser, 
  removeUserSocket,
  updateMessagesStatus 
} = require("../controllers/mesage.controller");

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
    socket.on("registerUser", (userID) => {
      registerUser(userID, socket.id, userSockets);
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
  });
};

module.exports = { initSocket };
