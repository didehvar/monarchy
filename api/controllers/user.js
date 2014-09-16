var restify = require('restify');
var underscore = require('underscore');
var async = require('async');
var _ = require('underscore');

var errorHelper = require('../helpers/error');
var User = require('../models/user');

exports.create = function create(req, res, next) {
  var users = req.body.users;
  var errors = [];

  if (!Array.isArray(users)) {
    users = [users];
  }

  async.eachSeries(users, function(u, callback) {
    var errorGroup = {};

    if (!Array.isArray(u.emails)) {
      u.emails = [u.emails];
    }

    var user = new User;
    _.extend(user, u);

    user.save(function(error) {
      errorHelper.appendMongo(error, errorGroup);

      if (!_.isEmpty(errorGroup)) {
        errors.push(errorGroup);
      }

      return callback();
    });
  }, function(error) {
    if (error) {
      return req.log.fatal(error);
    }

    if (errors.length > 0) {
      res.json({ errors: errors });
    } else {
      res.send(201);
    }

    return next();
  });
}
