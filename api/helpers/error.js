var _ = require('underscore');

// takes a mongoose error and appends it to an array (errorGroup)
exports.appendMongo = function helperAppendMongo(error, errorGroup) {
  if (!error) {
    return;
  }

  _.each(error.errors, function(e) {
    return errorGroup[e.path] = e.message;
  });
}
