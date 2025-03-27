const cron = require("node-cron");
const { updateOldChats } = require("../controllers/chat.controller");
const { deleteOldHoroscopes } = require("../controllers/horoscope.controller");

// Chạy cron job vào 00:00 hàng ngày
cron.schedule("0 0 * * *", async () => {
  await updateOldChats();
  await deleteOldHoroscopes();
}, {
  timezone: "Asia/Ho_Chi_Minh"
});
