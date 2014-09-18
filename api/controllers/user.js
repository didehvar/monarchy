var underscore = require('underscore');
var async = require('async');
var _ = require('underscore');
var i18n = require('i18n');
var passport = require('passport');
var debug = require('debug')('monarchy:con:user');

var errorHelper = require('../helpers/error');
var User = require('../models/user');

exports.post = [
  // passport.authenticate('bearer', { session: false }),
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
        return next(err);
      }

      if (errors.length > 0) {
        return res.status(400).json({ errors: errors });
      }

      res.sendStatus(201);
    });
  }
];

exports.get = [
  passport.authenticate('bearer', { session: false }),
  function read(req, res, next) {
    User.find(function(err, users) {
      if (err) {
        return res.json(errorHelper.filterMongo(err));
      }

      res.json(users);
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
        return next(err);
      }

      if (errors.length > 0) {
        return res.status(400).json({ errors: errors });
      }

      res.sendStatus(204);
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
        return next(err);
      }

      if (errors.length > 0) {
        return res.json({ errors: errors });
      }

      res.sendStatus(204);
    });
  }
];

exports.getOne = [
  passport.authenticate('bearer', { session: false }),
  function readOne(req, res, next) {
    User.findOne({ username: req.params.username }, function(err, user) {
      var errors = errorHelper.filterMongo(err);

      if (errors) {
        return res.json({ errors: errors });
      }

      if (user) {
        return res.json(user);
      }

      res.sendStatus(404);
    });
  }
];
