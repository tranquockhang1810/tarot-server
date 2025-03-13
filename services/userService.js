const appUserFactory = require("../factories/user/appUserFactory");
const adminUserFactory = require("../factories/user/adminUserFactory");
const User = require("../models/user/users.model");

class UserService {
  static async createUser(role, data) {
    try {
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
    } catch (error) {
      return null;
    }
  }

  static async findUserByPhone(phone) {
    try {
      const user = await User.findOne({
        phone,
        role: "user",
        status: true,
        type: "phone"
      });
      return user;
    } catch (error) {
      return null;
    }
  }


  static async findUserByFacebookId(id) {
    try {
      const user = await User.findOne({
        id,
        role: "user",
        status: true,
        type: "facebook"
      });
      return user;
    } catch (error) {
      return null;
    }
  }
}

module.exports = UserService;