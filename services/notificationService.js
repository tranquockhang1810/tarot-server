const Notification = require('../models/notification/notification.model');
const admin = require('../config/firebase');

class NotificationService {
  static async createNotification(data) {
    try {
      const created = await (await Notification.create(data)).populate('user', 'fcmToken');

      // Gửi Firebase notification nếu có FCM token
      if (created.user.fcmToken && created.title && created.description) {
        console.log("✅ Sending Firebase notification:", {
          token: created.user.fcmToken,
          title: created.title,
          body: created.description
        });
        
        await this.sendFirebaseNotification({
          token: created.user.fcmToken,
          title: created.title,
          body: created.description
        });
      }

      return created;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      return null;
    }
  }

  static async seenNotification(id) {
    return await Notification.findByIdAndUpdate(id, { status: true }, { new: true });
  }

  static async readAllNotification(userId) {
    try {
      const notifications = await Notification.find({ user: userId, status: false });
      const notificationIds = notifications.map(notification => notification._id);
      await Notification.updateMany({ _id: { $in: notificationIds } }, { status: true });
      return true;
    } catch (error) {
      console.error('Error reading all notifications:', error);
      return false;
    }
  }

  static async getNotification(userId, page, limit) {
    const skip = (page - 1) * limit;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalNotifications = await Notification.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalNotifications / limit);

    return {
      data: notifications,
      paging: {
        total: totalNotifications,
        page,
        limit,
        totalPages,
      },
    };
  }

  static async sendFirebaseNotification({ token, title, body }) {
    if (!admin.apps.length) {
      console.warn("⚠️ Firebase Admin chưa được khởi tạo.");
      return;
    }

    try {
      const message = {
        token,
        notification: {
          title,
          body,
        }
      };

      const response = await admin.messaging().send(message);
      console.log("✅ Firebase notification sent:", response);
    } catch (error) {
      console.error("❌ Error sending Firebase notification:", error);
    }
  }

  static async checkUnreadNotification(userId) {
    try {
      const unreadNotification = await Notification.find({ user: userId, status: false }).countDocuments();
      return unreadNotification;
    } catch (error) {
      console.error('Error checking unread notifications:', error);
      return null;
    }
  }

}

module.exports = NotificationService;