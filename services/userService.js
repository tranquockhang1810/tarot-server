const appUserFactory = require("../factories/user/appUserFactory");
const adminUserFactory = require("../factories/user/adminUserFactory");
const User = require("../models/user/users.model");

class UserService {
  static async createUser(role, data) {
    let user;
    switch (role) {
      case "user":
        user = appUserFactory.createUser(data);
        break;
      case "admin":
        user = adminUserFactory.createUser(data);
        break;
      default:
        throw new Error("Invalid role");
    }
    await user.save();
    return user;
  }

  static async findUserByPhone(phone) {
    const user = await User.findOne({ 
      phone, 
      role: "user",
      status: true 
    });
    return user;
  }
}

module.exports = UserService;