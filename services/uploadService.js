const cloudinary = require("../config/cloudinary");
const { v4: uuidv4 } = require("uuid");

class UploadService {
  static async uploadToCloudinary(fileBuffer) {
    return new Promise((resolve, reject) => {
      const uniqueFilename = uuidv4();

      cloudinary.uploader.upload_stream(
        {
          folder: "chat-app",
          format: "png",
          public_id: uniqueFilename,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      ).end(fileBuffer);
    });
  }

  static async uploadMultiple(files) {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error("No files provided.");
    }

    const uploadPromises = files.map((file) => this.uploadToCloudinary(file.buffer));
    return await Promise.all(uploadPromises);
  }

  static async deleteFile(url) {
    try {
      if (!url) {
        throw new Error("URL is required to delete file.");
      }
  
      // Extract public_id từ URL
      const publicId = this.extractPublicIdFromUrl(url);
      if (!publicId) {
        throw new Error("Failed to extract public_id from URL.");
      }
  
      // Xóa file từ Cloudinary
      await cloudinary.uploader.destroy(publicId);
      console.log(`✅ Deleted image from Cloudinary: ${publicId}`);
    } catch (error) {
      console.error("❌ Error deleting file from Cloudinary:", error);
    }
  }
  
  static extractPublicIdFromUrl(url) {
    try {
      const parts = url.split('/');
      const fileNameWithExtension = parts.slice(-2).join('/'); // lấy 2 phần cuối: "chat-app/xxxx.png"
      const publicId = fileNameWithExtension.split('.')[0]; // bỏ đuôi .png
      return publicId;
    } catch (error) {
      console.error("❌ Error extracting public_id:", error);
      return null;
    }
  }
}

module.exports = UploadService;
