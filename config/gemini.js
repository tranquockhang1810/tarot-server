require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("Chưa cấu hình API Key của Gemini AI");
}

module.exports = {
  GEMINI_API_KEY
};
