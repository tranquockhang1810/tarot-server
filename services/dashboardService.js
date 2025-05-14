const { PackageBill } = require("../models/bill/bill.model");
const Chat = require("../models/chat/chat.model");
const User = require("../models/user/users.model");
const moment = require("moment");

class DashboardService {
  static async getBillChart() {
    // Tính mốc thời gian
    const now = moment().startOf("month");
    const start = moment(now).subtract(12, "months");

    // Lấy dữ liệu thống kê từ MongoDB
    const data = await PackageBill.aggregate([
      {
        $match: {
          status: true,
          createdAt: {
            $gte: start.toDate(),
            $lte: now.endOf("month").toDate()
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          total: { $sum: "$totalPrice" }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);

    // Tạo danh sách 12 tháng
    const labels = [];
    const statics = [];

    for (let i = 0; i <= 12; i++) {
      const m = moment(start).add(i, "months");
      const label = m.format("MM/YYYY");
      labels.push(label);

      // Tìm doanh thu tương ứng trong kết quả aggregate
      const found = data.find(
        (d) => d._id.month === m.month() + 1 && d._id.year === m.year()
      );
      statics.push(found ? found.total : 0);
    }

    return { labels, statics };
  }

  static async getTopicChart() {
    // Đếm số đoạn chat theo topic
    const data = await Chat.aggregate([
      {
        $group: {
          _id: "$topic",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "topics",
          localField: "_id",
          foreignField: "_id",
          as: "topicInfo"
        }
      },
      { $unwind: "$topicInfo" },
      {
        $project: {
          _id: 0,
          name: "$topicInfo.name",
          count: 1
        }
      },
      {
        $sort: { count: -1 } // Sắp xếp giảm dần theo số lượt chat
      }
    ]);

    const labels = data.map(item => item.name);
    const statics = data.map(item => item.count);

    return { labels, statics };
  }

  static async getUserChart() {
    const now = moment();

    // Lấy người dùng có birthDate (tức là app user)
    const data = await User.aggregate([
      {
        $match: {
          birthDate: { $exists: true }
        }
      },
      {
        $project: {
          yearOfBirth: { $year: "$birthDate" },
          age: { $subtract: [now.year(), { $year: "$birthDate" }] }
        }
      },
      {
        $group: {
          _id: "$yearOfBirth",
          count: { $sum: 1 },
          totalAge: { $sum: "$age" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const labels = data.map(item => item._id.toString());
    const statics = data.map(item => item.count);

    // Tính độ tuổi trung bình
    const totalUser = data.reduce((sum, d) => sum + d.count, 0);
    const totalAge = data.reduce((sum, d) => sum + d.totalAge, 0);
    const avrAge = totalUser ? Math.round(totalAge / totalUser) : 0;

    return { labels, statics, avrAge };
  }
}

module.exports = DashboardService;
