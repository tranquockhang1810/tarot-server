const mongoose = require("mongoose");

const HoroscopeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    zodiac: { type: String, required: true },
    icon: { type: String, required: true },
    summary: { type: String, required: true },
    love: { type: String, required: true },
    career: { type: String, required: true },
    finance: { type: String, required: true },
    health: { type: String, required: true },
    luckyNumber: { type: Number, required: true },
    luckyColor: {
      name: { type: String, required: true },
      code: { type: String, required: true }
    },
    translations: { type: Map, of: Object }
  },
  { timestamps: true }
);

HoroscopeSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Horoscope", HoroscopeSchema);
