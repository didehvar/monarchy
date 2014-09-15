var validator = require('validator');
var error = require('./error');

var api = ['username'];
var vldr = exports;

vldr.init = function validatorInit(req, res, next) {
  if (typeof res === 'object') {
    applyAPItoObject(req, res);
  }

  if (typeof next === 'function') {
    next();
  }
}

// == validator extensions
validator.extend('isAlphanumericDash', function(str) {
  return /^[a-zA-Z0-9-_]+$/i.test(str);
});

validator.extend('username', function(str) {
  if (!str) {
    return error.string(this.__('user.username.blank'));
  }

  if (!validator.isLength(str, 3, 20)) {
    return error.string(this.__('user.username.length'));
  }

  if (!validator.isAlphanumericDash(str)) {
    return error.string(this.__('user.username.characters'));
  }

  if (!validator.isAlphanumericDash(str[0])) {
    return error.string(this.__('user.username.begin_alphanumeric'));
  }

  return true;
});

// cheers https://github.com/mashpie/i18n-node ;)
function applyAPItoObject(req, res) {
  res['__v'] = res;

  Object.getOwnPropertyNames(validator).forEach(function(method) {
    if (!res[method]) {
      res['__v'][method] = function() {
        return validator[method].apply(req, arguments);
      }
    }
  });
}
