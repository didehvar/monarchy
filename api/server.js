var express = require('express');
var app = express();
var i18n = require('i18n');

var mongoose = require('mongoose');
mongoose.connect('mongodb://test:e5n$BoWO@ds033380.mongolab.com:33380/monarchy');

i18n.configure({
  locales: ['en'],
  directory: __dirname + '/locales',
});

mongoose.Error.messages.general.required = i18n.__('database.{PATH}.required');

app.use(require('body-parser').json());
app.use(require('cookie-parser')());
app.use(i18n.init);
app.use(require('./utility/error').init());
// app.use(require('./utility/validator')([]));

require('./utility/validator')();

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
