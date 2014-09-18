var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RefreshTokenSchema = new Schema({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client'
  },

  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  token: {
    type: String,
    unique: true,
    required: true
  },

  scope: {
    type: String,
    required: true
  },

  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);
