var passport = require('passport');
var i18n = require('i18n');
var debug = require('debug')('monarchy:con:auth');
var config = require('config');

var LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
// var BasicStrategy = require('passport-http').BasicStrategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;

var User = require('../models/user');
var Client = require('../models/client');
var AccessToken = require('../models/access_token');

passport.serializeUser(function(user, done) {
  debug('serialise user: %s', user);
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  debug('deserialise user (id): %s', id);
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// -- local strategy -- //
// passport.use(new LocalStrategy(
//   function(username, password, done) {
//     if (!username || !password) {
//       return done(null, false);
//     }
//
//     User.findOne({ username: username }, '+password +salt', function(err, user) {
//       if (err) {
//         return done(err);
//       }
//
//       if (!user) {
//         return done(null, false, { error: i18n.__('user.login.incorrect') });
//       }
//
//       user.checkPassword(password, function(err, valid) {
//         if (err) {
//           return done({ error: err });
//         }
//
//         if (!valid) {
//           return done(null, false, { error: i18n.__('user.login.incorrect') });
//         }
//
//         return done(err, user);
//       });
//     });
//   }
// ));

// -- basic strategy --
// passport.use(new BasicStrategy(
//   function(id, secret, done) {
//     debug('login attempt by %s', id);
//     Client.findOne({ id: id, secret: secret }, function(err, client) {
//       if (err) {
//         return done(err);
//       }
//
//       if (!client) {
//         return done(null, false);
//       }
//
//       return done(null, client, { scope: '*' });
//     });
//   }
// ));

// -- client password strategy --
passport.use(new ClientPasswordStrategy(
  function(id, secret, done) {
    debug('client password attempt by: %s', id);
    Client.findOne({ id: id, secret: secret }, function(err, client) {
      if (err) {
        return done(err);
      }

      if (!client) {
        return done(null, false);
      }

      return done(null, client, { scope: '*' });
    });
  }
));

// -- bearer strategy --
passport.use(new BearerStrategy(
  function(accessToken, done) {
    debug('token attempt: %s', accessToken);
    AccessToken.findOne({ token: accessToken }, function(err, token) {
      if (err) {
        return done(err);
      }

      if (!token) {
        return done(null, false);
      }

      if (Math.round((Date.now() - token.created) / 1000) >
          config.get('oauth.token.timeout'))
      {
        AccessToken.remove({ token: accessToken }, function(err) {
          if (err) {
            return done(err);
          }
        });

        return done(null, false, i18n.__('oauth.token.expired'));
      }

      User.findById(token.userId, function(err, user) {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false, i18n.__('user.invalid'));
        }

        return done(null, user, { scope: '*' });
      });
    });
  }
));

// exports.login = function login(req, res, next) {
//   passport.authenticate('local', { session: false }, function(err, user, info) {
//     if (err) {
//       res.json(err);
//       return next(err);
//     }
//
//     if (!user) {
//       res.json(info);
//       return next();
//     }
//
//     req.logIn(user, function(err) {
//       if (err) {
//         res.json(err);
//         return next(err);
//       }
//
//       res.json({ message: i18n.__('user.login.success') });
//       return next();
//     })
//   })(req, res, next);
// }
