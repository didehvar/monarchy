var restify = require('restify');
var underscore = require('underscore');
var async = require('async');
var _ = require('underscore');

var User = require('../models/user');

// takes a mongoose error and appends it to an array (errors)
function ifMongoError(error, errorGroup) {
  if (!error) {
    return;
  }

  _.each(error.errors, function(e) {
    return errorGroup[e.path] = e.message;
  });
}

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
      ifMongoError(error, errorGroup);

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
