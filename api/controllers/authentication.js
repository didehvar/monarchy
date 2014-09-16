var passport = require('passport');
var i18n = require('i18n');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

passport.use(new LocalStrategy(
  function(username, password, done) {
    if (!username || !password) {
      return done(null, false);
    }

    User.findOne({ username: username }, '+password +salt', function(err, user) {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false, { error: i18n.__('user.login.incorrect') });
      }

      user.checkPassword(password, function(err, valid) {
        if (!valid) {
          return done(null, false, { error: i18n.__('user.login.incorrect') });
        }

        return done(err, user);
      });
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

exports.login = function login(req, res, next) {
  passport.authenticate('local', { session: false }, function(err, user, info) {
    if (err) {
      res.json(err);
      return next(err);
    }

    if (!user) {
      res.json(info);
      return next();
    }

    req.logIn(user, function(err) {
      if (err) {
        res.json(err);
        return next(err);
      }

      res.json({ message: i18n.__('user.login.success') });
      return next();
    })
  })(req, res, next);
}
