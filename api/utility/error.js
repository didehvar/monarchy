var _ = require('underscore');

var Error = function() {
  this.errors = {};
}

// Error.string = function(error) {
//   return { errors: [{ title: error }]};
// }

Error.prototype.string = function(error, identifier) {
  this.errors[identifier || 'title'] = error;
}

Error.prototype.array = function(errors) {
  _.each(errors, function(error) {
    this.errors.push({ title: error });
  });
}

module.exports = Error;

module.exports.init = function() {
  return function (req, res, next) {
    var err = new Error();
    var errorArrays = [];

    req.__e = function() {
      if (Object.keys(arguments).length !== 0) {
        err.string(req.__(Array.prototype.slice.call(arguments)[0]));
      }

      return err.errors();
    }

    return next();
  }
}
