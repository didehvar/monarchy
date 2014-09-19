var i18n = require('i18n');
var config = require('config');
var crypto = require('crypto');
var passport = require('passport');
var debug = require('debug')('monarchy:con:sso');

function validateRequest(req, res, next) {
  if (!req.query.sso || !req.query.sig) {
    return next(i18n.__('sso.invalid'));
  }

  var payload = req.query.sso;
  var sig = req.query.sid;

  var hmac = crypto.createHmac('sha256', config.get('discourse.sso.secret')).
                    update(payload).
                    digest('hex');

  if (hmac !== sig) {
    return next(i18n.__('sso.invalid'));
  }

  var nonce = new Buffer(payload, 'base64').toString('utf8').split('nonce=');

  if (nonce.length != 2 || !nonce[1] || !nonce[1].trim()) {
    return next(i18n.__('sso.invalid'));
  }

  debug(req.nonce);
  req.nonce = nonce;

  next();
}

exports.login = [
  passport.authenticate('bearer', { session: false }),
  validateRequest,
  function(req, res, next) {
    if (!req.user) {
      debug('missing user');
      return next(i18n.__('user.not_authenticated'));
    }

    if (!req.nonce) {
      debug('missing nonce');
      return next(i18n.__('sso.invalid'));
    }

    debug(req.user);

    if (!req.user.emails || req.user.emails.length === 0) {
      return next(i18n.__('sso.missing_email'));
    }

    var payload = new Buffer(querystring.stringify({
      'nonce': req.nonce,
      'external_id': req.user._id,
      'email': req.user.emails[0].address,
      'username': req.user.username
    }), 'utf8').toString('base64');

    var hmac = crypto.createHmac('sha256', config.get('discourse.sso.secret')).
                      update(payload).
                      digest('hex');

    var params = querystring.stringify({
      'sso': payload,
      'sig': hmac
    });

    debug(params);

    res.redirect(config.get('discourse.url') + '/session/sso_login' + params, 302);
  },
  function(err, req, res, next) {
    return res.status(401).json({ error: err });
  }
];

exports.validate = [
  validateRequest,
  function(req, res, next) {
    return res.sendStatus(200);
  },
  function(err, req, res, next) {
    return res.status(401).json({ error: err });
  }
];
