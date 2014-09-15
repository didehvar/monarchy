var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var EmailSchema = require('./email');
var crypto = require('crypto');
var validator = require('validator');
var i18n = require('i18n');

var usernameValidators = [
  {
    validator: function(val) {
      return !(!val || val === '');
    },
    msg: i18n.__('user.username.blank')
  },
  {
    validator: function(val) {
      return validator.isLength(val, 3, 20);
    },
    msg: i18n.__('user.username.length')
  },
  {
    validator: function(val) {
      return validator.isAlphanumericDash(val);
    },
    msg: i18n.__('user.username.characters')
  },
  {
    validator: function(val) {
      if (!val) {
        return false;
      }

      return validator.isAlphanumericDash(val[0]);
    },
    msg: i18n.__('user.username.begin_alphanumeric')
  },
  {
    validator: function(val, callback) {
      mongoose.model('User').find({ username: val }, function(err, users) {
        callback(err || users.length === 0);
      });
    },
    msg: i18n.__('user.username.exists')
  }
];

var emailValidators = [
  {
    validator: function(val) {
      return val.length;
    },
    msg: i18n.__('user.email.blank')
  }
];

var passwordValidators = [
  {
    validator: function(val) {
      return val && val !== '';
    },
    msg: i18n.__('user.password.blank')
  },
  {
    validator: function(val) {
      return validator.isLength(val, 8);
    },
    msg: i18n.__('user.password.length')
  }
];

var UserSchema = new Schema({
  username: {
    type: String,
    index: { unique: true },
    required: true,
    validate: usernameValidators
  },
  emails: {
    type: [EmailSchema],
    required: true,
    validate: emailValidators
  },

  password: {
    type: String,
    required: true,
    select: false,
    validate: passwordValidators
  },
  salt: { type:String, select: false },

  rank: { type: String, default: '' },

  steamId: { type: String, unique: true },
  avatarLinks: [String],

  skype: { type: String, unique: true },
  twitch: { type: String, unique: true },
});

UserSchema.pre('save', function(next) {
  var user = this;

  if (user.isModified('password')) {
    crypto.randomBytes(256, function(err, salt) {
      if (err) {
        return next(err);
      }

      salt = salt.toString('hex');

      crypto.pbkdf2(user.password, salt, 64000, 256, function(err, derivedKey) {
        if (err) {
          return next(err);
        }

        user.password = derivedKey.toString('hex');
        user.salt = salt;

        next();
      });
    });
  }

  next();
});

UserSchema.methods.verifyPassword = function(password, callback) {
  var currentPass = this.password;

  crypto.pbkdf2(password, this.salt, 64000, 256, function(err, derivedKey) {
    if (err) {
      return callback(err);
    }

    callback(null, currentPass === derivedKey.toString('hex'));
  });
}

module.exports = mongoose.model('User', UserSchema);
