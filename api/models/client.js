var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClientSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },

  id: {
    type: String,
    unique: true,
    required: true
  },

  secret: {
    type: String,
    unique: true,
    required: true
  }
});

module.exports = mongoose.model('Client', ClientSchema);
