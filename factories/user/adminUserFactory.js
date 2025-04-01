const UserFactory = require("./userFactory");
const AdminUser = require("../../models/user/adminUsers.model");

class AppUserFactory extends UserFactory {
  createUser(data) {
    return new AdminUser(data);
  }

  updateUser(id, data) {
    return AdminUser.findByIdAndUpdate(id, data, { new: true });
  }
}
module.exports = new AppUserFactory();