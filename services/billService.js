const { Bill } = require("../models/bill/bill.model");
const mongoose = require("mongoose");

class BillService {
  static async createBill(data) {
    try {
      const bill = new Bill(data);
      return await bill.save();
    } catch (error) {
      console.error("❌ Error saving bill to DB:", error);
      return null;
    }
  }

  static async updateBill(id, data, type) {
    try {
      return await Bill.findOneAndUpdate({ _id: id, type }, data, { new: true })
        .populate('user', 'name point role')
        .populate('topic', 'name image')
        .populate('package', 'point price description');
    } catch (error) {
      console.error("❌ Error updating bill in DB:", error);
      return null;
    }
  }

  static async getBillList(type, user, page = 1, limit = 10) {
    try {
      const filter = {};
      if (type) filter.type = type;
      if (user) filter.user = new mongoose.Types.ObjectId(user);

      const skip = (page - 1) * limit;

      const bills = await Bill.find(filter)
        .select('-__v')
        .populate('user', 'name point role')
        .populate('topic', 'name image')
        .populate('package', 'point price description')
        .lean()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const totalBills = await Bill.countDocuments(filter);

      return {
        total: totalBills,
        page,
        limit,
        totalPages: Math.ceil(totalBills / limit),
        bills,
      };
    } catch (error) {
      console.error("❌ Error fetching bills from DB:", error);
      return null;
    }
  }
}

module.exports = BillService;