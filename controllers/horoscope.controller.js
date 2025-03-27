const UserService = require("../services/userService");
const HoroscopeService = require("../services/horoscopeService");
const moment = require("moment-timezone");

const getDailyHoroscope = async (req, res, next) => {
  try {
    const { language, date } = req.query;
    const userId = req.user.id;

    if (!["vi", "en"].includes(language)) {
      return next({ status: 400, message: "Language must be 'en' or 'vi'" });
    }

    if (!date || isNaN(new Date(date).getTime())) {
      return next({ status: 400, message: "Date should be in 'YYYY-MM-DD' format." });
    }

    const user = await UserService.findUserById(userId);
    if (!user) return next({ status: 404, message: "User not found" });

    const horoscope = await HoroscopeService.getHoroscope(userId, user.birthDate, user.gender, language, date);

    return res.status(200).json({
      code: 200,
      message: "Horoscope retrieved successfully",
      data: horoscope
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy horoscope:", error);
    next({ status: 500, message: error.message });
  }
};

const deleteOldHoroscopes = async (req, res, next) => {
  try {
    await HoroscopeService.deleteOldHoroscopes();
  } catch (error) {
    console.error("❌ Lỗi khi xóa horoscope cũ:", error);
    next({ status: 500, message: error.message });
  }
}

const getUserHoroscopes = async (req, res, next) => {
  try {
    const { language } = req.query;
    const userId = req.user.id;
    
    if (language !== "en" && language !== "vi") {
      return next({ status: 400, message: "Language must be 'en' or 'vi'" });
    }

    const user = await UserService.findUserById(userId);
    if (!user) return next({ status: 404, message: "User not found" });

    const horoscopes = await HoroscopeService.getUserHoroscopes(userId, user.birthDate, user.gender, language);

    return res.status(200).json({
      code: 200,
      message: "Danh sách horoscope đã được lấy thành công",
      data: horoscopes // Luôn trả về mảng, có thể rỗng
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách horoscope:", error);
    next({ status: 500, message: error.message });
  }
}

module.exports = { 
  getDailyHoroscope,
  deleteOldHoroscopes,
  getUserHoroscopes
};