const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BillSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["package", "point"], required: true },
}, { discriminatorKey: "type", timestamps: true });

const Bill = mongoose.model('Bill', BillSchema);

const PackageBill = Bill.discriminator(
  "package",
  new mongoose.Schema({
    package: { type: mongoose.Schema.Types.ObjectId, ref: "Package", required: true },
    totalPrice: { type: Number, required: true },
    status: { type: Boolean, default: false },
  })
);

const PointBill = Bill.discriminator(
  "point",
  new mongoose.Schema({
    point: { type: Number, required: true },
    action: { type: Boolean, required: true },
    topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
  })
);

module.exports = {
  Bill,
  PackageBill,
  PointBill
};