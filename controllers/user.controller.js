const { validateLength, validateEmail, validateBirthDate, validateMinLength } = require("../utils/ValidateModel");
const { convertToInternational } = require("../utils/PhoneConvert");
const admin = require("../config/firebase");
const UserService = require("../services/userService");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage }).single("avatar");

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
    console.log("Phone number:", phone);


    // 2️⃣ Kiểm tra user trong MongoDB
    let user = await UserService.findUserByPhone(phone);

    if (!user) {
      // 3️⃣ Nếu user chưa có return
      return res.status(200).json({
        status: 200,
        message: "OTP verified successfully",
      });
    }

    // 4️⃣ Tạo JWT Token cho user
    const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "30d",
    });

    return res.status(200).json({
      code: 200,
      message: "Login successful",
      data: {
        accessToken,
        user: { ...user._doc, _id: undefined, __v: undefined },
      },
    });

  } catch (error) {
    console.error("OTP Verification Error:", error);
    return next({ status: 400, message: "Invalid or expired OTP" });
  }
};

// const register = async (req, res, next) => {
//   upload(req, res, async (err) => {
//     try {
//       if (err) {
//         return next({ status: 400, message: "File upload failed" });
//       }

//       const { name, phone, birthDate, gender, type } = req.body;
//       let avatar = null;

//       // 1️⃣ Validate dữ liệu
//       if (!req.file) return next({ status: 400, message: "Avatar is required" });
//       if (!name || validateMinLength(name, 3) === false) return next({ status: 400, message: "Name should be at least 3 characters" });
//       if (!phone || validateLength(phone, 10) === false) return next({ status: 400, message: "Phone should be exactly 10 characters" });
//       if (!birthDate || !validateBirthDate(new Date(birthDate))) return next({ status: 400, message: "Birth date should be in the past." });
//       if (!["male", "female"].includes(gender)) return next({ status: 400, message: "Gender should be 'male' or 'female'" });
//       if (!["phone", "facebook"].includes(type)) return next({ status: 400, message: "Type should be 'phone' or 'facebook'" });

//       // 2️⃣ Kiểm tra user đã tồn tại chưa
//       let existUser = await UserService.findUserByPhone(phone);
//       if (existUser) return next({ status: 400, message: "Phone number already exists" });

//       // 3️⃣ Upload hình lên Cloudinary
//       const uploadResult = await new Promise((resolve, reject) => {
//         const stream = cloudinary.uploader.upload_stream(
//           { folder: "tarot-app" },
//           (error, result) => {
//             if (error) reject(error);
//             else resolve(result);
//           }
//         );
//         stream.end(req.file.buffer);
//       });

//       avatar = uploadResult.secure_url;

//       // 4️⃣ Tạo user trong MongoDB
//       const user = await UserService.createUser("user", {
//         name,
//         phone: convertToInternational(phone),
//         birthDate,
//         gender,
//         avatar,
//         type,
//       });
//       user.id = user._id;
//       await user.save();

//       // 5️⃣ Generate JWT token
//       const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "30d" });

//       return res.status(201).json({
//         code: 201,
//         message: "Register successful",
//         data: {
//           accessToken,
//           user: { ...user._doc, _id: undefined, __v: undefined },
//         },
//       });
//     } catch (error) {
//       next({ status: 500, message: error?.message });
//     }
//   });
// };

const register = async (req, res, next) => {
  try {
    const { id, name, phone, birthDate, gender, type } = req.body;
    let avatar = "";

    if (!name || validateMinLength(name, 3) === false) return next({ status: 400, message: "Name should be at least 3 characters" });
    if (!phone || validateLength(phone, 10) === false) return next({ status: 400, message: "Phone should be exactly 10 characters" });
    if (!birthDate || !validateBirthDate(new Date(birthDate))) return next({ status: 400, message: "Birth date should be in the past." });
    if (!["male", "female"].includes(gender)) return next({ status: 400, message: "Gender should be 'male' or 'female'" });
    if (!["phone", "facebook"].includes(type)) return next({ status: 400, message: "Type should be 'phone' or 'facebook'" });
    if (type === "facebook" && (!id || id === "")) return next({ status: 400, message: "Missing facebook id" });

    let existUser = await UserService.findUserByPhone(phone);
    if (existUser) return next({ status: 400, message: "Phone number already exists" });

    const user = await UserService.createUser("user", {
      name,
      phone: convertToInternational(phone),
      birthDate,
      gender,
      avatar,
      type,
    });
    user.id = type === "facebook" ? id : user._id;
    await user.save();

    const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "30d" });

    return res.status(201).json({
      code: 201,
      message: "Register successful",
      data: {
        accessToken,
        user: { ...user._doc, _id: undefined, __v: undefined },
      },
    });
  } catch (error) {
    next({ status: 500, message: error?.message });
  }
};

module.exports = {
  loginByOtp,
  register
}