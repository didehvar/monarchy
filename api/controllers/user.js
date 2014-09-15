var express = require('express');
var router = express.Router();
var async = require('async');
var _ = require('underscore');
var crypto = require('crypto');

var Error = require('../utility/error');
var User = require('../models/user');
var Email = require('../models/email');

router.route('/users')
  .post(function(req, res) {
    if (!req.body || !req.body.users) {
    return res.json(/*req.__e('json.empty')*/);
    }

    var users = req.body.users;

    if (!Array.isArray(users)) {
      users = [users];
    }

    var allErrors = [];

    async.each(users, function(user, callback) {
      var errors = new Error();

      var dbUser = new User();
      _.extend(dbUser, user);

      // create email
      var emails = user.emails;

      if (!Array.isArray(emails)) {
        emails = [emails];
      }

      async.each(emails, function(email, emailCallback) {
        var emailErrors = new Error();

        var dbEmail = new Email();
        _.extend(dbEmail, email);

        dbEmail.save(function(err, email) {
          if (err) {
            console.log(err);
            if (!err.errors) {
              emailErrors.string('database.error');
            } else {
              _.each(err.errors, function(error) {
                emailErrors.string(error.message, error.path);
              });
            }
          } else {
            dbUser.emails = email;
          }

          emailCallback(emailErrors.errors);
        });
      }, function(emailErr) {
        dbUser.save(function(err) {
          if (err) {
            if (!err.errors) {
              errors.string('database.error');
            } else {
              _.each(err.errors, function(error) {
                errors.string(error.message, error.path);
              });
            }
          }

          var errorsWithEmail = errors.errors || {};
          if (!_.isEmpty(emailErr)) {
            errorsWithEmail.emails = [emailErr];
          }

          if (!_.isEmpty(errorsWithEmail)) {
            allErrors.push(errorsWithEmail);
          }

          callback();
        });
      });
    }, function() {
      console.log(allErrors);
      if (!allErrors.length) {
        return res.sendStatus(201);
      }

      res.json({ errors: allErrors });
    });
  })
  .get(function(req, res) {
    User.find({}, '-_id -__v', function(err, users) {
      if (err) {
        return res.json(req.__e('database.error'));
      }

      res.json(users);
    });
  })
  .put(function(req, res) {
    res.status(501).json(req.__e('feature.not_implemented'));

    // TODO: test
    //
    // console.log(req.body);
    //
    // var users = req.body.users;
    // var updated = [];
    //
    // for (var i = 0; i < users.length; i++) {
    //   User.findOneAndUpdate({ _id: users[i].id }, users[i], function(err, user) {
    //     if (err) {
    //       return error.mongo(err);
    //     }
    //   });
    // }
    //
    // res.json({});
  })
  .delete(function(req, res) {
    res.status(501).json(req.__e('feature.not_implemented'));
  });

router.route('/users/:username')
  .post(function(req, res) {
    res.sendStatus(404);
  })
  .get(function(req, res) {
    var username = req.params.username;

    User.findOne({ username: username }, '-_id -__v', function(err, user) {
      if (err) {
        return res.json(req.__e('database.error'));
      }

      if (!user) {
        return res.json(req.__e('user.not_found'));
      }

      res.json(user);
    });
  })
  .put(function(req, res) {
    res.status(501).json(req.__e('feature.not_implemented'));
  })
  .delete(function(req, res) {
    res.status(501).json(req.__e('feature.not_implemented'));
  });

module.exports = function(app) {
  app.use('/api', router);
}
