var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var validator = require('validator');
var i18n = require('i18n');

var addressValidators = [
  {
    validator: function(val) {
      return val && val !== '';
    },
    msg: i18n.__('user.email.blank')
  },
  {
    validator: function(val) {
      return validator.isEmail(val);
    },
    msg: i18n.__('user.email.invalid')
  },
  {
    validator: function(val) {
      return validator.isLength(val, 0, 254);
    },
    msg: i18n.__('user.email.length')
  },
  {
    validator: function(val, callback) {
      mongoose.model('Email').find({ address: val }, function(err, emails) {
        callback(err || emails.length === 0);
      });
    },
    msg: i18n.__('user.email.exists')
  }
];

var descriptionValidators = [
  {
    validator: function(val) {
      return val && val !== '';
    },
    msg: i18n.__('user.email.description.blank')
  },
  {
    validator: function(val) {
      return validator.isLength(val, 0, 50);
    },
    msg: i18n.__('user.email.description.length')
  }
];

var EmailSchema = new Schema({
  address: {
    type: String,
    index: { unique: true },
    required: true,
    validate: addressValidators
  },

  description: {
    type: String,
    required: true,
    validate: descriptionValidators
  }
});

module.exports = mongoose.model('Email', EmailSchema);
