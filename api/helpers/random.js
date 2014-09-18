var crypto = require('crypto');

exports.string = function(length) {
  return crypto.randomBytes(length).toString('base64');
}
