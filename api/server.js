var express = require('express');
var i18n = require('i18n');
var mongoose = require('mongoose');
var passport = require('passport');
var debug = require('debug')('monarchy:server');

i18n.configure({
  locales: ['en'],
  directory: __dirname + '/locales'
});

mongoose.connect('mongodb://test:e5n$BoWO@ds033380.mongolab.com:63929/monarchy');
mongoose.Error.messages.general.required = i18n.__('database.{PATH}.required');

var app = module.exports = express();

app.use(require('body-parser').json());
app.use(i18n.init);
app.use(passport.initialize());

// app should only accept json
// app.use(function(req, res, next) {
//   if (req.get('Content-Type') !== 'application/json') {
//     return res.json({ error: res.__('request.not_json')});
//   }
//
//   next();
// });

require('./config/validator')();
require('./routes');

app.use(function(err, req, res, next) {
  debug(err);
  next(err);
});

var server = app.listen(8080, function() {
  console.log('listening at %s:%s', server.address().address, server.address().port);
});
