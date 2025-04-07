const cron = require("node-cron");
const { updateOldChats, checkUsersChatValid } = require("../controllers/chat.controller");
const { deleteOldHoroscopes, metionUsersCheckHoroscope } = require("../controllers/horoscope.controller");

// Chạy cron job vào 00:00 hàng ngày
cron.schedule("00 00 * * *", async () => {
  await updateOldChats();
  await deleteOldHoroscopes();
}, {
  timezone: "Asia/Ho_Chi_Minh"
});

cron.schedule("00 08 * * *", async () => {
  await checkUsersChatValid();
}, {
  timezone: "Asia/Ho_Chi_Minh"
});

cron.schedule("18 02 * * *", async () => {
  await metionUsersCheckHoroscope();
}, {
  timezone: "Asia/Ho_Chi_Minh"
});
