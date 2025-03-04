const UserFactory = require("./userFactory");
const AppUser = require("../../models/user/appUsers.model");

class AppUserFactory extends UserFactory {
  createUser(data) {
    return new AppUser(data);
  }
}

module.exports = new AppUserFactory();