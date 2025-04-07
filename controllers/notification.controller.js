const NotificationService = require('../services/notificationService');

exports.getNotification = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    if (isNaN(page) || page < 1) {
      return next({ status: 400, message: "Page must be a positive number" });
    }
    if (isNaN(limit) || limit < 1) {
      return next({ status: 400, message: "Limit must be a positive number" });
    }

    const { data, paging } = await NotificationService.getNotification(userId, parseInt(page, 10), parseInt(limit, 10));
    res.status(200).json({
      code: 200,
      message: 'Notifications fetched successfully',
      data,
      paging
    });
  } catch (error) {
    next(error);
  }
}

exports.seenNotification = async (data) => {
  try {
    const { userId, id } = data;
    if (!userId && !id) {
      throw new Error('User ID or Notification ID is required');
    }
    if (userId) {
      return await NotificationService.readAllNotification(userId);
    } else if (id) {
      return await NotificationService.seenNotification(id);
    }
  } catch (error) {
    console.error('Error marking notification as seen:', error);
    throw error;
  }
}

exports.checkUnreadNotification = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    const unreadNotification = await NotificationService.checkUnreadNotification(userId);
    return unreadNotification;
  } catch (error) {
    console.error('Error checking unread notifications:', error);
    throw error;
  }
}
