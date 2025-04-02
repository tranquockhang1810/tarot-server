const PackageService = require("../services/packageService");

exports.getPackagesList = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    if (isNaN(page) || page < 1) {
      return next({ status: 400, message: "Page must be a positive number" });
    }
    if (isNaN(limit) || limit < 1) {
      return next({ status: 400, message: "Limit must be a positive number" });
    }
    const { data, paging } = await PackageService.getAllPackages(parseInt(page, 10), parseInt(limit, 10));

    return res.status(200).json({
      code: 200,
      message: "Packages fetched successfully",
      data,
      paging,
    });
  } catch (error) {
    next(error)
  }
}

exports.createPackage = async (req, res, next) => {
  try {
    const { price, point, description } = req.body;

    if ((isNaN(price) || price < 1000) || ((isNaN(point) || point <= 0))) {
      return next({ status: 400, message: "Invalid price or point" });
    }

    const newPackage = await PackageService.createPackage({ price, point, description });

    return res.status(200).json({
      code: 200,
      message: "Package created successfully",
      data: newPackage,
    });
  } catch (error) {
    next(error)
  }
}