const MessageService = require("../services/messageService");

const registerUser = (userID, socketID, userSockets) => {
  userSockets[userID] = socketID;
  console.log(`✅ User ${userID} connected with socket ${socketID}`);
};

const removeUserSocket = (socketID, userSockets) => {
  for (let userID in userSockets) {
    if (userSockets[userID] === socketID) {
      delete userSockets[userID];
      console.log(`❌ User ${userID} disconnected.`);
      break;
    }
  }
};

const handleSendMessage = async (io, socket, userID, chatID, message) => {
  try {
    // ✅ Gọi service để lưu tin nhắn user
    if (!userID) return socket.emit("errorMessage", {
      code: 400,
      message: "User not found"
    })
    if (!chatID) return socket.emit("errorMessage", {
      code: 400,
      message: "Chat not found"
    })
    if (!message) return socket.emit("errorMessage", {
      code: 400,
      message: "Message not found"
    })

    const newMessage = await MessageService.createMessage(chatID, userID, "user", message);

    // ✅ Gửi tin nhắn user lên UI
    io.to(socket.id).emit("newMessage", newMessage);

    // Tin nhắn loading của AI
    io.to(socket.id).emit("newMessage", {
      _id: "loading",
      chat: chatID,
      sender: null,
      senderType: "ai",
      message: "AI đang trả lời...",
      createdAt: new Date().toISOString(),
    });

    // ✅ Gọi API AI và lưu tin nhắn AI
    const aiMessage = await MessageService.getAIResponseAndSave(chatID, message);

    // ✅ Gửi tin nhắn AI đến UI
    io.to(socket.id).emit("newMessage", aiMessage);
  } catch (error) {
    console.error("❌ Error sending message:", error);
  }
};

const updateMessagesStatus = async (chatId) => {
  try {
    await MessageService.updateMessagesStatus(chatId);
  } catch (error) {
    console.error("❌ Error updating message status:", error);
  }
}

module.exports = {
  registerUser,
  removeUserSocket,
  handleSendMessage,
  updateMessagesStatus
};
