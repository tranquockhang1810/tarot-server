const HoroscopeModel = require("../models/horoscope/horoscope.model");
const GeminiService = require("./geminiService");
const TranslationService = require("./translationService");
const UserService = require("./userService");
const NotificationService = require("./notificationService");
const moment = require("moment-timezone");

class HoroscopeService {
  static async getHoroscope(userId, birthDate, gender, language, date) {
    try {
      const formattedDate = date // YYYY-MM-DD

      let horoscope = await HoroscopeModel.findOne({ userId, date: formattedDate });

      if (!horoscope) {
        // Gọi AI để tạo horoscope mới
        const newHoroscope = await GeminiService.generateHoroscope(birthDate, gender, formattedDate);
        horoscope = await HoroscopeModel.create({ userId, date: formattedDate, ...newHoroscope });
      }

      // Nếu là tiếng Việt, trả luôn dữ liệu gốc
      if (language === "vi") return { ...horoscope._doc, translations: undefined };

      // Kiểm tra bản dịch có sẵn
      if (horoscope.translations?.get(language)) {
        return horoscope.translations.get(language);
      }

      // Nếu chưa có bản dịch, gọi AI để dịch
      const translatedHoroscope = await TranslationService.translate(JSON.stringify(horoscope), "vi", language);

      // Lưu bản dịch vào DB
      await HoroscopeModel.updateOne(
        { userId, date: formattedDate },
        { $set: { [`translations.${language}`]: translatedHoroscope } }
      );

      return translatedHoroscope;
    } catch (error) {
      console.error("❌ Lỗi trong HoroscopeService:", error);
      throw new Error("Không thể lấy horoscope.");
    }
  }

  static async deleteOldHoroscopes() {
    const threeDaysAgo = moment().tz("Asia/Ho_Chi_Minh").startOf("day").subtract(3, "days").format("YYYY-MM-DD");
    const formattedOldDate = threeDaysAgo;

    const deleteResult = await HoroscopeModel.deleteMany({ date: { $lte: formattedOldDate } });
    console.log(`✅Đã xóa ${deleteResult.deletedCount} horoscope cũ hơn ${formattedOldDate}`);
  }

  static async getUserHoroscopes(userId, birthDate, gender, language = "vi") {
    try {
      const today = moment().tz("Asia/Ho_Chi_Minh").startOf("day");
      const datesToCheck = [
        today.clone().format("YYYY-MM-DD"),
        today.clone().subtract(1, "days").format("YYYY-MM-DD"),
        today.clone().subtract(2, "days").format("YYYY-MM-DD"),
      ];

      // Tìm các horoscope đã có trong DB
      let existingHoroscopes = await HoroscopeModel.find({
        userId,
        date: { $in: datesToCheck }
      }).sort({ date: -1 });

      // Chuyển danh sách thành Set để kiểm tra ngày nào còn thiếu
      const existingDates = new Set(existingHoroscopes.map(h => h.date));

      // Lọc ra các ngày chưa có dữ liệu
      const missingDates = datesToCheck.filter(date => !existingDates.has(date));

      if (missingDates.length > 0) {
        console.log(`🔍 Thiếu horoscope cho các ngày: ${missingDates.join(", ")} → Tiến hành tạo mới...`);

        const newHoroscopes = await Promise.all(
          missingDates.map(async (date) => {
            const newHoroscope = await GeminiService.generateHoroscope(birthDate, gender, date);
            return { userId, date, ...newHoroscope };
          })
        );

        // Lưu vào DB
        await HoroscopeModel.insertMany(newHoroscopes);

        // Sau khi insert, cần lấy lại danh sách đầy đủ từ DB
        existingHoroscopes = await HoroscopeModel.find({
          userId,
          date: { $in: datesToCheck }
        }).sort({ date: -1 }); // Sắp xếp theo ngày mới nhất
      }

      // Nếu là tiếng Việt, trả về danh sách gốc
      if (language === "vi") {
        return existingHoroscopes.map(horoscope => ({ ...horoscope._doc, translations: undefined }));
      }

      // Nếu là ngôn ngữ khác, kiểm tra bản dịch hoặc gọi AI dịch
      const translatedHoroscopes = await Promise.all(
        existingHoroscopes.map(async (horoscope) => {
          if (horoscope.translations?.get(language)) {
            return horoscope.translations.get(language);
          }

          // Nếu chưa có bản dịch, gọi AI để dịch
          const translatedHoroscope = await TranslationService.translate(JSON.stringify(horoscope), "vi", language);

          // Lưu bản dịch vào DB
          await HoroscopeModel.updateOne(
            { _id: horoscope._id },
            { $set: { [`translations.${language}`]: translatedHoroscope } }
          );

          return translatedHoroscope;
        })
      );

      return translatedHoroscopes;
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách horoscope:", error);
      throw new Error("Không thể lấy danh sách horoscope.");
    }
  }

  static async metionUsersCheckHoroscope() {
    try {
      const today = moment().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD");
  
      const users = await UserService.getAllUsers();
      if (!users.length) return console.log("❌ Không có user để gửi notification.");
  
      const notifications = users.map(user => ({
        user: user._id,
        title: "🔮 Horoscope hôm nay đã sẵn sàng!",
        description: `Xin chào ${user.name || "bạn"}! Thông điệp hôm nay đang chờ bạn khám phá 🌟`,
      }));
  
      await Promise.all(
        notifications.map(notification => NotificationService.createNotification(notification))
      );
  
      console.log(`✅ Đã gửi notification xem horoscope cho ${users.length} người dùng (${today})`);
    } catch (error) {
      console.error("❌ Lỗi khi gửi notification horoscope:", error);
      throw new Error("Không thể gửi notification horoscope.");
    }
  }

}

module.exports = HoroscopeService;
