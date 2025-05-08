const appUserFactory = require("../factories/user/appUserFactory");
const adminUserFactory = require("../factories/user/adminUserFactory");
const User = require("../models/user/users.model");
const bcrypt = require("bcryptjs");
const jwtGenerate = require("../utils/JwtGenerate");

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
      console.log("Error creating user:", error);
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

  static async findUserByEmail(email) {
    try {
      const user = await User.findOne({
        email,
        role: "admin",
        status: true,
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

  static async findUserById(id) {
    try {
      const user = await User.findById(id);
      return user;
    } catch (error) {
      return null;
    }
  }

  static async getAllUsers() {
    try {
      const users = await User.find({ role: "user", status: true });
      return users;
    } catch (error) {
      return null;
    }
  }

  static async updateUser(id, role, data) {
    try {
      let user;
      switch (role) {
        case "user":
          user = appUserFactory.updateUser(id, data);
          break;
        case "admin":
          user = adminUserFactory.updateUser(id, data);
          break;
        default:
          throw new Error("Invalid role");
      }
      return user;
    } catch (error) {
      return null;
    }
  }

  static async loginAdmin(email, password) {
    const user = await this.findUserByEmail(email);
    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid email or password");

    const accessToken = jwtGenerate(user);

    return { user, accessToken };
  }

  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  static async getAdminUsers(page = 1, limit = 10, status, email) {
    try {
      const filter = {};
      filter.role = "admin";
      if (status) filter.status = status === "true" ? true : false;
      if (email) filter.email = email;
      const skip = (page - 1) * limit;

      const users = await User.find(filter)
        .select("-__v -password")
        .lean()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const totalUsers = await User.countDocuments(filter);

      return {
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
        users,
      };
    } catch (error) {
      console.error("❌ Error fetching users from DB:", error);
      return null;
    }
  }
}

module.exports = UserService;