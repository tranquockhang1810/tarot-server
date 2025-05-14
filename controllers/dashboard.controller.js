const DashboardService = require("../services/dashboardService");

exports.getBillDashboard = async (req, res, next) => {
  try {
    const { labels, statics } = await DashboardService.getBillChart();
    return res.status(200).json({
      code: 200,
      message: "Dashboard fetched successfully",
      data: {
        labels,
        statics
      },
    });
  } catch (error) {
    next(error);
  }
}

exports.getTopicChart = async (req, res, next) => {
  try {
    const { labels, statics } = await DashboardService.getTopicChart();
    return res.status(200).json({
      code: 200,
      message: "Topic chart fetched successfully",
      data: {
        labels,
        statics
      },
    });
  } catch (error) {
    next(error);
  }
}

exports.getUserChart = async (req, res, next) => {
  try {
    const { labels, statics, avrAge } = await DashboardService.getUserChart();
    return res.status(200).json({
      code: 200,
      message: "User chart fetched successfully",
      data: {
        labels,
        statics,
        avrAge
      },
    });
  } catch (error) {
    next(error);
  }
}