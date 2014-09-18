var underscore = require('underscore');
var async = require('async');
var _ = require('underscore');
var i18n = require('i18n');
var passport = require('passport');

var errorHelper = require('../helpers/error');
var User = require('../models/user');

exports.post = [
  passport.authenticate('bearer', { session: false }),
  function create(req, res, next) {
    var users = req.body.users;
    var errors = [];

    if (!Array.isArray(users)) {
      users = [users];
    }

    async.eachSeries(users, function(u, callback) {
      if (!u || !u.emails) {
        errors.push({ error: i18n.__('request.invalid')});
        return callback();
      }

      var errorGroup = {};

      if (!Array.isArray(u.emails)) {
        u.emails = [u.emails];
      }

      var user = new User;
      _.extend(user, u);

      if (users.length === 1 && req.params.username) {
        user.username = req.params.username;
      }

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
        res.status(500).json({ errors: errors });
      } else {
        res.status(201).end();
      }

      return next();
    });
  }
];

exports.get = [
  passport.authenticate('bearer', { session: false }),
  function read(req, res, next) {
    User.find(function(err, users) {
      if (err) {
        res.json(errorHelper.filterMongo(err));
      } else {
        res.json(users);
      }

      return next();
    });
  }
];

exports.put = [
  passport.authenticate('bearer', { session: false }),
  function update(req, res, next) {
    var users = req.body.users;
    var errors = [];

    if (!Array.isArray(users)) {
      users = [users];
    }

    async.eachSeries(users, function(u, callback) {
      User.findOne(
        { username: u.username || req.params.username },
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
        res.status(204).end();
      }

      return next();
    });
  }
];

exports.del = [
  passport.authenticate('bearer', { session: false }),
  function del(req, res, next) {
    var users = req.body.users;
    var errors = [];

    if (!Array.isArray(users)) {
      users = [users];
    }

    async.eachSeries(users, function(u, callback) {
      User.findOneAndRemove(
        { username: u.username || req.params.username },
        function(err) {
          if (err) {
            errors.push(errorHelper.filterMongo(err));
          }

          return callback();
        }
      );
    }, function(err) {
      if (err) {
        return req.log.fatal(err);
      }

      if (errors.length > 0) {
        res.json({ errors: errors });
      } else {
        res.status(204).end();
      }

      return next();
    });
  }
];

exports.getOne = [
  passport.authenticate('bearer', { session: false }),
  function readOne(req, res, next) {
    User.findOne({ username: req.params.username }, function(err, user) {
      var errors = errorHelper.filterMongo(err);

      if (errors) {
        res.json({ errors: errors });
      } else if (user) {
        res.json(user);
      } else {
        res.status(404).end();
      }

      return next();
    });
  }
];
