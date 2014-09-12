var express = require('express');
var app = express();
var i18n = require('i18n');
var validator = require('./utility/vldr');

var mongoose = require('mongoose');
mongoose.connect('mongodb://test:e5n$BoWO@ds033380.mongolab.com:33380/monarchy');

i18n.configure({
  locales: ['en'],
  directory: __dirname + '/locales',
});

app.use(require('body-parser').json());
app.use(require('cookie-parser')());
app.use(i18n.init);
app.use(validator.init);

// controllers
[
  'auth/login',
  'user'
].forEach(function(path) {
  require('./controllers/' + path)(app);
});

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});
