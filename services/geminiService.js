const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GEMINI_API_KEY } = require("../config/gemini");

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

class GeminiService {
  static async checkTopicRelevance(topic, question) {
    const prompt = `Hãy kiểm tra xem câu hỏi sau có liên quan đến chủ đề "${topic}" hay không.
    Kiểm tra theo các tiêu chí sau:
    1. Là câu hỏi, có nội dung rõ ràng.
    Trả lời chỉ bằng một từ: "Có" nếu liên quan, "Không" nếu không liên quan.
  
    Chủ đề: ${topic}
    Câu hỏi: ${question}`;
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text().trim().toLowerCase();

      return text === "có";
    } catch (error) {
      console.error("Lỗi khi gọi Gemini API:", error);
      return false;
    }
  }

  static async interpretTarot(topic, question, cards) {
    const cardDescriptions = cards.map(card => card).join("\n");
    const prompt = `
      Người dùng có câu hỏi về chủ đề "${topic}": "${question}".
      Họ đã bốc 3 lá bài Tarot:
      ${cardDescriptions}
      
      Dựa vào ý nghĩa của các lá bài, hãy phân tích và đưa ra câu trả lời chi tiết.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error("❌ Lỗi khi gọi Gemini API:", error);
      return "Xin lỗi, tôi không thể xem bài Tarot lúc này.";
    }
  }

  static async getFollowUpResponse(chatHistory, newQuestion) {
    const prompt = `
      Cuộc trò chuyện về chủ đề "${chatHistory.topic?.name}":
      ${chatHistory?.messages.map(msg => `${msg.senderType === "user" ? "Người dùng" : "AI"}: ${msg.message}`).join("\n")}
      Người dùng vừa nhắn: "${newQuestion}".
      
      Hãy kiểm tra xem câu tin nhắn này có liên quan không. 
      Nếu có, hãy tiếp tục trả lời theo ngữ cảnh của cuộc trò chuyện, chỉ tập trung trả lời câu hỏi, không cần đưa ra kết luận câu hỏi có liên quan hay không.
      Nếu không, hãy trả lời người dùng rằng "Xin lỗi, đoạn chat này chỉ trả lời các câu hỏi liên quan tới câu hỏi ban đầu: **"${chatHistory?.question}"** và chủ đề **"${chatHistory.topic?.name}"**".
      Nếu tin nhắn liên quan về việc cảm ơn AI đã giúp đỡ, hãy trả lời người dùng với ý có thể hỏi thêm thông tin đã xem về tarot.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text().trim();
    } catch (error) {
      console.error("❌ Lỗi khi lấy phản hồi tiếp theo từ Gemini:", error);
      return "Xin lỗi, tôi không thể trả lời lúc này.";
    }
  }

  static async generateHoroscope(birthDate, gender, date) {
    const prompt = `
      Bạn là một chuyên gia chiêm tinh. Hãy tạo thông điệp hằng ngày cho người có ngày sinh ${birthDate} và 
      giới tính ${gender === "male" ? "nam" : "nữ"} vào ngày ${date}.

      1. Xác định cung hoàng đạo từ ngày sinh.
      2. Đưa ra dự đoán cho hôm nay về:
         - Tình cảm
         - Sự nghiệp & Học tập
         - Tài chính
         - Sức khỏe
      3. Chọn 1 con số may mắn từ 1 - 99.
      4. Chọn 1 màu sắc may mắn.

      Trả lời dưới dạng JSON:
      {
        "zodiac": "[Tên cung hoàng đạo]",
        "icon" : [Tên cung hoàng đạo quốc tế theo format, ví dụ zodiac-aries]
        "summary": "[Dự đoán tổng quan]",
        "love": "[Dự đoán tình cảm]",
        "career": "[Dự đoán sự nghiệp & học tập]",
        "finance": "[Dự đoán tài chính]",
        "health": "[Dự đoán sức khỏe]",
        "luckyNumber": [Số may mắn],
        "luckyColor": {
          "name": "[Tên màu sắc]",
          "code": "[Mã màu HEX]"
        }
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      let response = result.response.text().trim();
      response = response.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(response);
    } catch (error) {
      console.error("❌ Lỗi khi gọi Gemini API:", error);
      throw new Error("Không thể tạo horoscope.");
    }
  }

  static async translateText(text, sourceLang, targetLang) {
    const prompt = `Dịch đoạn văn sau từ ${sourceLang} sang ${targetLang}, giữ nguyên cấu trúc JSON:\n\n${text}`;
    try {
      const result = await model.generateContent(prompt);
      let response = result.response.text().trim();
      response = response.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(response);
    } catch (error) {
      console.error("❌ Lỗi khi dịch với Gemini:", error);
      throw new Error("Không thể dịch nội dung.");
    }
  }
}

module.exports = GeminiService;