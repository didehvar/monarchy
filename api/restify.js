var restify = require('restify');
var bunyan = require('bunyan');

var log = bunyan.createLogger({ name: 'monarchy' });

var server = module.exports = restify.createServer({
  name: 'monarchy',
  version: '0.0.1',
  log: log
});

require('./routes');

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
