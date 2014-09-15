// // code based on express-validator (https://github.com/ctavan/express-validator)
//

var validator = require('validator');

module.exports = function() {
  validator.extend('isAlphanumericDash', function(str) {
    return /^[a-zA-Z0-9-_]+$/i.test(str);
  });
}

//
// var vldr = function(options) {
//   var _options = {};
//
//   var sanitizers = ['trim', 'ltrim', 'rtrim', 'escape', 'whitelist', 'blacklist'];
//
//   var sanitize = function(request, param, value) {
//     var methods = {};
//
//     Object.keys(validator).forEach(function(methodName) {
//       if (methodName.match(/^to/) || sanitizers.indexOf(methodName) !== -1) {
//         methods[methodName] = function() {
//           var args = [value].concat(Array.prototype.slice.call(arguments));
//           var result = validator[methodName].apply(validator, args);
//           request.updateParam(param, result);
//           return result;
//         }
//       }
//     });
//
//     return methods;
//   }
//
//   function checkParam(req, getter) {
//     return function(param, failMsg) {
//       var value;
//
//       // If param is not an array, then split by dot notation
//       // returning an array. It will return an array even if
//       // param doesn't have the dot notation.
//       //      'blogpost' = ['blogpost']
//       //      'login.username' = ['login', 'username']
//       // For regex matches you can access the parameters using numbers.
//       if (!Array.isArray(param)) {
//         param = typeof param === 'number' ?
//           [param] :
//           param.split('.').filter(function(e){
//             return e !== '';
//           });
//       }
//
//       // Extract value from params
//       param.map(function(item) {
//         if (value === undefined) {
//           value = getter(item)
//         } else {
//           value = value[item];
//         }
//       });
//       param = param.join('.');
//
//       var errorHandler = function(msg) {
//         var error = {
//           param : param,
//           msg   : msg,
//           value : value
//         };
//
//         if (req._validationErrors === undefined) {
//           req._validationErrors = [];
//         }
//         req._validationErrors.push(error);
//
//         if (req.onErrorCallback) {
//           req.onErrorCallback(msg);
//         }
//         return this;
//       }
//
//       var methods = [];
//
//       Object.keys(validator).forEach(function(methodName) {
//         if (!methodName.match(/^to/) && sanitizers.indexOf(methodName) === -1) {
//           methods[methodName] = function() {
//             var args = [value].concat(Array.prototype.slice.call(arguments));
//             var isCorrect = validator[methodName].apply(validator, args);
//
//             // if (!isCorrect) {
//             //   errorHandler(failMsg || 'Invalid value');
//             // }
//
//             return isCorrect;
//           }
//         }
//       });
//
//       // Object.keys(_options.customValidators).forEach(function(customName) {
//       //   methods[customName] = function() {
//       //     var args = [value].concat(Array.prototype.slice.call(arguments));
//       //     var isCorrect = _options.customValidators[customName].apply(null, args);
//       //
//       //     if (!isCorrect) {
//       //       errorHandler(failMsg || 'Invalid value');
//       //     }
//       //
//       //     return methods;
//       //   };
//       // });
//
//       return methods;
//     }
//   }
//   return function(req, res, next) {
//
//     req.updateParam = function(name, value) {
//       // route params like /user/:id
//       if (this.params && this.params.hasOwnProperty(name) &&
//         undefined !== this.params[name]) {
//         return this.params[name] = value;
//       }
//       // query string params
//       if (undefined !== this.query[name]) {
//         return this.query[name] = value;
//       }
//       // request body params via connect.bodyParser
//       if (this.body && undefined !== this.body[name]) {
//         return this.body[name] = value;
//       }
//       return false;
//     };
//
//     req.__v = checkParam(req, function(item) {
//       return req.body && req.body[item];
//     });
//
//     req.__v.username = function() {
//       var user = Array.prototype.slice.call(arguments)[0];
//
//       if (!user || user === '') {
//         req.__e('user.username.blank');
//         return false;
//       }
//
//       if (!validator.isLength(user, 3, 20)) {
//         req.__e('user.username.length');
//         return false;
//       }
//
//       if (!validator.isAlphanumericDash(user)) {
//         req.__e('user.username.characters');
//         return false;
//       }
//
//       if (!validator.isAlphanumericDash(user[0])) {
//         req.__e('user.username.begin_alphanumeric');
//         return false;
//       }
//       return true;
//
//     }
//
//     req.__v.password = function() {
//       var pass = Array.prototype.slice.call(arguments)[0];
//
//       if (!pass || pass === '') {
//         req.__e('user.password.blank');
//         return false;
//       }
//
//       if (!validator.isLength(pass, 8)) {
//         req.__e('user.password.length');
//         return false;
//       }
//
//       return true;
//     }
//
//     req.onValidationError = function(errback) {
//       req.onErrorCallback = errback;
//     };
//
//     req.validationErrors = function(mapped) {
//       if (req._validationErrors === undefined) {
//         return null;
//       }
//       if (mapped) {
//         var errors = {};
//         req._validationErrors.forEach(function(err) {
//           errors[err.param] = err;
//         });
//         return errors;
//       }
//       return req._validationErrors;
//     }
//
//     req.filter = function(param) {
//       return sanitize(this, param, this.param(param));
//     };
//
//     // Create some aliases - might help with code readability
//     req.sanitize = req.filter;
//     req.assert = req.check;
//     req.validate = req.check;
//
//     return next();
//   };
// }
//
// module.exports = vldr;
// module.exports.validator = validator;
