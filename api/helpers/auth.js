var i18n = require('i18n');

exports.ensureAuthenticated = function ensureAuthenticated(req, res, next) {
  if (req.user) {
    return next();
  }

  res.status(401).json({ error: i18n.__('user.not_authenticated') }).end();
}
