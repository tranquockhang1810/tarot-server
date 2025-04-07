const MessageService = require("../services/messageService");
const UserService = require("../services/userService");

const registerUser = async (userID, socketID, userSockets, fcmToken) => {
  userSockets[userID] = socketID;
  await UserService.updateUser(userID, "user", { fcmToken });
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
    io.to(socket.id).emit("newMessage", newMessage);

    const loadingMessage = {
      _id: "loading",
      chat: chatID,
      senderType: "ai",
      message: "AI đang trả lời...",
      createdAt: new Date().toISOString(),
    };
    io.to(socket.id).emit("newMessage", loadingMessage);

    const aiMessage = await MessageService.getAIResponseAndSave(chatID, message);

    io.to(socket.id).emit("replaceMessage", {
      oldId: "loading",
      newMessage: aiMessage,
    });
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
