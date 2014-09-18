var oauth2orize = require('oauth2orize');
var passport = require('passport');
var i18n = require('i18n');
var debug = require('debug')('monarchy:con:oauth');
var config = require('config');

var auth = require('../helpers/auth');
var random = require('../helpers/random');

var User = require('../models/user');
var Client = require('../models/client');
var AuthCode = require('../models/auth_code');
var AccessToken = require('../models/access_token');
var RefreshToken = require('../models/refresh_token');

var server = oauth2orize.createServer();

server.serializeClient(function(client, done) {
  debug('serialise client: %s', client);
  done(null, client._id);
});

server.deserializeClient(function(id, done) {
  debug('deserialise client (id): %s', id);
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// grant code
// server.grant(oauth2orize.grant.code(function (client, redirectURI, user, ares, done) {
//   debug('granting code: %s, %s, %s, %s', client, redirectURI, user, ares);
//
//   var ac = new AuthCode({
//     client: client._id,
//     user: user._id,
//     redirect: redirectURI,
//     code: random.string(64),
//     scope: ares.scope
//   });
//
//   ac.save(function(err, code) {
//     if (err) {
//       return done(err);
//     }
//
//     return done(null, code.code);
//   });
// }));

// exchange code for an access token
// server.exchange(oauth2orize.exchange.code(
//   function(client, code, redirectURI, done) {
//     debug('exchanging code: %s, %s, %s', client, code, redirectURI);
//
//     AuthCode.findOne({
//       code: code,
//       clientId: code.clientId,
//       redirect: redirectURI
//     }, function(err, code) {
//       if (err) {
//         return done(err);
//       }
//
//       var at = new AccessToken({
//         clientId: code.clientId,
//         userId: code.userId,
//         token: random.string(128),
//         scope: code.scope
//       });
//
//       at.save(function(err, token) {
//         if (err) {
//           return done(err);
//         }
//
//         return done(null, token.token, {
//           'expires_in': config.get('oauth.token.timeout')
//         });
//       });
//     });
//   }
// ));

// grant token
// server.grant(oauth2orize.grant.token(function (client, user, ares, done) {
//   debug('granting token: %s, %s, %s', client, user, ares);
//
//   var ac = new AuthCode({
//     client: client._id,
//     user: user._id,
//     redirect: redirectURI,
//     code: random.string(256),
//     scope: ares.scope
//   });
//
//   ac.save(function(err, code) {
//     if (err) {
//       return done(err);
//     }
//
//     return done(null, code.code);
//   });
// }));

// exchange password for an access token
server.exchange(oauth2orize.exchange.password(
  function(client, username, password, scope, done) {
    debug('exchanging password (%s) (%s) (%s)', client, username, password);

    User.findOne({ username: username }, '+password +salt', function(err, user) {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false);
      }

      user.checkPassword(password, function(err, valid) {
        if (err) {
          return done(err);
        }

        if (!valid) {
          return done(null, false);
        }

        var clientId = null;
        if (client) {
          clientId = client._id;
        }

        RefreshToken.remove({ userId: user._id, clientId: clientId }, function(err) {
          if (err) {
            return done(err);
          }
        });

        AccessToken.remove({ userId: user._id, clientId: clientId }, function(err) {
          if (err) {
            return done(err);
          }
        });

        var at = new AccessToken({
          clientId: clientId,
          userId: user._id,
          token: random.string(256),
          scope: user.scope
        });

        var rt = new RefreshToken({
          clientId: clientId,
          userId: user._id,
          token: random.string(256),
          scope: user.scope
        });

        rt.save(function(err) {
          if (err) {
            return done(err);
          }
        });

        at.save(function(err, token) {
          if (err) {
            return done(err);
          }

          return done(null, token.token, rt.token, {
            'expires_in': config.get('oauth.token.timeout')
          });
        });
      });
    });
  }
));

// exchange client credentials
// server.exchange(oauth2orize.exchange.clientCredentials(function(client, scope, done) {
//   debug('exchanging client credentials: %s, %s', client, scope);
//
//   Client.findOne({ id: client._id, secret: client.secret }, function(err, client) {
//     if (err) {
//       return done(err);
//     }
//
//     if (!client) {
//       return done(null, false);
//     }
//
//     var at = new AccessToken({
//       clientId: client._id,
//       userId: null,
//       token: random.string(256),
//       scope: scope
//     });
//
//     at.save(function(err, token) {
//       if (err) {
//         return done(err);
//       }
//
//       return done(null, token.token, {
//         'expires_in': config.get('oauth.token.timeout')
//       });
//     });
//   });
// }));

// refresh token
server.exchange(oauth2orize.exchange.refreshToken(
  function(client, refreshToken, scope, done) {
    debug('exchanging refresh token: %s, %s, %s', client, refreshToken, scope);

    RefreshToken.findOne({ token: refreshToken }, function(err, token) {
      if (err) {
        return done(err);
      }

      if (!token) {
        return done(null, false);
      }

      User.findById(token.userId, function(err, user) {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false);
        }

        var clientId = null;
        if (client) {
          clientId = client.clientId
        }

        RefreshToken.remove({ userId: user._id, clientId: clientId }, function(err) {
          if (err) {
            return done(err);
          }
        });

        AccessToken.remove({ userId: user._id, clientId: clientId }, function(err) {
          if (err) {
            return done(err);
          }
        });

        var at = new AccessToken({
          clientId: clientId,
          userId: user._id,
          token: random.string(256),
          scope: user.scope
        });

        var rt = new RefreshToken({
          clientId: clientId,
          userId: user._id,
          token: random.string(256),
          scope: user.scope
        });

        rt.save(function(err) {
          if (err) {
            return done(err);
          }
        });

        at.save(function(err, token) {
          if (err) {
            return done(err);
          }

          return done(null, token.token, rt.token, {
            'expires_in': config.get('oauth.token.timeout')
          });
        });
      });
    })
  }
));

function revokeToken(req, res, next) {
  if (req.get('content-type') !== 'application/x-www-form-urlencoded') {
    return next({
      status: 400,
      message: i18n.__('invalid content-type')
    });
  }

  if (!req.body || !req.body.token || !req.user) {
    return next({ status: 401 });
  }

  var hint = req.body.token_type_hint || 'access_token';
  var userId = req.user._id;
  var token = req.body.token;

  return AccessToken.remove({ userId: userId, token: token }, function(err, removed) {
    if (err) {
      return next(err);
    }

    if (removed === 0) {
      return RefreshToken.remove({ userId: userId, token: token }, function(err, removed) {
        if (err) {
          return next(err);
        }

        if (removed === 0) {
          return res.status(500).json({ unsupported_token_type: token });
        }

        AccessToken.remove({ userId: userId }, function(err) {
          if (err) {
            return next(err);
          }

          return res.sendStatus(200);
        });
      });
    }

    RefreshToken.remove({ userId: userId }, function(err) {
      if (err) {
        return next(err);
      }

      return res.sendStatus(200);
    });
  });

  return RefreshToken.remove({ userId: userId, token: token }, function(err, t) {
    if (err) {
      return next(err);
    }

    callback(t);
  });
}

exports.authorize = [
  auth.ensureAuthenticated,
  server.authorize(function(clientId, redirectURI, done) {
    Client.findOne({ id: clientId, redirect: redirectURI }, function(err, client) {
      if (err) {
        return done(err);
      }

      if (!client) {
        return done(null, false);
      }

      return done(null, client, client.redirect);
    });
  }),
  function(req, res, next) {
    res.json({
      transactionID: req.oauth2.transactionID,
      user: req.user,
      client: req.oauth2.client
    });
  }
];

exports.decision = [
  auth.ensureAuthenticated,
  server.decision()
];

exports.token = [
  passport.authenticate(['oauth2-client-password', 'oauth2-public-client'], { session: false }),
  server.token(),
  function(err, req, res, next) {
    debug(err);
    next(err);
  },
  server.errorHandler()
];

exports.public_token = [
  server.token(),
  function(err, req, res, next) {
    debug(err);
    next(err);
  },
  server.errorHandler()
];

exports.revoke_token = [
  passport.authenticate('bearer', { session: false }),
  revokeToken
];
