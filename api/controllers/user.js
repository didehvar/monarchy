var restify = require('restify');
var underscore = require('underscore');
var async = require('async');
var _ = require('underscore');

var errorHelper = require('../helpers/error');
var User = require('../models/user');

exports.post = function create(req, res, next) {
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

    user.save(function(err) {
      errorHelper.filterMongo(err, errorGroup);

      if (!_.isEmpty(errorGroup)) {
        errors.push(errorGroup);
      }

      return callback();
    });
  }, function(err) {
    if (err) {
      return req.log.fatal(err);
    }

    if (errors.length > 0) {
      res.json({ errors: errors });
    } else {
      res.send(201);
    }

    return next();
  });
}

exports.get = function read(req, res, next) {
  User.findOne({ username: req.params.username }, function(err, user) {
    var errors = errorHelper.filterMongo(err);

    if (errors) {
      res.json({ errors: errors });
    } else if (user) {
      res.json(user);
    } else {
      res.send(404);
    }

    return next();
  });
}

exports.put = function update(req, res, next) {
  var users = req.body.users;
  var errors = [];

  if (!Array.isArray(users)) {
    users = [users];
  }

  async.eachSeries(users, function(u, callback) {
    User.findOne(
      { username: req.params.username || u.username },
      function(err, user) {
        var errGroup = {};
        errorHelper.filterMongo(err, errGroup);

        _.extend(user, u);

        if (!user) {
          errors.push({ username: 'user.not_found' });
          return callback();
        }

        user.save(function(err) {
          errorHelper.filterMongo(err, errGroup);

          if (!_.isEmpty(errGroup)) {
            errors.push(errGroup);
          }

          return callback();
        });
      }
    );
  }, function(err) {
    if (err) {
      return req.log.fatal(err);
    }

    if (errors.length > 0) {
      res.json({ errors: errors });
    } else {
      res.send(204);
    }

    return next();
  });
}
