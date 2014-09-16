var _ = require('underscore');

// takes mongoose errors and appends them to an optional returned array (errors)
exports.filterMongo = function helperfilterMongo(error, errors) {
  if (!error) {
    return null;
  }

  errors = (typeof errors === 'undefined') ? {} : errors;

  _.each(error.errors, function(e) {
    errors[e.path] = e.message;
  });

  return errors;
}
