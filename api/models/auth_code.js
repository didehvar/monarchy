var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AuthCodeSchema = new Schema({
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

  code: {
    type: String,
    unique: true,
    required: true
  },

  scope: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('AuthCode', AuthCodeSchema);
