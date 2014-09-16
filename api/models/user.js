var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var _ = require('underscore');
var crypto = require('crypto');
var validator = require('validator');
var i18n = require('i18n');

var validators = {
  username: [
  {
    validator: function(val) {
      if (!val) {
        return false;
      }

      return validator.isAlphanumericDash(val[0]);
    },
    msg: i18n.__('user.username.begin_alphanumeric')
  }, {
    validator: function(val) {
      return validator.isAlphanumericDash(val);
    },
    msg: i18n.__('user.username.characters')
  }, {
    validator: function(val) {
      return validator.isLength(val, 3, 20);
    },
    msg: i18n.__('user.username.length')
  }],
  email: [{
    validator: function(val, callback) {
      _.each(val, function(email) {
        if (!email || !email.address || email.address === '') {
          return callback(true); // wrong error
        }

        if (!validator.isEmail(email.address)) {
          return callback(false);
        }
      });

      return callback(true);
    },
    msg: i18n.__('user.email.invalid')
  }, {
    validator: function(val, callback) {
      _.each(val, function(email) {
        if (!email || !email.address || email.address === '') {
          return callback(true); // wrong error
        }

        if (!validator.isLength(email.address, 0, 254)) {
          return callback(false);
        }
      });

      return callback(true);
    },
    msg: i18n.__('user.email.length')
  }, {
    validator: function(val, callback) {
      if (!val || val.length === 0) {
        return callback(false);
      }

      _.each(val, function(email) {
        if (!email || !email.address || email.address === '') {
          return callback(false);
        }
      });

      return callback(true);
    },
    msg: i18n.__('user.email.blank')
  }],
  password: [{
    validator: function(val) {
      return validator.isLength(val, 8);
    },
    msg: i18n.__('user.password.length')
  },
  {
    validator: function(val) {
      return val && val !== '';
    },
    msg: i18n.__('user.password.blank')
  }]
}

var UserSchema = new Schema({
  username: {
    type: String,
    index: { unique: true },
    required: true,
    validate: validators.username
  },

  emails: {
    type: [{
      address: { type: String, unique: true },
      description: { type: String, default: '' }
    }],
    required: true,
    validate: validators.email
  },

  password: {
    type: String,
    select: false,
    validate: validators.password
  },
  salt: { type: String, select: false },

  rank: { type: String, default: '' },

  steamId: { type: String },
  steamAvatars: [String],

  skype: { type: String },
  twitch: { type: String },
});

UserSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    // never reveal password or salt
    delete ret.password;
    delete ret.salt;

    return ret;
  }
});

UserSchema.pre('save', function(next) {
  var user = this;

  if (!user.isModified('password')) {
    return next();
  }

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
});

// callback returns (error || null, password === user password)
UserSchema.methods.checkPassword = function(password, callback) {
  if (!this.password || !this.salt) {
    return callback(i18n.__('user.validate.invalid'));
  }

  var currentPass = this.password;

  crypto.pbkdf2(password, this.salt, 64000, 256, function(err, derivedKey) {
    if (err) {
      return callback(err);
    }

    callback(null, currentPass === derivedKey.toString('hex'));
  });
}

module.exports = mongoose.model('User', UserSchema);
