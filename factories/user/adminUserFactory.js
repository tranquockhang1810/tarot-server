const UserFactory = require("./userFactory");
const AdminUser = require("../../models/user/adminUsers.model");

class AppUserFactory extends UserFactory {
  createUser(data) {
    return new AdminUser(data);
  }
}
module.exports = new AppUserFactory();