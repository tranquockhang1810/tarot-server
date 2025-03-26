const GeminiService = require("./geminiService");

class TranslationService {
  static async translate(text, sourceLang, targetLang) {
    try {
      return await GeminiService.translateText(text, sourceLang, targetLang);
    } catch (error) {
      console.error("❌ Lỗi khi dịch:", error);
      throw new Error("Không thể dịch thông điệp.");
    }
  }
}

module.exports = TranslationService;
