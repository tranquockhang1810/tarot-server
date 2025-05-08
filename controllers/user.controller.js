const { validateLength, validateBirthDate, validateMinLength } = require("../utils/ValidateModel");
const { convertToInternational } = require("../utils/PhoneConvert");
const jwtGenerate = require("../utils/JwtGenerate");
const admin = require("../config/firebase");
const UserService = require("../services/userService");
const GeminiService = require("../services/geminiService");
const axios = require("axios");
const UploadService = require("../services/uploadService");

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

const verifyFacebookToken = async (accessToken) => {
  const appAccessToken = `${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`;
  const url = `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${appAccessToken}`;

  const response = await axios.get(url);
  return response.data;
};

const loginByOtp = async (req, res, next) => {
  const { idToken } = req.body;

  if (!idToken) {
    return next({ status: 400, message: "ID Token is required" });
  }

  try {
    // 1️⃣ Xác thực ID Token từ Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (!decodedToken) {
      return next({ status: 400, message: "Invalid OTP" });
    }

    const phone = decodedToken.phone_number;

    // 2️⃣ Kiểm tra user trong MongoDB
    let user = await UserService.findUserByPhone(phone);

    if (!user) {
      // 3️⃣ Nếu user chưa có return
      return res.status(200).json({
        code: 200,
        message: "OTP verified successfully",
      });
    }

    // 4️⃣ Tạo JWT Token cho user
    const accessToken = jwtGenerate(user);

    return res.status(200).json({
      code: 200,
      message: "Login successful",
      data: {
        accessToken,
        user: { ...user._doc, __v: undefined },
      },
    });

  } catch (error) {
    console.error("OTP Verification Error:", error);
    return next({ status: 400, message: "Invalid or expired OTP" });
  }
};

const register = async (req, res, next) => {
  try {
    const { id, name, phone, birthDate, gender, type } = req.body;
    let avatar = "";

    if (!name || validateMinLength(name, 3) === false) return next({ status: 400, message: "Name should be at least 3 characters" });
    if (type === "phone" && (!phone || validateLength(phone, 10) === false)) return next({ status: 400, message: "Phone should be exactly 10 characters" });
    if (!birthDate || !validateBirthDate(new Date(birthDate))) return next({ status: 400, message: "Birth date should be in the past." });
    if (!["male", "female"].includes(gender)) return next({ status: 400, message: "Gender should be 'male' or 'female'" });
    if (!["phone", "facebook"].includes(type)) return next({ status: 400, message: "Type should be 'phone' or 'facebook'" });
    if (type === "facebook" && (!id || id === "")) return next({ status: 400, message: "Missing facebook id" });

    if (type === "phone") {
      let existUser = await UserService.findUserByPhone(phone);
      if (existUser) return next({ status: 400, message: "Phone number already exists" });
    }

    if (type === "facebook") {
      let existUser = await UserService.findUserByFacebookId(id);
      if (existUser) return next({ status: 400, message: "Facebook id already exists" });
    }

    const zodiac = await GeminiService.getZodiac(birthDate);

    if (!zodiac) return next({ status: 400, message: "Birth date is not valid" });

    const user = await UserService.createUser("user", {
      name,
      phone: phone && convertToInternational(phone),
      birthDate,
      gender,
      avatar,
      type,
      zodiac
    });
    user.id = type === "facebook" ? id : user._id;
    await user.save();

    const accessToken = jwtGenerate(user);

    return res.status(201).json({
      code: 201,
      message: "Register successful",
      data: {
        accessToken,
        user: { ...user._doc, __v: undefined },
      },
    });
  } catch (error) {
    next({ status: 500, message: error?.message });
  }
};

const loginFacebook = async (req, res, next) => {
  const { accessToken } = req.body;
  if (!accessToken) return next({ status: 400, message: "Missing Facebook's access token" });

  try {
    // Xác thực token với Facebook
    const fbData = await verifyFacebookToken(accessToken);

    if (!fbData.data.is_valid || fbData.data.app_id !== FACEBOOK_APP_ID) {
      return next({ status: 401, message: "Invalid Facebook token" });
    }

    //Lấy thông tin user
    const fbUser = await axios.get(`https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name`);

    let user = await UserService.findUserByFacebookId(fbUser.data.id);
    if (!user) {
      return res.status(200).json({
        code: 200,
        message: "User needs to register first",
        data: {
          registerInfo: {
            name: fbUser.data.name,
            id: fbUser.data.id
          }
        }
      });
    }

    // Tạo token cho ứng dụng của bạn
    const appAccessToken = jwtGenerate(user);

    return res.status(200).json({
      code: 200,
      message: "Login successful",
      data: {
        accessToken: appAccessToken,
        user: { ...user._doc, __v: undefined },
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return next({ status: 400, message: "Error logging in with Facebook" });
  }
};

const updateUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { name, birthDate, gender } = req.body;
    let avatarPath = "";

    // Kiểm tra dữ liệu đầu vào
    if (!name || validateMinLength(name, 3) === false) return next({ status: 400, message: "Name should be at least 3 characters" });
    if (!birthDate || !validateBirthDate(new Date(birthDate))) return next({ status: 400, message: "Birth date should be in the past." });
    if (!["male", "female"].includes(gender)) return next({ status: 400, message: "Gender should be 'male' or 'female'" });

    // Kiểm tra user có tồn tại không
    const user = await UserService.findUserById(userId);
    if (!user) return next({ status: 404, message: "User not found" });

    // Xử lý avatar nếu có file tải lên
    if (req.file) {
      avatarPath = await UploadService.uploadToCloudinary(req.file.buffer);
    }

    // Lấy cung hoàng đạo từ ngày sinh
    const zodiac = await GeminiService.getZodiac(birthDate);
    if (!zodiac) return next({ status: 400, message: "Birth date is not valid" });

    // Cập nhật user trong DB
    const updatedUser = await UserService.updateUser(userId, role, {
      name,
      avatar: avatarPath || user.avatar,
      birthDate,
      gender,
      zodiac
    });

    return res.status(200).json({
      code: 200,
      message: "Update user successful",
      data: {
        ...updatedUser._doc, __v: undefined
      },
    });

  } catch (error) {
    console.error("❌ Error updating user:", error);
    next({ status: 500, message: error?.message });
  }
};

const getUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await UserService.findUserById(userId);
    if (!user) return next({ status: 404, message: "User not found" });
    return res.status(200).json({
      code: 200,
      message: "Get user successful",
      data: { ...user._doc, __v: undefined }
    });
  } catch (error) {
    console.error("❌ Error getting user:", error);
    next({ status: 500, message: error?.message });
  }
};

const addNewAdmin = async (req, res, next) => {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password) return next({ status: 400, message: "Email and password are required" });
    if (!name || validateMinLength(name, 3) === false) return next({ status: 400, message: "Name should be at least 3 characters" });
    if (!phone || validateLength(phone, 10) === false) return next({ status: 400, message: "Phone should be exactly 10 characters" });
    if (validateMinLength(password, 6) === false) return next({ status: 400, message: "Password should be at least 6 characters" });

    const hashedPassword = await UserService.hashPassword(password);

    const user = await UserService.createUser("admin", { email, password: hashedPassword, name, phone });
    return res.status(201).json({
      code: 201,
      message: "Admin created successfully",
      data: { ...user._doc, __v: undefined, password: undefined },
    });
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    next({ status: 500, message: error?.message });
  }
};

const loginAdmin = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next({ status: 400, message: "Email and password are required" });

  try {
    const { user, accessToken } = await UserService.loginAdmin(email, password);
    if (!user) return next({ status: 401, message: "Invalid email or password" });

    return res.status(200).json({
      code: 200,
      message: "Login successful",
      data: {
        accessToken,
        user: { ...user?._doc, __v: undefined, password: undefined },
      },
    });
  } catch (error) {
    console.error("❌ Error logging in admin:", error);
    next({ status: 500, message: error?.message });
  }
}

const getAdminUsers = async (req, res, next) => {
  try {
    const { page, limit, status, email } = req.query;
    const data = await UserService.getAdminUsers(parseInt(page, 10), parseInt(limit, 10), status, email);
    return res.status(200).json({
      code: 200,
      message: "Get users successful",
      data: data.users,
      paging: {
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages
      }
    });
  } catch (error) {
    console.error("❌ Error getting users:", error);
    next({ status: 500, message: error?.message });
  }
};

const activeAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await UserService.findUserById(id);
    if (!user) return next({ status: 404, message: "User not found" });
    if (user.role !== "admin") return next({ status: 400, message: "User is not admin" });

    user.status = !user.status;
    await user.save();

    return res.status(200).json({
      code: 200,
      message: "Update user successful",
      data: { ...user._doc, __v: undefined }
    });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    next({ status: 500, message: error?.message });
  }
};

module.exports = {
  loginByOtp,
  register,
  loginFacebook,
  updateUser,
  getUser,
  addNewAdmin,
  loginAdmin,
  getAdminUsers,
  activeAdmin
}