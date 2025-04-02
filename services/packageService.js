const Package = require("../models/package/package.model");

class PackageService {
  static async getAllPackages(page, limit) {
    try {
      const packages = await Package.find()
        .select("_id price point description")
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
      
      const totalPackages = await Package.countDocuments();
      return {
        data: packages,
        paging: {
          total: totalPackages,
          page,
          limit,
          totalPages: Math.ceil(totalPackages / limit)
        }
      }
    } catch (error) {
      console.error("❌ Error getting packages from DB:", error);
      return null
    }
  }

  static async createPackage(data) {
    try {
      const newPackage = new Package(data);
      return await newPackage.save();
    } catch (error) {
      console.error("❌ Error saving package to DB:", error);
      return null;
    }
  }
}

module.exports = PackageService