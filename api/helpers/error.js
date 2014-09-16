var _ = require('underscore');
var i18n = require('i18n');

// takes mongoose errors and appends them to an optional returned array (errors)
exports.filterMongo = function helperfilterMongo(error, errors) {
  if (!error) {
    return null;
  }

  errors = (typeof errors === 'undefined') ? {} : errors;

  if (!error.errors) {
    errors.MongoError = error.err || i18n.__('error.unknown');
  }

  _.each(error.errors, function(e) {
    errors[e.path] = e.message;
  });

  return errors;
}
