const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const adminUsers = mongoose.model('adminUsers');

function login(username, password, errorCallback, successCallback) {
  adminUsers.findOne({ username: username }, (err, user) => {
    if (!err && user) {
      bcrypt.compare(password, user.password, (err, passwordMatch) => {
        if (passwordMatch) {
          successCallback(user);
        }
        else {
          errorCallback({ message: "PASSWORDS DO NOT MATCH" });
        }
      });
    }
    else {
      errorCallback({ message: "USER NOT FOUND" });
    }
  });
}

function startAuthenticatedSession(req, user, cb) {
  req.session.regenerate((err) => {
    if (!err) {
      req.session.admin = user;
      cb();
    }
    else {
      console.log(`ERROR: ${err}`);
      cb(err);
    }
  });
}

module.exports = {
  startAuthenticatedSession: startAuthenticatedSession,
  login: login
};
