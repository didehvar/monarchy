var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AccessTokenSchema = new Schema({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true
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

  // TODO: IMPLEMENT SCOPE
  // scope: {
  //   type: String,
  //   required: true
  // },

  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AccessToken', AccessTokenSchema);
