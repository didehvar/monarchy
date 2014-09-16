var restify = require('restify');
var bunyan = require('bunyan');
var i18n = require('i18n');
var mongoose = require('mongoose');

i18n.configure({
  locales: ['en'],
  directory: __dirname + '/locales'
})

mongoose.connect('mongodb://test:e5n$BoWO@ds033380.mongolab.com:33380/monarchy');
mongoose.Error.messages.general.required = i18n.__('database.{PATH}.required');

var server = module.exports = restify.createServer({
  name: 'monarchy',
  version: '0.0.1',
  log: bunyan.createLogger({
    name: 'monarchy',
    streams: [{
      level: 'debug',
      type: 'raw',
      stream: process.stdout
    }]
  })
});

server.use(restify.bodyParser());
server.use(i18n.init);

// server should only accept json
server.use(function(req, res, next) {
  if (!req.is('json')) {
    return res.json({ error: res.__('request.not_json')});
  }

  next();
});

server.on('uncaughtException', function(req, res, route, error) {
  log.error(error);
});

require('./config/validator')();
require('./routes');

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
