const HoroscopeModel = require("../models/horoscope/horoscope.model");
const GeminiService = require("./geminiService");
const TranslationService = require("./translationService");
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

  static async getUserHoroscopes(userId, language = "vi") {
    try {
      const threeDaysAgo = moment().tz("Asia/Ho_Chi_Minh").startOf("day").subtract(3, "days").format("YYYY-MM-DD");
      const formattedOldDate = threeDaysAgo;

      // Tìm tất cả horoscope trong vòng 3 ngày
      const horoscopes = await HoroscopeModel.find({
        userId,
        date: { $gte: formattedOldDate }
      }).sort({ date: -1 });

      // Nếu không có dữ liệu, trả về mảng rỗng
      if (!horoscopes.length) return [];

      // Nếu là tiếng Việt, trả dữ liệu gốc
      if (language === "vi") {
        return horoscopes.map(horoscope => ({ ...horoscope._doc, translations: undefined }));
      }

      // Nếu là ngôn ngữ khác, kiểm tra bản dịch hoặc gọi AI dịch
      const translatedHoroscopes = await Promise.all(
        horoscopes.map(async (horoscope) => {
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
}

module.exports = HoroscopeService;
