var validator = require('validator');

module.exports = function() {
  validator.extend('isAlphanumericDash', function(str) {
    return /^[a-zA-Z0-9-_]+$/.test(str);
  });
}
