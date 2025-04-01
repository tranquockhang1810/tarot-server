const UserFactory = require("./userFactory");
const AppUser = require("../../models/user/appUsers.model");

class AppUserFactory extends UserFactory {
  createUser(data) {
    return new AppUser(data);
  }

  updateUser(id, data) {
    return AppUser.findByIdAndUpdate(id, data, { new: true });
  }
}

module.exports = new AppUserFactory();