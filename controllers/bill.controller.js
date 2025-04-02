const BillService = require('../services/billService');
const MomoService = require('../services/momoService');
const UserService = require('../services/userService');
const PackageService = require('../services/packageService');

exports.createBill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { packageId, returnUrl } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!packageId) {
      return res.status(400).json({ error: 'Missing packageId' });
    }

    const package = await PackageService.checkPackageExist(packageId);
    if (!package) {
      return res.status(404).json({ error: 'Package not found' });
    }

    const bill = await BillService.createBill({
      user: userId,
      type: "package",
      package: packageId,
      totalPrice: package.price
    });

    const momoResponse = await MomoService.createPayment(bill, returnUrl);
    res.status(200).json({
      code: 200,
      message: 'Payment created successfully',
      data: momoResponse.payUrl
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.paymentSuccess = async (req, res, next) => {
  try {
    const { orderId, resultCode } = req.body;

    if (parseInt(resultCode, 10) === 0) {
      const bill = await BillService.updateBill(orderId, { status: true }, "package");
      await BillService.createBill({
        user: bill.user._id,
        type: "point",
        point: bill.package.point,
        action: true
      })
      await UserService.updateUser(bill.user._id, bill.user.role, { point: bill.user.point + bill.package.point });

      return res.status(200).json({
        code: 200,
        message: "Payment success!",
        data: {
          user: {
            ...bill.user._doc,
            point: bill.user.point + bill.package.point
          },
          ...bill._doc
        }
      })
    } else {
      next({ status: 400, message: "Payment failed!" });
    }
  } catch (error) {
    console.error(error);
    next({ status: 500, message: "Server error!" });
  }
};

exports.getBillList = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    const user = req.user.id;
    if (isNaN(page) || page < 1) {
      return next({ status: 400, message: "Page must be a positive number" });
    }
    if (isNaN(limit) || limit < 1) {
      return next({ status: 400, message: "Limit must be a positive number" });
    }
    const data = await BillService.getBillList(type, user, parseInt(page, 10), parseInt(limit, 10));
    
    if (!data) {
      return next({ status: 404, message: "Bill list not found" });
    }
    return res.status(200).json({
      code: 200,
      message: "Bill list fetched successfully",
      data: data.bills,
      paging: {
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages
      }
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

