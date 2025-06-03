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

  static async askFollowUpQuestions(topic, question, user) {
    const prompt = `
Người dùng có câu hỏi về chủ đề "${topic}": "${question}".

Hãy đóng vai Reader Tarot và đặt ra 3 câu hỏi phụ, ngắn gọn, nhằm hiểu rõ hơn về hoàn cảnh hoặc cảm xúc hiện tại của người dùng.

Thông tin người dùng:
- Tên: ${user.name}
- Giới tính: ${user.gender}
- Ngày sinh: ${user.birthDate}
- Cung hoàng đạo: ${user.zodiac}

Yêu cầu:
- Tự xưng là "em", người dùng là "anh" hoặc "chị" tùy vào giới tính.
- Nên có 1 phần chào hỏi và mong muốn hỏi thêm để hiểu rõ về người dùng hơn.
- Mỗi câu nằm trên một dòng riêng biệt.
- Không cần đánh số hoặc giải thích thêm.
`;

    try {
      const result = await model.generateContent(prompt);
      const raw = result.response.text().trim();
      console.log("raw questions:", raw);
      
      const questions = raw
        .split('\n')
        .map(q => q.trim())
        .filter(q => q.length > 0);

      return questions;
    } catch (error) {
      console.error("❌ Lỗi khi hỏi 3 câu hỏi:", error);
      return [
        "Bạn đang cảm thấy thế nào trong tình huống này?",
        "Bạn mong muốn điều gì sẽ thay đổi?",
        "Có điều gì khiến bạn đang lo lắng nhất không?"
      ];
    }
  }

  static async validateSingleAnswer(topic, mainQuestion, followUpQuestion, userAnswer) {
    const prompt = `
Chủ đề: ${topic}
Câu hỏi chính: "${mainQuestion}"
Câu hỏi phụ: "${followUpQuestion}"
Người dùng trả lời: "${userAnswer}"

Câu trả lời này có trả lời đúng và liên quan đến câu hỏi phụ không?
Trả lời "yes" nếu hợp lệ hoặc người dùng không quá chắc chắn, "no" nếu không.
`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().toLowerCase();
      return text.includes('yes');
    } catch (error) {
      console.error("❌ validateSingleAnswer error:", error);
      return false;
    }
  }

  static async interpretTarot(topic, question, cards, questions, answers, user) {
    const cardDescriptions = cards.join("\n");
    const questionsInfo = questions.map((quest, i) => `Câu hỏi ${i + 1}: ${quest}`).join("\n");
    const answersInfo = answers.map((ans, i) => `Câu trả lời ${i + 1}: ${ans}`).join("\n");

    const prompt = `
    Bạn là một Reader Tarot chuyên nghiệp.

    Thông tin người dùng:
    - Tên: ${user.name}
    - Giới tính: ${user.gender}
    - Ngày sinh: ${user.birthDate}
    - Cung hoàng đạo: ${user.zodiac}

    Người dùng có câu hỏi về chủ đề **"${topic}"**: "${question}".

    Họ đã bốc 3 lá bài:
    ${cardDescriptions}

    Bạn đã hỏi người dùng để hiểu rõ hơn:
    ${questionsInfo}

    Họ đã trả lời như sau:
    ${answersInfo}

    → Dựa vào ý nghĩa của các lá bài và thông tin đã thu thập, hãy đưa ra một phân tích chi tiết với văn phong của một cuộc trò chuyện ấm áp,
    luôn xưng hô với người dùng là người lớn tuổi hơn.  
    Giải thích rõ ý nghĩa từng lá bài, liên hệ với cảm xúc và câu hỏi của người dùng.  
    Kết thúc bằng một lời khuyên nhẹ nhàng, không phán xét.
  `;

    console.log("🔮 Đang phân tích bài Tarot với prompt:", prompt);


    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text().trim();
    } catch (error) {
      console.error("❌ Lỗi khi xem bài Tarot:", error);
      return "Xin lỗi, tôi không thể xem bài Tarot lúc này.";
    }
  }

  static async getFollowUpResponse(chatHistory, newQuestion) {
    const prompt = `
    Cuộc trò chuyện Tarot với chủ đề **"${chatHistory.topic?.name}"** và câu hỏi ban đầu là: "${chatHistory?.question}".

    Lịch sử trò chuyện:
    ${chatHistory?.messages.map(msg => `${msg.senderType === "user" ? "Người dùng" : "Reader"}: ${msg.message}`).join("\n")}

    Người dùng hỏi thêm: "${newQuestion}"
    - Hãy kiểm tra xem câu hỏi này có liên quan tới chủ đề và câu hỏi ban đầu hay không. Chỉ trả lời những câu hỏi có liên quan đến
    Tarot như nội dung các lá bài như một Reader Tarot. Không làm các việc khác như giải thích, lên kế hoạc hay đưa ra lời khuyên không liên quan.
    - Nếu không liên quan, hãy từ chối lịch sự và giải thích rằng bạn chỉ có thể trả lời các câu hỏi liên quan đến Tarot, trả lời ngắn gọn.
    - Nếu người dùng chỉ cảm ơn hoặc gửi lời chào, hãy đáp lại lịch sự và mời họ hỏi thêm nếu cần.
    - Tự xưng là "em", người dùng là "anh" hoặc "chị" tùy vào giới tính.
  `;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text().trim();
    } catch (error) {
      console.error("❌ Lỗi phản hồi tiếp theo từ Gemini:", error);
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

  static async getZodiac(birthDate) {
    const prompt = `
      Hãy trả về cung hoàng đạo của người có ngày sinh ${birthDate}.
      Trả lời dưới dạng chuỗi, chỉ 1 chữ duy nhất theo format: tên quốc tế,viết thường, ví dụ: libra
    `;

    try {
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error("❌ Lỗi khi gọi Gemini API:", error);
      throw new Error("Không thể tạo horoscope.");
    }
  }
}

module.exports = GeminiService;