var restify = require('restify');
var bunyan = require('bunyan');

var log = bunyan.createLogger({ name: 'monarchy' });

var server = restify.createServer({
  name: 'monarchy',
  version: '0.0.1',
  log: log
});

var count = 0;
server.use(function foo(req, res, next) {
  count++;
  next();
});

function respond(req, res, next) {
  req.log.info('test');
  res.send({ name: req.params.name, count: count });
  next();
}

server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
