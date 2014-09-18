var oauth2orize = require('oauth2orize');
var passport = require('passport');
var i18n = require('i18n');
var debug = require('debug')('monarchy:con:oauth');
var config = require('config');

var random = require('../helpers/random');

var User = require('../models/user');
var Client = require('../models/client');
var AuthCode = require('../models/auth_code');
var AccessToken = require('../models/access_token');

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

// grant types
server.grant(oauth2orize.grant.code(function (client, redirectURI, user, ares, done) {
  debug('granting code (%s) (%s)', client, user);

  var ac = new AuthCode({
    client: client._id,
    user: user._id,
    redirect: redirectURI,
    code: random.value(client._id, 'access_token'),
    // scope: ares.scope
  });

  ac.save(function(err) {
    if (err) {
      return done(err);
    }

    return done(null, code);
  })
}));

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
          debug(err);
          return done(err);
        }

        if (!valid) {
          return done(null, false);
        }

        AccessToken.remove({ userId: user._id, clientId: client._id },
          function(err) {
            if (err) {
              debug(err);
              return done(err);
            }
          }
        );

        var at = new AccessToken({
          clientId: client._id,
          userId: user._id,
          token: random.string(32),
          // scope: scope
        });

        at.save(function(err, token) {
          if (err) {
            return done(err);
          }

          return done(null, token, {
            'expires_in': config.get('oauth.token.timeout')
          });
        });
      });
    });
  }
));

exports.token = [
  // passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
  passport.authenticate('oauth2-client-password', { session: false }),
  server.token(),
  function(err, req, res, next) {
    debug(err);
    next(err);
  },
  server.errorHandler()
];
